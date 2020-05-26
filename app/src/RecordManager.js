import $ from 'jquery'
import Web3 from 'web3'
import ipfsClient from 'ipfs-http-client'
import contract from 'truffle-contract'
import RandomGraphTokenArtifacts from '../../build/contracts/RandomGraphToken.json'
import SimpleExchangeArtifacts from '../../build/contracts/SimpleExchange.json'

class RecordManager{
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

  async render(host){
    this.host = host
    $(host).html('')
    let $root = $(`<div><table class="table table-striped"><caption>Transaction Record</caption>
    <thead><tr><th>Transaction hash</th><th>Token Id</th><th>From Address</th><th>To Address</th><th>Price</th></tr></thead>
    <tbody id="record-list"></tbody></table></div>`).appendTo(host)
    let cxExchange = await this.SimpleExchange.deployed()
    let num = await cxExchange.getRecordNum()
    for(let i=1;i<=num;i++){
      let record = await cxExchange.getRecord(i)
      let pr = this.web3.utils.fromWei(record.price,'ether')
      console.log(record)
      let html = `
        <tr>
          <td>${record.hasher}</td>
          <td>${record.tokenId}</td>
          <td>${record.from}</td>
          <td>${record.to}</td>
          <td>${pr}</td>
        </tr>
        `
      let $el = $(html).appendTo($root.find('#record-list'))
    }
    console.log($root)
  }
}

export default RecordManager
