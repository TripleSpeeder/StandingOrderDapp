var moment = require('moment')
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert

// Include web3 library so we can query accounts.
const Web3 = require('web3')
// Instantiate new web3 object pointing toward an Ethereum node.
let web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

var StandingOrder = artifacts.require('StandingOrder')

let order
let owner = web3.eth.accounts[0]
let payee = web3.eth.accounts[1]
let paymentAmount = web3.toBigNumber(web3.toWei(1, 'ether'))
let fundAmount = web3.toBigNumber(web3.toWei(10, 'ether'))
let startBalance, newBalance, gasUsed, unclaimedFunds
let gasPrice = web3.eth.gasPrice

describe('Prepare standing order', function(){

    before('Create a standingOrder', function () {
        let interval = 120 // two minutes
        let startTime = moment() // First payment due now
        let label = 'testorder'

        return StandingOrder.new(owner, payee, interval, paymentAmount, startTime.unix(), label,
        {
            from: owner,
        })
        .then(function (instance) {
            console.log("Created new order at " + instance.address)
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

    before('Get payees current balance', function () {
        // get current payee balance
        startBalance = web3.eth.getBalance(payee)
        newBalance = startBalance
        assert.isAbove(startBalance.toNumber(), web3.toWei(10, 'ether'))
    })

    it('should get unclaimed funds', function () {
        return order.getUnclaimedFunds.call({from: payee}).then(function (_unclaimedFunds) {
            unclaimedFunds = _unclaimedFunds
            assert(unclaimedFunds.equals(paymentAmount), 'unclaimedFunds should match paymentAmount!')
        })
    })

    it('should call collectFunds', function done() {
        return order.collectFunds({from: payee/*, gas: 0x47E7C4*/})
            .then(function (result) {
                assert.isNotNull(result.receipt.blockHash)
                assert.isNotNull(result.receipt.blockNumber)
                gasUsed = result.receipt.gasUsed
                assert.isAbove(result.receipt.cumulativeGasUsed, 100)
            })
    })

    it('should correctly increase payees balance', function () {
        newBalance = web3.eth.getBalance(payee)
        let diff = newBalance.minus(startBalance) // how much did balance increase
        diff = diff.plus(gasPrice.mul(gasUsed)) // take gas usage into account
        if (! diff.equals(unclaimedFunds)) {
            let missing = unclaimedFunds.minus(diff)
            console.log("Missing " + missing.toString() + " wei")
            console.log("Did you run testrpc with -g option? You HAVE to specify it to get correct value for web3.eth.gasPrice!")
        }
        assert(diff.equals(unclaimedFunds), "Account balance should be increased by unclaimedFunds")
    })

    it('should correctly decrease contract balance', function () {
        assert(web3.eth.getBalance(order.address).equals(fundAmount.minus(paymentAmount)))
    })

})

