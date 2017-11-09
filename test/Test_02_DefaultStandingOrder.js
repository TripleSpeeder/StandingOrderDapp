var moment = require('moment')
var chai = require("chai")
var chaiAsPromised = require("chai-as-promised")

chai.use(chaiAsPromised)
var assert = chai.assert

var StandingOrder = artifacts.require('StandingOrder')

describe('Default standing order', function () {

    let order
    let owner = web3.eth.accounts[0]
    let payee = web3.eth.accounts[1]

    before('Create a standingOrder', async () => {
        let interval = 60 // one minute
        let startTime = moment().add(1, 'days') // First payment due in one day
        let amount = 100000000
        let label = 'testorder'
        order = await StandingOrder.new(owner, payee, interval, amount, startTime.unix(), label,
            { from: owner }
        )
    })

    it('should not be terminated after construction', () => {
        assert.becomes(order.isTerminated({from: owner}), false, 'Contract was terminated after construction')
    })

    it('should have no entitledfunds', async () => {
        let entitledBalance = await order.getEntitledFunds({from: owner})
        assert.isOk(entitledBalance.isZero(), 'entitledBalance is not zero!')
    })

    it('should have no collectible funds', async () => {
        let unclaimedFunds = await order.getUnclaimedFunds({from: owner})
        assert.isOk(unclaimedFunds.isZero(), 'unclaimedBalance is not zero!')
    })

    it('should be balanced - no funds missing, no funds available for withdraw', async () => {
        let ownerBalance = await order.getOwnerFunds({from: owner})
        assert.isOk(ownerBalance.isZero(), 'ownerBalance is not zero!')
    })

    it('should throw when payee calls collectFunds but there is nothing to collect', () => {
        return assert.isRejected(
            order.collectFunds({from: payee}),
            /invalid opcode/
        )
    })

    it('should throw when payee tries to terminate order', () => {
        return assert.isRejected(
            order.Terminate({from: payee}),
            /invalid opcode/
        )
    })

    it('should be terminated after calling "Terminate', async () => {
        await order.Terminate({from: owner})
        let isTerminated = await order.isTerminated({from: owner})
        assert.isOk(isTerminated, 'Contract should now be terminated')
    })
})
