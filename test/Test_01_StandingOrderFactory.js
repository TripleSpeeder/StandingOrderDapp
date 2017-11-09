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

    before('obtain factory', async () => {
        factory = await StandingOrderFactory.deployed()
    })

    describe('Create StandingOrder', function () {

        it('should throw when trying to create an order with 0 interval', () => {
            let interval = 0
            let startTime = moment().add(1, 'days') // First payment due in one day
            let amount = 100000000
            let label = 'testorder'
            return assert.isRejected(
                helper.createOrder(factory, owner, payee, amount, interval, startTime, label),
                /*/out of gas/,*/
                /invalid opcode/,
                'When factory creation throw, you always get "out-of-gas" error instead of invalid jump'
            )
        })

        it('should throw when trying to create an order with 0 amount', () => {
            let interval = 60 // one minute
            let startTime = moment().add(1, 'days') // First payment due in one day
            let amount = 0
            let label = 'testorder'
            return assert.isRejected(
                helper.createOrder(factory, owner, payee, amount, interval, startTime, label),
                /*/out of gas/,*/
                /invalid opcode/,
                'When factory creation throw, you always get "out-of-gas" error instead of invalid jump'
            )
        })

        it('should throw when trying to create an order with empty label', () => {
            let interval = 60 // one minute
            let startTime = moment().add(1, 'days') // First payment due in one day
            let amount = 100000000
            let label = ''
            return assert.isRejected(
                helper.createOrder(factory, owner, payee, amount, interval, startTime, label),
                /*/out of gas/,*/
                /invalid opcode/,
                'When factory creation throw, you always get "out-of-gas" error instead of invalid jump'
            )
        })

        it('should throw when trying to create an order with label shorter than 3 chars', () => {
            let interval = 60 // one minute
            let startTime = moment().add(1, 'days') // First payment due in one day
            let amount = 100000000
            let label = 'ab'
            return assert.isRejected(
                helper.createOrder(factory, owner, payee, amount, interval, startTime, label),
                /*/out of gas/,*/
                /invalid opcode/,
                'When factory creation throw, you always get "out-of-gas" error instead of invalid jump'
            )
        })

        it('should create a standingOrder when valid parameters are used', () => {
            let interval = 60 // one minute
            let startTime = moment().add(1, 'days') // First payment due in one day
            let amount = 100000000
            let label = 'testorder'
            return assert.isFulfilled(helper.createOrder(factory, owner, payee, amount, interval, startTime, label))
        })

        it('should set correct owner', async () => {
            let interval = 60 // one minute
            let startTime = moment().add(1, 'days') // First payment due in one day
            let amount = 100000000
            let label = 'testorder'
            let order, _owner
            order = await helper.createOrder(factory, owner, payee, amount, interval, startTime, label)
            _owner = await order.owner()
            assert.equal(owner, _owner)
        })

    })

})
