import $ from 'jquery'
import Web3 from 'web3'
import 'bootstrap/dist/css/bootstrap.css'
import contract from 'truffle-contract'
import SimpleExchangeArtifacts from '../../build/contracts/SimpleExchange.json'
import './css/core-style.css'
import './js/classy-nav.min.js'
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

let SimpleExchange = contract(SimpleExchangeArtifacts)
SimpleExchange.setProvider(web3.currentProvider)
$('#transfer').click(async function transfer(){
  let account = localStorage.getItem('account')
  let tokenId = $('#tokenId').val()
  let address = $('#address').val()
  let cxExchange = await SimpleExchange.deployed()
  cxExchange.given(tokenId,address,{from:account})
  window.alert('Transfer successfully')
})
