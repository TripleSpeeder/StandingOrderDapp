var moment = require('moment')
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert

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
    let paymentAmount = web3.toWei(1, 'finney')
    let fundAmount = web3.toWei(10, 'finney')

    before('Create a standingOrder', function () {
        let interval = 60 // one minute
        let startTime = moment() // First payment due now
        let label = 'testorder'


        return StandingOrderFactory.deployed().then(function (factory) {
            return factory.createStandingOrder(payee, paymentAmount, interval, startTime.unix(), label, {
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

    before('Fund order', function () {
        return order.send(fundAmount, {from: owner})
            .then(function (result) {
                // now wait till transaction is mined
                web3.eth.getTransactionReceiptMined(result.tx)
            }).then(function () {
                // done!
        })
    })

    it('should have correct entitledfunds', function () {
        return order.getEntitledFunds({from: payee}).then(function (entitledFunds) {
            assert(entitledFunds.equals(paymentAmount), 'entitledFunds should match paymentAmount!')
        })
    })

    it('should have correct collectible funds', function () {
        return order.getUnclaimedFunds({from: owner}).then(function (unclaimedFunds) {
            assert(unclaimedFunds.equals(paymentAmount), 'unclaimedFunds should match paymentAmount!')
        })
    })

    it('should have funds available for owner withdraw', function () {
        return order.getOwnerFunds({from: owner}).then(function (ownerBalance) {
            assert(ownerBalance.equals(web3.toBigNumber(fundAmount).minus(paymentAmount)), 'ownerBalance should match fundAmount - paymentAmount!')
        })
    })

    it('should throw when owner calls collectFunds', function () {
        return assert.isRejected(
            order.collectFunds({from: owner}),
            /invalid opcode/
        )
    })

    it('should throw when payee calls WithdrawOwnerFunds', function () {
        return assert.isRejected(
            order.WithdrawOwnerFunds({from: payee}),
            /invalid opcode/
        )
    })

    xit('should correctly collect funds for payee', function () {
        let currentBalance
        let promiseA = web3.eth.getBalance(payee).then(function (balance) {
            currentBalance = balance
        })
        assert.isFulfilled(promiseA)
        // get current payee balance
        // call CollectFunds()
        // again get payee balance
        // balance diff should match entitled amount.
    })

    it('should be terminated after calling "withdrawAndTerminate', function () {
        // First verify order is not terminated
        assert.becomes(order.isTerminated({from: owner}), false, 'Contract already terminated before starting test!')

        return order.WithdrawAndTerminate({from: owner})
            .then(function (result) {
                // now wait till transaction is mined, only then the contract is deployed.
                web3.eth.getTransactionReceiptMined(result.tx)
            })
            .then(function () {
                // contract should be terminated now
                assert.becomes(order.isTerminated({from: owner}), true, 'Contract should now be terminated')
            })
    })
})
