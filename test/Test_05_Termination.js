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
    let paymentAmount = web3.toBigNumber(web3.toWei(1, 'finney'))
    let fundAmount = web3.toBigNumber(web3.toWei(10, 'finney'))
    let interval = 8
    let startTime

    before('Create a standingOrder', async () => {
        startTime = moment() // First payment due now
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

    describe('Checking balances before termination', function () {

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
            assert(ownerBalance.equals(web3.toBigNumber(fundAmount).minus(paymentAmount)),
                'ownerBalance should match fundAmount - paymentAmount!')
        })
    })

    describe('Terminating', function () {

        let ownerfunds

        before('should not be terminated before', () => {
            assert.becomes(order.isTerminated({from: owner}), false, 'Contract already terminated before starting test!')
        })

        before('should get available ownerfunds', async () => {
            ownerfunds = await order.getOwnerFunds.call({from: owner})
        })

        it('should throw trying to terminate when ownerfunds are left', () => {
            return assert.isRejected(order.Terminate({from: payee}))
        })

        it('should do a full withdraw', () => {
            return assert.isFulfilled(order.WithdrawOwnerFunds(ownerfunds, {from: owner}))
        })

        it('should be terminated after calling "Terminate', async () => {
            let result = await order.Terminate({from: owner})
            assert.becomes(order.isTerminated({from: owner}), true, 'Contract should now be terminated')
        })

        it('should have correct terminationTime', async () => {
            let terminationTime = await order.terminationTime({from: owner})
            assert.approximately(terminationTime.toNumber(), moment().unix(), 2) // allow 2 seconds variance
        })
    })

    describe('Checking balances after termination', function () {

        it('should have correct entitledfunds for payee', async () => {
            let elapsed = moment().diff(startTime, 'seconds')
            // console.log("Elapsed seconds: " + elapsed)
            let numPayments = (Math.floor(elapsed / interval)) + 1
            // console.log("Payments: " + numPayments)
            let expectedEntitledFunds = paymentAmount.times(numPayments)
            let entitledFunds = await order.getEntitledFunds({from: payee})
            // console.log("entitled funds: " + entitledFunds.toString())
            // console.log("Expected:       " + expectedEntitledFunds.toString())
            assert(entitledFunds.equals(expectedEntitledFunds), 'entitledFunds should match Expected amount!')
        })

        it('should have correct collectible funds', async () => {
            let unclaimedFunds = await order.getUnclaimedFunds({from: owner})
            assert(unclaimedFunds.equals(paymentAmount), 'unclaimedFunds should match paymentAmount!')
        })

        it('should have zero funds available for owner withdraw', async () => {
            let ownerBalance = await order.getOwnerFunds({from: owner})
            console.log("Ownerbalance: " + ownerBalance.toString())
            assert(ownerBalance.isZero(),
                'ownerBalance should be zero after termination!')
        })
    })

    describe('Checking entitledfunds after termination', function () {

        this.timeout(interval * 1000 * 3)

        let entitledBefore
        let otherUser = web3.eth.accounts[2]
        let otherUser2 = web3.eth.accounts[3]

        before('get entitled funds', async () => {
            entitledBefore = await order.getEntitledFunds({from: payee})
        })

        before('wait two intervals', async () => {
            await new Promise(function (resolve) {
                setTimeout(resolve, interval * 2 * 1000)
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

        it('entitledfunds should be constant after termination', async () => {
            let entitledFunds = await order.getEntitledFunds({from: payee})
            assert(entitledBefore.eq(entitledFunds), 'entitledfunds changed although contract is terminated')
        })
    })

    describe('getting unclaimed funds from terminated order', function () {

        before('order should be terminated', () => {
            assert.becomes(order.isTerminated({from: owner}), true, 'Contract not yet terminated!')
        })

        it('should have collectible funds', async () => {
            let unclaimedFunds = await order.getUnclaimedFunds({from: owner})
            assert(unclaimedFunds.greaterThan(0), 'unclaimedFunds should exist!')
        })

        it('should successfully call collectFunds', () => {
            return assert.isFulfilled(order.collectFunds({from: payee}))
        })
    })
})

describe('Checking Termination of underfunded order', function () {

    this.timeout(15000);

    let order
    let owner = web3.eth.accounts[0]
    let payee = web3.eth.accounts[1]
    let paymentAmount = web3.toBigNumber(web3.toWei(1, 'finney'))
    let fundAmount = web3.toBigNumber(web3.toWei(10, 'finney'))
    let interval = 8 // secs

    before('Create a standingOrder', async () => {
        let startTime = moment() // First payment due now
        let label = 'testorder'
        order = await StandingOrder.new(owner, payee, interval, paymentAmount, startTime.unix(), label,
            { from: owner }
        )
    })

    it('should have negative ownerFunds', async () => {
        let ownerBalance = await order.getOwnerFunds({from: owner})
        assert(ownerBalance.isNegative(), 'ownerBalance should be negative')
    })

    it('should be terminated after calling "Terminate', async () => {
        await order.Terminate({from: owner})
        let isTerminated = await order.isTerminated({from: owner})
        // contract should be terminated now
        assert(isTerminated, 'Contract should now be terminated')
    })
})
