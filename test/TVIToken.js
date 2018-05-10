var TVIToken = artifacts.require('./TVIToken.sol');

contract('TVIToken', function (accounts) {
    var tokenInstance;

    it('initail contract with initial values', function () {
        return TVIToken.deployed().then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.name();
        }).then(function (name) {
            assert.equal(name,'TVIToken' ,'we have correct token name');
            return tokenInstance.symbol();
        }).then(function (symbol) {
            assert.equal(symbol, 'TVIT', 'we have correct symbol');
            return tokenInstance.standard();
        }).then(function (standard) {
            assert.equal(standard, 'TVI Token v.3.3', 'we have correct standard')
        }) ;
    });

    it('sets total supply', function () {
       return TVIToken.deployed().then(function (instance) {
           tokenInstance = instance;
           return tokenInstance.totalSupply();
       }).then(function (totalSupply){
           assert.equal(totalSupply.toNumber(), 3000000, 'sets total supply to 3 millions');
           return tokenInstance.balanceOf(accounts[0]);
        }).then(function (adminBalance) {
           assert.equal(adminBalance.toNumber(), 3000000, 'it allocate the initial balance to admin')
       });
    });
    it('transfer the amount of tokens', function () {
         return TVIToken.deployed().then(function (instance) {
             tokenInstance = instance;
             //Test require statement first by transfering something larger then the sender balance;
             return tokenInstance.transfer.call(accounts[1],999999999999999999);
         }).then(assert.fail).catch(function (error) {
             assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
             return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
         }).then(function (success) {
             assert.equal(success, true, 'is return true');
             return tokenInstance.transfer(accounts[1],250000, {from: accounts[0]});
         }).then(function (receipt) {
             assert.equal(receipt.logs.length, 1, 'trigger one event');
             assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
             assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the token are transfered from');
             assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the token are transfered to');
             assert.equal(receipt.logs[0].args._value, 250000, 'logs transfer amount');

            return tokenInstance.balanceOf(accounts[1]);
         }).then(function (balance) {
             assert.equal(balance.toNumber(), 250000, 'adds the amount to the receiving account');
             return tokenInstance.balanceOf(accounts[0]);
         }).then(function (balance) {
             assert.equal(balance.toNumber(), 2750000, 'deducts the amount of the account');
         });
    });

    it('approves tokens for delegated transfer', function () {
       return TVIToken.deployed().then(function (instance) {
           tokenInstance = instance;
           return tokenInstance.approve.call(accounts[0], 100);
       }).then(function (success) {
           assert.equal(success, true, 'it returns true');
           return tokenInstance.approve(accounts[1],100,{from: accounts[0]});
       }).then(function (receipt) {
           assert.equal(receipt.logs.length, 1, 'trigger one event');
           assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
           assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the token are transfered by');
           assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the token are transfered to');
           assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
           return tokenInstance.allowance(accounts[0], accounts[1]);
       }).then(function (allowance) {
           assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
       });
    });
    it('handles delegated transfer', function () {
        return TVIToken.deployed().then(function (instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            //Transfer some tokens to fromAccount
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
        }).then(function (receipt) {
            //Approve spending account to spend account 10 tokens fromAccounts;
            return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
        }).then(function (receipt) {
            // try transfering something larger than the sender balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spendingAccount});
        }).then(assert.fail).catch(function (error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            // try transfer something larger then amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
        }).then(assert.fail).catch(function (error){
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approuved amount');
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function (success) {
            assert.equal(success, true);
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function (receipt) {
            assert.equal(receipt.logs.length, 1, 'trigger one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the token are transfered by');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the token are transfered to');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 90, 'deduct the amount from the sending account');
            return tokenInstance.balanceOf(toAccount);
        }).then(function (balance) {
            assert.equal(balance.toNumber(), 10, 'ads the amount from the receiving account' );
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function (allowance) {
            assert.equal(allowance.toNumber(), 0, 'deduct the amount from the allowance');
        });
    });



});
