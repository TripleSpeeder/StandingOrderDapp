var moment = require('moment')
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
var assert = chai.assert;

var StandingOrder = artifacts.require('StandingOrder')
var StandingOrderFactory = artifacts.require('StandingOrderFactory')

contract('StandingOrderFactory', function (accounts) {

    let owner = accounts[0]
    let payee = accounts[1]
    let factory

    createOrder = function (payee, amount, interval, startTime, label) {
        return factory.createStandingOrder(payee, amount, interval, startTime.unix(), label, {
            from: owner,
            gas: 1000000
        }).then(function (result) {
            // now get the actual standingOrderContract
            let orderIndex = 0
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
        return assert.isFulfilled(createOrder(payee, amount, interval, startTime, label))
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

})
