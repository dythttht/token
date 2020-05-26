const RandomGraphToken = artifacts.require('RandomGraphToken')
const SimpleExchange = artifacts.require('SimpleExchange')

module.exports =  function(deployer){
  //deployer.deploy(EzToken)
  deployer.deploy(RandomGraphToken)
    .then(token => deployer.deploy(SimpleExchange,token.address))
}
