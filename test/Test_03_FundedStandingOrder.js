var moment = require('moment')
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert

var StandingOrder = artifacts.require('StandingOrder')

describe('Funded standing order', function () {

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

    describe('Checking balances', function () {

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

     describe('Checking Withdrawal', function () {
        it('should throw when non-owner calls WithdrawOwnerFunds', function () {
            return assert.isRejected(
                order.WithdrawOwnerFunds({from: otherUser}),
                /invalid opcode/
            )
        })
    })

    describe('Checking Termination', function () {
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
})
