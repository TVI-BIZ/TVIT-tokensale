var TVIToken = artifacts.require("./TVIToken.sol");
var TVITokenSale = artifacts.require("./TVITokenSale.sol");

module.exports = function(deployer) {
    deployer.deploy(TVIToken, 3000000).then(function () {
        //Token price is 0.001Eth
        var tokenPrice = 1000000000000000 ;
      return deployer.deploy(TVITokenSale, TVIToken.address, tokenPrice);
    });
};
