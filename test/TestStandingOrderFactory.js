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

    let owner = accounts[0]
    let payee = accounts[1]
    let orderIndex = 0
    let factory

    createOrder = function (payee, amount, interval, startTime, label) {
        return factory.createStandingOrder(payee, amount, interval, startTime.unix(), label, {
            from: owner,
            gas: 1000000
        }).then(function (result) {
            // now wait till transaction is mined, only then the contract is deployed.
            web3.eth.getTransactionReceiptMined(result.tx)
        }).then(function () {
            // now get the actual standingOrderContract
            return factory.getOwnOrderByIndex.call(orderIndex, {from: owner})
        }).then(function (address) {
            return StandingOrder.at(address)
        })
    }

    before('obtain factory', function () {
        return StandingOrderFactory.deployed().then(function (_factory) {
            factory = _factory
        })
    })

    it('should create a standingOrder', function () {
        let interval = 60 // one minute
        let startTime = moment().add(1, 'days') // First payment due in one day
        let amount = 100000000
        let label = 'testorder'

        return createOrder(payee, amount, interval, startTime, label).then(function (orderInstance) {
            assert(true)
        })
    })

    it('should throw when trying to create an order with 0 interval', function () {
        let interval = 0
        let startTime = moment().add(1, 'days') // First payment due in one day
        let amount = 100000000
        let label = 'testorder'
        return assert.isRejected(
            createOrder(payee, amount, interval, startTime, label),
            /out of gas/,
            'When factory creation throw, you always get "out-of-gas" error instead of invalid jump'
        )
    })

    it('should throw when trying to create an order with 0 amount', function () {
        let interval = 60 // one minute
        let startTime = moment().add(1, 'days') // First payment due in one day
        let amount = 0
        let label = 'testorder'
        return assert.isRejected(
            createOrder(payee, amount, interval, startTime, label),
            /out of gas/,
            'When factory creation throw, you always get "out-of-gas" error instead of invalid jump'
        )
    })

    it('should throw when trying to create an order with startTime in the past', function () {
        let interval = 60
        let startTime = moment().subtract(1, 'days') // First payment due yesterday
        let amount = 1000
        let label = 'testorder'
        return assert.isRejected(
            createOrder(payee, amount, interval, startTime, label),
            /out of gas/,
            'When factory creation throw, you always get "out-of-gas" error instead of invalid jump'
        )
    })

})
