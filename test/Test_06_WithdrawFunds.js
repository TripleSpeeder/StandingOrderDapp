var moment = require('moment')
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert

var StandingOrder = artifacts.require('StandingOrder')

let owner = web3.eth.accounts[0]
let payee = web3.eth.accounts[1]
let otherUser = web3.eth.accounts[2]
let paymentAmount = web3.toBigNumber(web3.toWei(1, 'finney'))
let fundAmount = web3.toBigNumber(web3.toWei(10, 'finney'))
let order, startBalance, newBalance, unclaimedFunds

describe('Checking withdraw', function () {

    before('Create a standingOrder', function () {
        let interval = 120 // two minutes
        let startTime = moment() // First payment due now
        let label = 'testorder'

        return StandingOrder.new(owner, payee, interval, paymentAmount, startTime.unix(), label,
            {
                from: owner,
            })
            .then(function (instance) {
                // console.log("Created new order at " + instance.address)
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

    before('Get owners current balance', function () {
        // get current owner balance
        startBalance = web3.eth.getBalance(owner)
        newBalance = startBalance
        assert.isAbove(startBalance.toNumber(), web3.toWei(10, 'ether'))
    })

    describe('Checking access', function () {
        let withdrawAmount = fundAmount.minus(paymentAmount)
        it('should throw when payee calls withdrawFunds', function () {
            return assert.isRejected(
                order.WithdrawOwnerFunds(withdrawAmount, {from: payee}),
                /invalid opcode/
            )
        })

        it('should throw when other user calls withdrawFunds', function () {
            return assert.isRejected(
                order.WithdrawOwnerFunds(withdrawAmount, {from: otherUser}),
                /invalid opcode/
            )
        })
    })

    describe('Checking withdraw', function () {
        let ownerFunds
        let expectedOwnerFunds = fundAmount.minus(paymentAmount)    // Expecting only one payment is due at the moment
        let gasUsed, gasPrice
        let withdrawAmount = paymentAmount  // withdraw one payment amount

        it('should get correct owner funds', function () {
            return order.getOwnerFunds.call({from: owner}).then(function (_ownerFunds) {
                ownerFunds = _ownerFunds
                assert(expectedOwnerFunds.equals(ownerFunds), 'Ownerfunds should be correct!')
            })
        })

        it('should do a partial withdraw', function done() {
            return order.WithdrawOwnerFunds(withdrawAmount, {from: owner})
                .then(function (result) {
                    assert.isNotNull(result.receipt.blockHash)
                    assert.isNotNull(result.receipt.blockNumber)
                    gasUsed = result.receipt.gasUsed
                    gasPrice = web3.eth.getTransaction(result.tx).gasPrice
                })
        })

        it('should correctly increase owner balance', function () {
            newBalance = web3.eth.getBalance(owner)
            let diff = newBalance.minus(startBalance) // how much did balance increase
            diff = diff.plus(gasPrice.mul(gasUsed)) // take gas usage into account
            if (!diff.equals(withdrawAmount)) {
                let missing = newBalance.minus(diff)
                console.log("Missing " + missing.toString() + " wei")
                console.log("Did you run testrpc with -g option? You HAVE to specify it to get correct value for web3.eth.gasPrice!")
            }
            assert(diff.equals(withdrawAmount), "Owner balance should be increased by withdraw amount")
        })

        it('should correctly decrease contract balance', function () {
            assert(web3.eth.getBalance(order.address).equals(fundAmount.minus(withdrawAmount)))
        })

        it('should throw when owner tries to withdraw more than available', function () {
            return assert.isRejected(
                order.WithdrawOwnerFunds(fundAmount, {from: owner}),
                /invalid opcode/
            )
        })

        it('should do a full withdraw', function done() {
            // calculate remaining ownerfunds that should be available
            let fullAmount = ownerFunds.minus(withdrawAmount)
            return assert.isFulfilled(
                order.WithdrawOwnerFunds(fullAmount, {from: owner})
            )
        })
    })
})

