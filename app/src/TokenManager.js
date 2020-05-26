import $ from 'jquery'
import Web3 from 'web3'
import ipfsClient from 'ipfs-http-client'
import contract from 'truffle-contract'
import RandomGraphTokenArtifacts from '../../build/contracts/RandomGraphToken.json'
import SimpleExchangeArtifacts from '../../build/contracts/SimpleExchange.json'

class TokenManager{
  constructor(account){
    this.account = account
    this.web3 = new Web3(ETH_NODE_URL ? ETH_NODE_URL : 'http://localhost:8545')
    this.ipfs = ipfsClient({
      host: IPFS_API_HOST ? IPFS_API_HOST : 'localhost',
      port: IPFS_API_PORT ? IPFS_API_PORT : 5001,
      protocol: 'http'
    })
	  this.RandomGraphToken = contract(RandomGraphTokenArtifacts)
    this.RandomGraphToken.setProvider(this.web3.currentProvider)
    this.SimpleExchange = contract(SimpleExchangeArtifacts)
    this.SimpleExchange.setProvider(this.web3.currentProvider)
  }
  async grantApproval(){
    let cxToken = await this.RandomGraphToken.deployed()
    let cxExchange = await this.SimpleExchange.deployed()
    await cxToken.setApprovalForAll(cxExchange.address,true,{from: this.account})
    console.log('approval granted')
  }
  async approvalGranted() {
    let cxToken = await this.RandomGraphToken.deployed()
    let cxExchange = await this.SimpleExchange.deployed()
    let approved = await cxToken.isApprovedForAll(this.account,cxExchange.address)
    return approved
  }
  async placeSellOrder(id,price){
    let cxExchange = await this.SimpleExchange.deployed()
    await cxExchange.listToken(id,price,{from:this.account})
  }
  async getTokens(){
    let cxToken = await this.RandomGraphToken.deployed()
    let cxExchange = await this.SimpleExchange.deployed()
    let totalTokens = await cxToken.balanceOf(this.account)
    let tokens = []
    for(let i=0;i<totalTokens;i++){
      let id = await cxToken.tokenOfOwnerByIndex(this.account,i)
      let uri = await cxToken.tokenURI(id)
      let meta = {}
      try{
	    meta = await fetch(uri).then(rsp => rsp.json())
      }catch(e){}
      let price = await cxExchange.listingPrice(id)
      tokens.push({id,uri,meta,price})
    }
    return tokens.sort((a,b)=>a.id.lt(b.id) ? 1 : -1)
  }
  renderApproval(approved,host) {
    if(approved) {
      $('<p>Exchange approved.</p>').appendTo(host)
    }else{
      let html = `<div id="approve-div">
                    <a href="#" id='approve' class="btn btn-danger btn-block">Grant Approval to Exchange</a>
                  </div>`
      $(html).appendTo(host).find('#approve').click(async () => {
        await this.grantApproval()
        await this.render(this.host)
      })

    }
  }
  renderToken(token,host){
    console.log(token);
    let price = this.web3.utils.fromWei(token.price,'ether')
    let box = `<div>${price} eth</div>`
    if(token.price.isZero()){
      box = `<div>
                <button class="btn btn-primary btn-sm">List</button>
    			<input type="text" value='0.1' >
    		  </div>`
    }
    let html = `
   	  <div class="col-xs-4 col-md-3 text-center col-margin-bottom-1 product">
    	<img src="${token.meta.image}">
    	<div class="info">
    	  <div>GAT ${token.id}</div>
    	  ${box}
        </div>
      </div>`
    let $el = $(html).appendTo(host)
    $el.find('button').click(async ()=>{
      let eth = $el.find('input').val()
      let price = this.web3.utils.toWei(eth,'ether')
      console.log('list',token,price)
      await this.placeSellOrder(token.id,price)
      console.log('token listed')
      await this.render(this.host)
    })
  }
  async render(host){
    this.host = host
    let approved = await this.approvalGranted()
    let tokens = await this.getTokens()
    $(host).html('')
    let $root = $(`<div><div id="exchange-info"></div><div id="nft-list"></div></div>`).appendTo(host)
    this.renderApproval(approved,$root.find('#exchange-info'))
    tokens.forEach(token => this.renderToken(token,$root.find('#nft-list')))
  }

}

export default TokenManager
