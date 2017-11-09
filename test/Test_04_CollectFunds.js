let moment = require('moment')
let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
let assert = chai.assert

let StandingOrder = artifacts.require('StandingOrder')

let owner = web3.eth.accounts[0]
let payee = web3.eth.accounts[1]
let otherUser = web3.eth.accounts[2]
let paymentAmount = web3.toBigNumber(web3.toWei(1, 'finney'))
let fundAmount = web3.toBigNumber(web3.toWei(10, 'finney'))
let order, startBalance, newBalance, gasUsed, unclaimedFunds, gasPrice

describe('Checking collectFunds', function () {

    before('Create a standingOrder', async () => {
        let interval = 120 // two minutes
        let startTime = moment() // First payment due now
        let label = 'testorder'
        order = await StandingOrder.new(owner, payee, interval, paymentAmount, startTime.unix(), label,
            { from: owner }
        )
    })

    before('Fund order', async () => {
        result = await order.send(fundAmount, {from: owner})
        assert.isNotNull(result.receipt.blockHash)
        assert(web3.eth.getBalance(order.address).equals(fundAmount))
    })

    before('Get payees current balance', () => {
        // get current payee balance
        startBalance = web3.eth.getBalance(payee)
        newBalance = startBalance
        assert.isAbove(startBalance.toNumber(), parseInt(web3.toWei(10, 'ether')))
    })

    describe('Checking access', function () {

        it('should throw when owner calls collectFunds', () => {
            return assert.isRejected(
                order.collectFunds({from: owner}),
                /invalid opcode/
            )
        })

        it('should throw when non-payee calls collectFunds', () => {
            return assert.isRejected(
                order.collectFunds({from: otherUser}),
                /invalid opcode/
            )
        })
    })

    describe('Checking collect', function () {

        let unclaimedFunds

        it('should get correct unclaimed funds', async () => {
            unclaimedFunds = await order.getUnclaimedFunds.call({from: payee})
            assert(unclaimedFunds.equals(paymentAmount), 'unclaimedFunds should match paymentAmount!')
        })

        it('should call collectFunds', async () => {
            let result = await order.collectFunds({from: payee})
            assert.isNotNull(result.receipt.blockHash)
            assert.isNotNull(result.receipt.blockNumber)
            gasUsed = result.receipt.gasUsed
            gasPrice = web3.eth.getTransaction(result.tx).gasPrice
            // there should be one log event named "Collect"
            assert.equal('Collect', result.logs[0].event)
            // the first (and only) argument is the amount collected
            assert(unclaimedFunds.equals(result.logs[0].args['amount']))
        })

        it('should correctly increase payees balance', () => {
            newBalance = web3.eth.getBalance(payee)
            let diff = newBalance.minus(startBalance) // how much did balance increase
            diff = diff.plus(gasPrice.mul(gasUsed)) // take gas usage into account
            if (!diff.equals(unclaimedFunds)) {
                let missing = unclaimedFunds.minus(diff)
                console.log("Missing " + missing.toString() + " wei")
                console.log("Did you run testrpc with -g option? You HAVE to specify it to get correct value for web3.eth.gasPrice!")
            }
            assert(diff.equals(unclaimedFunds), "Account balance should be increased by unclaimedFunds")
        })

        it('should correctly decrease contract balance', () => {
            assert(web3.eth.getBalance(order.address).equals(fundAmount.minus(paymentAmount)))
        })

    })

})

