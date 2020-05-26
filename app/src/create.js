import $ from 'jquery'
import 'bootstrap/dist/css/bootstrap.css'
import GraphArt from './GraphArt'
import TokenCreator from './TokenCreator'
import './css/core-style.css'
import './js/classy-nav.min.js'
import Web3 from 'web3'
let web3 = new Web3(ETH_NODE_URL ? ETH_NODE_URL : 'http://localhost:8545')
const EthUtil = require('ethereumjs-util');
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

let account = localStorage.getItem('account')
const ga = new GraphArt
const tc = new TokenCreator(account)

ga.toolbar.onSave = (svg,params) => {
  tc.createToken(svg,params)
}
