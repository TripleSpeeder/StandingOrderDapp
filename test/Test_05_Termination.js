var moment = require('moment')
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert

var StandingOrder = artifacts.require('StandingOrder')

describe('Checking Termination with unclaimed balance', function () {

    this.timeout(15000);

    let order
    let owner = web3.eth.accounts[0]
    let payee = web3.eth.accounts[1]
    let otherUser = web3.eth.accounts[2]
    let paymentAmount = web3.toWei(1, 'finney')
    let fundAmount = web3.toWei(10, 'finney')

    before('Create a standingOrder', function () {
        let interval = 60 // one minute
        let startTime = moment() // First payment due now
        let label = 'testorder'

        return StandingOrder.new(owner, payee, interval, paymentAmount, startTime.unix(), label,
        {
            from: owner,
        })
        .then(function (instance) {
            order = instance
        })
    })

    before('Fund order', function () {
        return order.send(fundAmount, {from: owner})
            .then(function (result) {
                assert.isNotNull(result.receipt.blockHash)
                assert(web3.eth.getBalance(order.address).equals(fundAmount))
        })
    })

    describe('Checking balances before termination', function () {

        it('should have correct entitledfunds for payee', function () {
            return order.getEntitledFunds({from: payee}).then(function (entitledFunds) {
                assert(entitledFunds.equals(paymentAmount), 'entitledFunds should match paymentAmount!')
            })
        })

        it('should have correct collectible funds', function () {
            return order.getUnclaimedFunds({from: owner}).then(function (unclaimedFunds) {
                assert(unclaimedFunds.equals(paymentAmount), 'unclaimedFunds should match paymentAmount!')
            })
        })

        it('should have correct funds available for owner withdraw', function () {
            return order.getOwnerFunds({from: owner}).then(function (ownerBalance) {
                assert(ownerBalance.equals(web3.toBigNumber(fundAmount).minus(paymentAmount)),
                    'ownerBalance should match fundAmount - paymentAmount!')
            })
        })
    })

    // This test will only work if there are unclaimed funds in the contract. Otherwise the contract will immediately
    // selfdestruct!
    describe('Terminating', function () {

        let ownerfunds

        before('should not be terminated before', function () {
            assert.becomes(order.isTerminated({from: owner}), false, 'Contract already terminated before starting test!')
        })

        before('should get available ownerfunds', function() {
            order.getOwnerFunds.call({from: owner}).then(function (funds) {
                ownerfunds = funds
            })
        })

        it('should throw trying to terminate when ownerfunds are left', function () {
            return assert.isRejected(order.Terminate({from: payee}))
        })

        it('should do a full withdraw', function done() {
            return assert.isFulfilled(order.WithdrawOwnerFunds(ownerfunds, {from: owner}))
        })

        it('should be terminated after calling "Terminate', function () {
            return order.Terminate({from: owner})
                .then(function (result) {
                    // code should still exist on the blockchain
                    assert.notEqual('0x0', web3.eth.getCode(order.address), 'Contract code should still exist')
                    // contract should be terminated now
                    assert.becomes(order.isTerminated({from: owner}), true, 'Contract should now be terminated')
                })
        })
    })

    describe('Checking balances after termination', function () {

        it('should have correct entitledfunds for payee', function () {
            return order.getEntitledFunds({from: payee}).then(function (entitledFunds) {
                assert(entitledFunds.equals(paymentAmount), 'entitledFunds should match paymentAmount!')
            })
        })

        it('should have correct collectible funds', function () {
            return order.getUnclaimedFunds({from: owner}).then(function (unclaimedFunds) {
                assert(unclaimedFunds.equals(paymentAmount), 'unclaimedFunds should match paymentAmount!')
            })
        })

        it('should have zero funds available for owner withdraw', function () {
            return order.getOwnerFunds({from: owner}).then(function (ownerBalance) {
                assert(ownerBalance.isZero(),
                    'ownerBalance should be zero after termination!')
            })
        })
    })

    describe('getting unclaimed funds from terminated order', function () {
        before('order should be terminated', function () {
            assert.becomes(order.isTerminated({from: owner}), true, 'Contract not yet terminated!')
        })

        before('should have collectible funds', function () {
            return order.getUnclaimedFunds({from: owner}).then(function (unclaimedFunds) {
                assert(unclaimedFunds.greaterThan(0), 'unclaimedFunds should exist!')
            })
        })

        it('should successfully call collectFunds', function () {
            return assert.isFulfilled(order.collectFunds({from: payee}))
        })

        it('should no longer exist on the blockchain', function () {
            assert.equal('0x0', web3.eth.getCode(order.address), 'Contract code should not exist anymore')
        })
    })
})
