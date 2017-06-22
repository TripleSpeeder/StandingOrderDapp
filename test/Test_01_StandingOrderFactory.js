var moment = require('moment')
var chai = require("chai")
var chaiAsPromised = require("chai-as-promised")

chai.use(chaiAsPromised)
var assert = chai.assert

var StandingOrder = artifacts.require('StandingOrder')
var StandingOrderFactory = artifacts.require('StandingOrderFactory')

const helper = require('./helper')

contract('StandingOrderFactory', function (accounts) {

    let owner = accounts[0]
    let payee = accounts[1]
    let factory

    before('obtain factory', function () {
        return StandingOrderFactory.deployed().then(function (_factory) {
            factory = _factory
        })
    })

    describe('Create StandingOrder', function () {

        it('should throw when trying to create an order with 0 interval', function () {
            let interval = 0
            let startTime = moment().add(1, 'days') // First payment due in one day
            let amount = 100000000
            let label = 'testorder'
            return assert.isRejected(
                helper.createOrder(factory, owner, payee, amount, interval, startTime, label),
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
                helper.createOrder(factory, owner, payee, amount, interval, startTime, label),
                /out of gas/,
                'When factory creation throw, you always get "out-of-gas" error instead of invalid jump'
            )
        })

        it('should create a standingOrder when valid parameters are used', function () {
            let interval = 60 // one minute
            let startTime = moment().add(1, 'days') // First payment due in one day
            let amount = 100000000
            let label = 'testorder'
            return assert.isFulfilled(helper.createOrder(factory, owner, payee, amount, interval, startTime, label))
        })

    })

})
