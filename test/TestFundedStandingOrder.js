var moment = require('moment')
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert

var StandingOrder = artifacts.require('StandingOrder')
var StandingOrderFactory = artifacts.require('StandingOrderFactory')

contract('StandingOrderFactory', function (accounts) {

    let order
    let owner = accounts[0]
    let payee = accounts[1]
    let otherUser = accounts[2]
    let paymentAmount = web3.toWei(1, 'finney')
    let fundAmount = web3.toWei(10, 'finney')

    // TODO: Don't use factory here, instead just manually create an order instance!
    before('Create a standingOrder', function () {
        let interval = 60 // one minute
        let startTime = moment() // First payment due now
        let label = 'testorder'

        return StandingOrderFactory.deployed().then(function (factory) {
            return factory.createStandingOrder(payee, paymentAmount, interval, startTime.unix(), label, {
                from: owner,
                gas: 1000000
            }).then(function (result) {
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
                assert.isNotNull(result.receipt.blockHash)
                assert(web3.eth.getBalance(order.address).equals(fundAmount))
                console.log("Order funded!")
        })
    })

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

    it('should have funds available for owner withdraw', function () {
        return order.getOwnerFunds({from: owner}).then(function (ownerBalance) {
            assert(ownerBalance.equals(web3.toBigNumber(fundAmount).minus(paymentAmount)),
                'ownerBalance should match fundAmount - paymentAmount!')
        })
    })

    it('should throw when owner calls collectFunds', function () {
        return assert.isRejected(
            order.collectFunds({from: owner}),
            /invalid opcode/
        )
    })

    it('should throw when non-payee calls collectFunds', function () {
        return assert.isRejected(
            order.collectFunds({from: otherUser}),
            /invalid opcode/
        )
    })

    it('should throw when non-owner calls WithdrawOwnerFunds', function () {
        return assert.isRejected(
            order.WithdrawOwnerFunds({from: otherUser}),
            /invalid opcode/
        )
    })

    // This test will only work if there are unclaimed funds in the contract. Otherwise the contract will immediately
    // selfdestruct!
    it('should be terminated after calling "withdrawAndTerminate', function () {
        // First verify order is not terminated
        assert.becomes(order.isTerminated({from: owner}), false, 'Contract already terminated before starting test!')

        return order.WithdrawAndTerminate({from: owner})
            .then(function (result) {
                // contract should be terminated now, but still existing
                assert.becomes(order.isTerminated({from: owner}), true, 'Contract should now be terminated')
            })
    })
})
