var TVIToken = artifacts.require("./TVIToken.sol");
var TVITokenSale = artifacts.require("./TVITokenSale.sol");


contract('TVITokenSale', function (accounts) {
   var tokenInstance;
   var tokenSaleInstance;
   var tokenPrice = 1000000000000000000 ; // in wei
   var buyer = accounts[1];
   var admin = accounts[0];
   var tokensAvailable = 2000000;
   var numberOfTokens;

   it('initialize the contract with correct values', function () {
      return TVITokenSale.deployed().then(function (instance) {
          tokenSaleInstance = instance;
          return tokenSaleInstance.address
      }).then(function (address) {
          assert.notEqual(address, 0x0, 'has contract address');
          return tokenSaleInstance.tokenContract();
      }).then(function (address) {
          assert.notEqual(address, 0x0, 'has token contract address');
          return tokenSaleInstance.tokenPrice();
      }).then(function (price) {
          assert.equal(price, tokenPrice, 'token price is correct');
      });
   });
   it('facilitating token buying', function () {
       return TVIToken.deployed().then(function (instance) {
           //Grab tokeinstance first
           tokenInstance = instance;
           return TVITokenSale.deployed();
       }).then(function (instance) {
           //then grab token sale instance
           tokenSaleInstance = instance;
           //Provison some tokens
           return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});
       }).then(function(receipt) {
           numberOfTokens = 10;
           return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })
       }).then(function(receipt) {
           assert.equal(receipt.logs.length, 1, 'triggers one event');
           assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
           assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
           assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
           return tokenSaleInstance.tokensSold();
       }).then(function(amount) {
           assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
           return tokenInstance.balanceOf(buyer);
       }).then(function(balance) {
           assert.equal(balance.toNumber(), numberOfTokens);
           return tokenInstance.balanceOf(tokenSaleInstance.address);
       }).then(function(balance) {
           assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
           // Try to buy tokens different from the ether value
           return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
       }).then(assert.fail).catch(function(error) {
           assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
           return tokenSaleInstance.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })
       }).then(assert.fail).catch(function(error) {
           assert(error.message.indexOf('revert') >= 0, 'cannot purchase more tokens than available');
       });
   });
    it('ends token sale', function () {
        return TVIToken.deployed().then(function (instance) {
            //Grab tokeinstance first
            tokenInstance = instance;
            return TVITokenSale.deployed();
        }).then(function (instance) {
            //then grab token sale instance
            tokenSaleInstance = instance;
            //Try to end sale another account
            return tokenSaleInstance.endSale({from: buyer});
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert' >= 0, 'best be admin end the sale'));
            // end sale as admin
            return tokenSaleInstance.endSale({from: admin});
        }).then(function (receipt) {
            return tokenInstance.balanceOf(admin);
        }).then(function (balance) {
            assert.equal(balance.toNumber(),2999990, 'returns all unsold token to admin');
            return tokenSaleInstance.tokenPrice();
        }).then(function (price) {
            assert.equal(price.toNumber(), 0, 'token price was reset');
        });
    });

});
