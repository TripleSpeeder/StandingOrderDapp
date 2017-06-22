var moment = require('moment')
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
var assert = chai.assert;

var StandingOrder = artifacts.require('StandingOrder')

describe('Default standing order', function () {

    let order
    let owner = web3.eth.accounts[0]
    let payee = web3.eth.accounts[1]

    before('Create a standingOrder', function () {
        let interval = 60 // one minute
        let startTime = moment().add(1, 'days') // First payment due in one day
        let amount = 100000000
        let label = 'testorder'

        return StandingOrder.new(owner, payee, interval, amount, startTime.unix(), label,
        {
            from: owner,
        })
        .then(function (instance) {
            order = instance
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
                // contract code should be replaced with 0x now
                assert.strictEqual('0x0', web3.eth.getCode(order.address), 'Contract address still not zeroed out')
            })
    })
})
