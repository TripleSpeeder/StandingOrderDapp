var moment = require('moment')
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
var assert = chai.assert;

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
    let owner = accounts[0]
    let payee = accounts[1]
    let orderAddress

    before('Create a standingOrder', function () {
        let interval = 60 // one minute
        let startTime = moment().add(1, 'days') // First payment due in one day
        let amount = 100000000
        let label = 'testorder'


        return StandingOrderFactory.deployed().then(function (factory) {
            return factory.createStandingOrder(payee, amount, interval, startTime.unix(), label, {
                from: owner,
                gas: 1000000
            }).then(function (result) {
                // now wait till transaction is mined, only then the contract is deployed.
                web3.eth.getTransactionReceiptMined(result.tx)
            }).then(function () {
                // now get the actual standingOrderContract
                return factory.getOwnOrderByIndex.call(0, {from: owner})
            }).then(function (address) {
                orderAddress = address
                return StandingOrder.at(address)
            }).then(function (orderInstance) {
                order = orderInstance
            })
        })
    })

    it('should not be terminated after construction', function () {
        assert.becomes(order.isTerminated({from: owner}), false, 'Contract was terminated after construction')
    })

    it('should have no entitledfunds', function () {
        return order.getEntitledFunds({from: owner}).then(function (entitledBalance) {
            assert.equal(true, entitledBalance.isZero(), 'entitledBalance is not zero!')
        })
    })

    it('should have no collectible funds', function () {
        return order.getUnclaimedFunds({from: owner}).then(function (unclaimedBalance) {
            assert.equal(true, unclaimedBalance.isZero(), 'unclaimedBalance is not zero!')
        })
    })

    it('should be balanced - no funds missing, no funds available for withdraw', function () {
        return order.getOwnerFunds({from: owner}).then(function (ownerBalance) {
            assert.equal(true, ownerBalance.isZero(), 'ownerBalance is not zero!')
        })
    })

    it('should throw when payee calls collectFunds but there is nothing to collect', function () {
        return assert.isRejected(
            order.collectFunds({from: payee}),
            /invalid opcode/
        )
    })

    it('should throw when payee tries to terminate order', function () {
        return assert.isRejected(
            order.WithdrawAndTerminate({from: payee}),
            /invalid opcode/
        )
    })

    it('should be terminated after calling "withdrawAndTerminate', function () {
        // First check that code is actually there
        assert.notEqual('0x0', web3.eth.getCode(order.address), 'Contract address still not zeroed out')

        return order.WithdrawAndTerminate({from: owner})
            .then(function (result) {
                // now wait till transaction is mined, only then the contract is deployed.
                web3.eth.getTransactionReceiptMined(result.tx)
            })
            .then(function () {
                // contract code should be replaced with 0x now
                assert.strictEqual('0x0', web3.eth.getCode(order.address), 'Contract address still not zeroed out')
            })
    })
})
