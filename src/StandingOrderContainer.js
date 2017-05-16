import React, {Component} from 'react'
import moment from 'moment'
import StandingOrder from './StandingOrder'

class StandingOrderContainer extends Component {

    constructor(props){
        super(props)
        this.state = {
            orderInstance: props.orderInstance,
            flatOrder: null
        }
        this.handleFundContract = this.handleFundContract.bind(this)
        this.orderToState = this.orderToState.bind(this)
        this.handleWithdraw = this.handleWithdraw.bind(this)
        this.handleCancelContract = this.handleCancelContract.bind(this)
        this.handleCollect = this.handleCollect.bind(this)
        this.handleRelabel = this.handleRelabel.bind(this)
    }

    handleCollect() {
        console.log("Collecting funds from contract")
        this.props.orderInstance.collectFunds({from: this.state.flatOrder.payee}).then(function(result){
            console.log("CollectFunds issued: ")
            console.log(result)
        })
    }

    handleWithdraw() {
        console.log("Withdrawing owned funds from contract")
        this.state.orderInstance.WithdrawOwnerFunds({from:this.props.account})
    }

    handleCancelContract() {
        var self=this
        console.log("Cancelling contract (Owner: " + this.props.account)
        this.state.orderInstance.Cancel({from: this.props.account})
            .then(function(result){
                console.log("Successfully cancelled order.")
                // notify parent
                self.props.onRemoveOrder(self.state.orderInstance)
            })
            .catch(function(e){
                console.log("Error while cancelling contract:")
                console.log(e)
            })
    }

    handleFundContract(amount) {
        var contract_address = this.state.orderInstance.address
        console.log("Funding contract " + this.state.orderInstance)

        window.web3.eth.getAccounts(function (error, accounts) {
            var transaction_object = {
                from: accounts[0],
                to: contract_address,
                value: amount
            }
            window.web3.eth.sendTransaction(transaction_object, function (err, address) {
                if (err) {
                    console.log("Error while sending transaction: ")
                    console.log(err)
                } else {
                    console.log("Contract funded. Transaction address: " + address)
                }
            })
        })
    }

    handleRelabel(_label) {
        var self=this
        if (self.props.outgoing) {
            console.log("Setting new owner label " + _label + ", account: " + self.props.account)
            self.state.orderInstance.SetOwnerLabel(_label, {from: self.props.account})
                .then(function (result) {
                    console.log("Successfully set new label.")
                    // update order
                    self.orderToState()
                })
                .catch(function (e) {
                    console.log("Error while setting owner label:")
                    console.log(e)
                })
        }
        else {
            console.log("Setting new payee label " + _label + ", account: " + self.props.account)
            self.state.orderInstance.SetPayeeLabel(_label, {from: self.props.account})
                .then(function (result) {
                    console.log("Successfully set new label.")
                    // update order
                    self.orderToState()
                })
                .catch(function (e) {
                    console.log("Error while setting payee label:")
                    console.log(e)
                })
        }
    }

    orderToState() {
        var self = this

        // address is immediately available
        var flatOrder = {
            address: this.state.orderInstance.address
        }

        // get all other info via call() and promises
        var promises = []
        promises.push(this.state.orderInstance.startTime.call().then(function (startTime) {
            flatOrder.startTime = startTime
        }))
        promises.push(this.state.orderInstance.payee.call().then(function (payee) {
            flatOrder.payee = payee
        }))
        promises.push(this.state.orderInstance.payeeLabel.call().then(function (payeeLabel) {
            flatOrder.payeeLabel = payeeLabel
        }))
        promises.push(this.state.orderInstance.owner.call().then(function (owner) {
            flatOrder.owner = owner
        }))
        promises.push(this.state.orderInstance.ownerLabel.call().then(function (ownerLabel) {
            flatOrder.ownerLabel = ownerLabel
        }))
        promises.push(this.state.orderInstance.paymentAmount.call().then(function (amount) {
            flatOrder.paymentAmount = amount
        }))
        promises.push(this.state.orderInstance.paymentInterval.call().then(function (interval) {
            flatOrder.paymentInterval = interval
        }))
        promises.push(this.state.orderInstance.getOwnerFunds.call().then(function (ownerFunds) {
            flatOrder.ownerFunds = ownerFunds
        }))
        promises.push(window.web3.eth.getBalance(this.state.orderInstance.address, function(error, balance) {
            if (error) {
                console.log("Error retrieving balance: " + error)
                flatOrder.balance = window.web3.toBigNumber('0')
            } else {
                flatOrder.balance = balance
            }
        }))
        promises.push(this.props.orderInstance.getEntitledFunds.call().then(function (entitledFunds) {
            flatOrder.entitledFunds = entitledFunds
        }))
        promises.push(this.props.orderInstance.getUnclaimedFunds.call().then(function (unclaimedFunds) {
            flatOrder.collectibleFunds = unclaimedFunds
        }))


        Promise.all(promises).then(function () {
            flatOrder.fundsInsufficient = flatOrder.entitledFunds > flatOrder.collectibleFunds
            flatOrder.withdrawEnabled = flatOrder.ownerFunds > 0
            flatOrder.cancelEnabled = flatOrder.balance.isZero()
            flatOrder.paymentsCovered = flatOrder.ownerFunds.dividedBy(flatOrder.paymentAmount)
            self.calculateNextPaymentDate(flatOrder)
            self.calculateFailureDate(flatOrder)
            self.setState({
                flatOrder: flatOrder
            })
        })
    }

    // When will the next payment be made
    calculateNextPaymentDate(flatOrder) {
        // get seconds elapsed since order startdate
        let secondsElapsed = Math.floor((Date.now()/1000)) - flatOrder.startTime.toNumber()

        // how many paymentIntervals are done
        let donePayments = Math.floor(secondsElapsed / flatOrder.paymentInterval.toNumber())

        // timestamp of last payment
        let lastPayment = window.web3.toBigNumber(donePayments * flatOrder.paymentInterval).plus(flatOrder.startTime).floor()
        flatOrder.lastPaymentDate = moment.unix(lastPayment.toNumber())

        // timestamp of next payment
        let nextPayment = lastPayment.plus(flatOrder.paymentInterval)
        flatOrder.nextPaymentDate = moment.unix(nextPayment.toNumber())
    }

    // When will the last full payment be made
    calculateFailureDate(flatOrder) {
        let secondsToFailure = flatOrder.paymentsCovered.floor() * flatOrder.paymentInterval
        flatOrder.failureDate = flatOrder.nextPaymentDate.clone().add(secondsToFailure, 's')
    }

    componentWillMount() {
        // start filling of flatOrder object
        this.orderToState()
    }

    componentDidMount() {
        // Start listening to new block events and refresh order state
        var self=this
        this.filter = window.web3.eth.filter('latest')
        this.filter.watch(function(error, result){
            self.orderToState()
        })
    }

    componentWillUnmount() {
        // Stop listening to new block events
        this.filter.stopWatching()
    }

    render() {
        return <StandingOrder
            order={this.state.flatOrder}
            onFundContract={this.handleFundContract}
            onWithdrawOwnerFunds={this.handleWithdraw}
            onCancelContract={this.handleCancelContract}
            onCollectFunds={this.handleCollect}
            onRelabel={this.handleRelabel}
            outgoing={this.props.outgoing}
        />
    }
}

export default StandingOrderContainer