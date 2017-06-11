var moment = require('moment')

// Include web3 library so we can query accounts.
const Web3 = require('web3')
// Instantiate new web3 object pointing toward an Ethereum node.
let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

var StandingOrder = artifacts.require('StandingOrder')
var StandingOrderFactory = artifacts.require('StandingOrderFactory')

web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
    var transactionReceiptAsync
    interval = interval ? interval : 500
    transactionReceiptAsync = function (txnHash, resolve, reject) {
        web3.eth.getTransactionReceipt(txnHash, (error, receipt) => {
            if (error) {
                reject(error)
            } else {
                if (receipt == null) {
                    setTimeout(function () {
                        transactionReceiptAsync(txnHash, resolve, reject)
                    }, interval)
                } else {
                    resolve(receipt)
                }
            }
        })
    }

    if (Array.isArray(txnHash)) {
        var promises = []
        txnHash.forEach(function (oneTxHash) {
            promises.push(web3.eth.getTransactionReceiptMined(oneTxHash, interval))
        })
        return Promise.all(promises)
    } else {
        return new Promise(function (resolve, reject) {
            transactionReceiptAsync(txnHash, resolve, reject)
        })
    }
}

contract('StandingOrderFactory', function (accounts) {

    let order

    // it('should create a standingOrder', function () {
    before('Create a standingOrder', function () {
        var owner = accounts[0]
        var payee = accounts[1]
        var interval = 60 // one minute
        var startTime = moment() // now
        var amount = 100000000
        var label = 'testorder'

        return StandingOrderFactory.deployed().then(function (factory) {
            return factory.createStandingOrder(payee, amount, interval, startTime.unix(), label, {
                from: owner,
                gas: 1000000
            }).then(function (result) {
                // now wait till transaction is mined, only then the contract is deployed.
                return web3.eth.getTransactionReceiptMined(result.tx)
            }).then(function (receipt) {
                return StandingOrder.at(receipt.contractAddress)
            }).then(function (orderInstance) {
                order = orderInstance
            })
        })
    })

    it('should not be terminated after construction', function () {
        return order.isTerminated.call(accounts[0]).then(function (isTerminated) {
            assert.equal(isTerminated, false, 'Contract was terminated after construction')
        })
    })

    /*
     it("should put 10000 MetaCoin in the first account", function() {
     return MetaCoin.deployed().then(function(instance) {
     return instance.getBalance.call(accounts[0]);
     }).then(function(balance) {
     assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
     });
     });
     it("should send coin correctly", function() {
     var meta;

     // Get initial balances of first and second account.
     var account_one = accounts[0];
     var account_two = accounts[1];

     var account_one_starting_balance;
     var account_two_starting_balance;
     var account_one_ending_balance;
     var account_two_ending_balance;

     var amount = 10;

     return MetaCoin.deployed().then(function(instance) {
     meta = instance;
     return meta.getBalance.call(account_one);
     }).then(function(balance) {
     account_one_starting_balance = balance.toNumber();
     return meta.getBalance.call(account_two);
     }).then(function(balance) {
     account_two_starting_balance = balance.toNumber();
     return meta.sendCoin(account_two, amount, {from: account_one});
     }).then(function() {
     return meta.getBalance.call(account_one);
     }).then(function(balance) {
     account_one_ending_balance = balance.toNumber();
     return meta.getBalance.call(account_two);
     }).then(function(balance) {
     account_two_ending_balance = balance.toNumber();

     assert.equal(account_one_ending_balance, account_one_starting_balance - amount, "Amount wasn't correctly taken from the sender");
     assert.equal(account_two_ending_balance, account_two_starting_balance + amount, "Amount wasn't correctly sent to the receiver");
     });
     });*/
})
