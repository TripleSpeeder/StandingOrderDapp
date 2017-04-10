var StandingOrderFactory = artifacts.require("StandingOrderFactory");

module.exports = function(deployer, network, accounts) {
  // deployer.deploy(StandingOrder, accounts[1], accounts[2], 60, 1);
  deployer.deploy(StandingOrderFactory);

};
