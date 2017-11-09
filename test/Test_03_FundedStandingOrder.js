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
    let otherUser2 = web3.eth.accounts[3]
    let paymentAmount = web3.toBigNumber(web3.toWei(1, 'finney'))
    let fundAmount = web3.toBigNumber(web3.toWei(10, 'finney'))
    let interval = 5 // seconds

    before('Create a standingOrder', async () => {
        let startTime = moment() // First payment due now
        let label = 'testorder'
        order = await StandingOrder.new(owner, payee, interval, paymentAmount, startTime.unix(), label,
            { from: owner }
        )
    })

    it('Funding order', async () => {
        let result = await order.send(fundAmount, {from: owner})

        assert.isNotNull(result.receipt.blockHash)

        // there should be one log event named "Fund"
        let fundEvent = result.logs.find(function (logentry) {
            return logentry.event == 'Fund'
        })
        assert.isDefined(fundEvent, 'No Fund event in transaction logs')

        // Event should have arg 'amount'
        let eventAmount = fundEvent.args['amount']
        assert.isDefined(eventAmount, 'No amount info in Fund event')
        assert(fundAmount.equals(eventAmount), 'Amount logged in Fund event not matching fundAmount')
        assert(web3.eth.getBalance(order.address).equals(fundAmount), 'Order balance not matching fundAmount')
    })

    describe('Checking initial balances', () => {

        it('should have correct entitledfunds for payee', async () => {
            let entitledFunds = await order.getEntitledFunds({from: payee})
            assert(entitledFunds.equals(paymentAmount), 'entitledFunds should match paymentAmount!')
        })

        it('should have correct collectible funds', async () => {
            let unclaimedFunds = await order.getUnclaimedFunds({from: owner})
            assert(unclaimedFunds.equals(paymentAmount), 'unclaimedFunds should match paymentAmount!')
        })

        it('should have correct funds available for owner withdraw', async () => {
            let ownerBalance = await order.getOwnerFunds({from: owner})
            assert(ownerBalance.equals(fundAmount.minus(paymentAmount)),
                'ownerBalance should match fundAmount - paymentAmount!')
        })
    })

    describe('Checking balances after one interval', function () {

        this.timeout(interval * 1000 * 2)

        before('wait for one interval', () => {
            return new Promise(function (resolve) {
                setTimeout(resolve, interval * 1000)
            })
        })

        before('Create a dummy transaction for testrpc so we have a new block mined', () => {
            web3.eth.sendTransaction({from: otherUser, to: otherUser2}, function (err, address) {
                if (err)
                    assert(false, 'sending dummy transaction failed')
                else
                    assert(true)
            })
        })

        it('should have correct entitledfunds for payee', async () => {
            let entitledFunds = await order.getEntitledFunds({from: payee})
            assert(entitledFunds.equals(paymentAmount.times(2)), 'entitledFunds should match 2 times paymentAmount!')
        })

        it('should have correct collectible funds', async () => {
            let unclaimedFunds = await order.getUnclaimedFunds({from: owner})
            assert(unclaimedFunds.equals(paymentAmount.times(2)), 'unclaimedFunds should match 2 times paymentAmount!')
        })

        it('should have correct funds available for owner withdraw', async () => {
            let ownerBalance = await order.getOwnerFunds({from: owner})
            assert(ownerBalance.equals(fundAmount.minus(paymentAmount.times(2))),
                    'ownerBalance should match fundAmount - 2 times paymentAmount!')
        })
    })
})
