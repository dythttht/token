import 'bootstrap/dist/css/bootstrap.css'
import $ from 'jquery'
import Web3 from 'web3'
import './app.css'
import ipfsClient from 'ipfs-http-client'
import contract from 'truffle-contract'
import RandomGraphTokenArtifacts from '../../build/contracts/RandomGraphToken.json'
import SimpleExchangeArtifacts from '../../build/contracts/SimpleExchange.json'
import './css/core-style.css'
import './js/classy-nav.min.js'
const EthUtil = require('ethereumjs-util');
let web3 = new Web3(ETH_NODE_URL ? ETH_NODE_URL : 'http://localhost:8545')

$("#login").click(async function login(){
  let accounts = await web3.eth.getAccounts()
  console.log(JSON.stringify(accounts))
  let privateKey = $("#private").val()
  console.log(JSON.stringify(privateKey))
  let publicKey = EthUtil.privateToPublic(new Buffer(privateKey, 'hex'));
  let account ="0x"+ EthUtil.publicToAddress(publicKey).toString('hex');
  console.log(JSON.stringify(account))
  for(let i=0;i<accounts.length;i++){
    if(account == accounts[i].toLowerCase()){
      localStorage.setItem('account',account)
      window.location = "index1.html"
      return
    }
  }
  window.alert("No Account")
})

class TokenList {
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
  async getTokens(){
    let cxToken = await this.RandomGraphToken.deployed()
    let cxExchange = await this.SimpleExchange.deployed()
    let totalTokens = await cxToken.totalSupply()
    let tokens = []
    for(let i=0;i<totalTokens;i++){
      let id = await cxToken.tokenByIndex(i)
      let price = await cxExchange.listingPrice(id)
      if(price.isZero()) continue
      let uri = await cxToken.tokenURI(id)
      let meta = {}
      try{
	    meta = await fetch(uri).then(rsp => rsp.json())
      }catch(e){}
      let owner = await cxToken.ownerOf(id)
      tokens.push({id,uri,meta,price,owner})
    }
    return tokens.sort((a,b)=>a.id.lt(b.id) ? 1 : -1)
  }
  async buyToken(id,price){
    localStorage.setItem("productid",id)
    window.location = "product.html"

    //let cxExchange = await this.SimpleExchange.deployed()
    //let hasher = await cxExchange.buyToken(id,{from:this.account,value:price})
    //console.log(hasher.tx)
    //await cxExchange.record(hasher.tx,{from:this.account})
  }
  renderToken(token,host){
    console.log(token);
    let price = this.web3.utils.fromWei(token.price,'ether')
    let disabled = token.owner == this.account ? 'disabled': ''
    let box= `<div>
  			    <button class="btn btn-primary btn-sm" ${disabled}>
    			  Buy for ${price} eth
     			</button>
    		  </div>`
    let html = `
   	  <div class="col-xs-4 col-md-3 text-center col-margin-bottom-1 product">
    	<img src="${token.meta.image}">
        <div class="info">
    	  <div>GAT ${token.id}</div>
   		  ${box}
    	</div>
      </div>`
    let $el = $(html).appendTo(host).find('button').click(async ()=>{
      await this.buyToken(token.id,token.price)
      //console.log('token transfered')
      //this.render(this.host)
    })
  }
  async render(host){
   	this.host = host
    $(host).html('')
    const tokens = await this.getTokens()
    tokens.forEach(token => this.renderToken(token,host))
  }
}

let account = localStorage.getItem('account')
const tl = new TokenList(account)
tl.render('#nft-list')
