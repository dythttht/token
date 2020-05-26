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

class ProductDetail{
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

  async getToken(){
    let cxToken = await this.RandomGraphToken.deployed()
    let cxExchange = await this.SimpleExchange.deployed()
    let productid = localStorage.getItem('productid')
    let productprice = await cxExchange.listingPrice(productid)
    let uri = await cxToken.tokenURI(productid)
    let meta = {}
    try{
    meta = await fetch(uri).then(rsp => rsp.json())
    }catch(e){}
    let owner = await cxToken.ownerOf(productid)
    let product = {productid,productprice,uri,meta,owner}
    return product
  }
  async buyToken(id,price){
    let cxExchange = await this.SimpleExchange.deployed()
    let hasher = await cxExchange.buyToken(id,{from:this.account,value:price})
    console.log(hasher.tx)
    await cxExchange.record(hasher.tx,{from:this.account})
  }
  rendertoken(product,host){
    let price = this.web3.utils.fromWei(product.productprice,'ether')
    let html = `<section class="single_product_details_area d-flex align-items-center"><div class="single_product_thumb clearfix">
          <img src="${product.meta.image}" alt="">
    </div>
    <div class="single_product_desc clearfix">
        <span></span>
        <a href="">
            <h2>GAT ${product.productid}</h2>
        </a>
        <p class="product-price">${price}eth</p>
        <p class="product-desc">tokenId: ${product.productid}</p>
        <p class="product-desc">graphType: BalancedTree</p>
        <p class="product-desc">owner by: ${product.owner}</p>
        <div class="cart-form clearfix">
            <div class="cart-fav-box d-flex align-items-center">
                <button class="btn essence-btn">Buy</button>
            </div>
        </div>
    </div> </section>`
    let $el = $(html).appendTo(host).find('button').click(async ()=>{
      await this.buyToken(product.productid,product.productprice)
      window.location='market.html'
    })
  }

  async render(host){
    this.host=host
    $(host).html('')
    const product = await this.getToken()
    this.rendertoken(product,host)
  }
}

let account = localStorage.getItem('account')
const pd = new ProductDetail(account)
pd.render('#pro')
