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
let order, startBalance, newBalance

describe('Checking withdraw', function () {

    before('Create a standingOrder', async () => {
        let interval = 120 // two minutes
        let startTime = moment() // First payment due now
        let label = 'testorder'
        order = await StandingOrder.new(owner, payee, interval, paymentAmount, startTime.unix(), label,
            { from: owner }
        )
    })

    before('Fund order', async () => {
        let result = await order.send(fundAmount, {from: owner})
        assert.isNotNull(result.receipt.blockHash)
        assert(web3.eth.getBalance(order.address).equals(fundAmount))
    })

    before('Get owners current balance', () => {
        // get current owner balance
        startBalance = web3.eth.getBalance(owner)
        newBalance = startBalance
        assert.isAbove(startBalance.toNumber(), parseInt(web3.toWei(10, 'ether')))
    })

    describe('Checking access', function () {
        let withdrawAmount = fundAmount.minus(paymentAmount)

        it('should throw when payee calls withdrawFunds', () => {
            return assert.isRejected(
                order.WithdrawOwnerFunds(withdrawAmount, {from: payee}),
                /invalid opcode/
            )
        })

        it('should throw when other user calls withdrawFunds', () => {
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

        it('should get correct owner funds', async () => {
            ownerFunds = await order.getOwnerFunds.call({from: owner})
            assert(expectedOwnerFunds.equals(ownerFunds), 'Ownerfunds should be correct!')
        })

        it('should do a partial withdraw', async () => {
            let result = await order.WithdrawOwnerFunds(withdrawAmount, {from: owner})
            assert.isNotNull(result.receipt.blockHash)
            assert.isNotNull(result.receipt.blockNumber)
            gasUsed = result.receipt.gasUsed
            gasPrice = web3.eth.getTransaction(result.tx).gasPrice
            // there should be one log event named "Withdraw"
            let withdrawEvent = result.logs.find(function (logentry) {
                return logentry.event == 'Withdraw'
            })
            assert.isDefined(withdrawEvent, 'No Withdraw event in transaction logs')
            // Event should have arg 'amount'
            let eventAmount = withdrawEvent.args['amount']
            assert.isDefined(eventAmount, 'No amount info in Withdraw event')
            assert(withdrawAmount.equals(eventAmount), 'Amount logged in Withdraw event not matching withdrawAmount')
        })

        it('should correctly increase owner balance', () => {
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

        it('should correctly decrease contract balance', () => {
            assert(web3.eth.getBalance(order.address).equals(fundAmount.minus(withdrawAmount)))
        })

        it('should throw when owner tries to withdraw more than available', () => {
            return assert.isRejected(
                order.WithdrawOwnerFunds(fundAmount, {from: owner}),
                /invalid opcode/
            )
        })

        it('should do a full withdraw', async () => {
            // calculate remaining ownerfunds that should be available
            let fullAmount = ownerFunds.minus(withdrawAmount)
            let result = await order.WithdrawOwnerFunds(fullAmount, {from: owner})
            // there should be one log event named "Withdraw"
            let withdrawEvent = result.logs.find(function (logentry) {
                return logentry.event == 'Withdraw'
            })
            assert.isDefined(withdrawEvent, 'No Withdraw event in transaction logs')
            // Event should have arg 'amount'
            let eventAmount = withdrawEvent.args['amount']
            assert.isDefined(eventAmount, 'No amount info in Withdraw event')
            assert(fullAmount.equals(eventAmount), 'Amount logged in Withdraw event not matching requested amount')
        })
    })
})

