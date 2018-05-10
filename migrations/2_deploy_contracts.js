var TVIToken = artifacts.require("./TVIToken.sol");

module.exports = function(deployer) {
    deployer.deploy(TVIToken, 3000000);
};
