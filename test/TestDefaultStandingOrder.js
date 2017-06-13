var moment = require('moment')
var expect = require('chai').expect

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
        return order.isTerminated({from: owner}).then(function (isTerminated) {
            assert.equal(isTerminated, false, 'Contract was terminated after construction')
        })
    })

    it('should have no entitledfunds', function () {
        return order.getEntitledFunds({from: owner}).then(function (entitledBalance) {
            assert.equal(0, entitledBalance, 'entitledBalance is not zero!')
        })
    })

    it('should have no collectible funds', function () {
        return order.getUnclaimedFunds({from: owner}).then(function (unclaimedBalance) {
            assert.equal(0, unclaimedBalance, 'unclaimedBalance is not zero!')
        })
    })

    it('should be balanced - no funds missing, no funds available for withdraw', function () {
        return order.getOwnerFunds({from: owner}).then(function (ownerBalance) {
            assert.equal(0, ownerBalance, 'ownerBalance is not zero!')
        })
    })

    it('should throw when payee calls collectFunds but there is nothing to collect', function () {
        return order.collectFunds({from: payee})
            .then(function (result) {
                assert(false, 'collectFunds should have thrown!')
            }).catch(function (e) {
                assert(true, 'caught error trying to collect funds')
            })
    })

    it('should throw when payee tries to terminate order', function () {
        return order.WithdrawAndTerminate({from: payee})
            .then(function (result) {
                assert(false, 'WithdrawAndTerminate should have thrown!')
            }).catch(function (e) {
                assert(true, 'caught error trying terminate by payee')
            })
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
