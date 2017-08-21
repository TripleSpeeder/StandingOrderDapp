import React, {Component} from 'react'
import moment from 'moment'
import StandingOrder from './StandingOrder'

class StandingOrderContainer extends Component {

    constructor(props){
        super(props)
        this.state = {
            orderInstance: props.orderInstance,
            flatOrder: null,
            isLoading: true
        }
        this.orderToState = this.orderToState.bind(this)
        this.handleTerminate = this.handleTerminate.bind(this)
        this.handleCollect = this.handleCollect.bind(this)
        this.handleRelabel = this.handleRelabel.bind(this)
        this.handleWithdraw = this.handleWithdraw.bind(this)
        this.handleFund = this.handleFund.bind(this)
    }

    handleCollect() {
        console.log("Collecting funds from contract")
        // return promise
        return this.props.orderInstance.collectFunds({from: this.state.flatOrder.payee})
    }

    handleWithdraw(amount) {
        console.log("Withdrawing " + amount.toString() + " wei from contract")
        // return promise
        return this.props.orderInstance.WithdrawOwnerFunds(amount, {from: this.state.flatOrder.owner})
    }

    handleFund(amount) {
        console.log("Funding contract with " + amount.toString() + " wei")
        // return promise
        return this.props.orderInstance.sendTransaction({
            from: this.state.flatOrder.owner,
            value: amount,
        })
    }

    handleTerminate() {
        var self=this
        console.log("Terminating order " + this.state.flatOrder.ownerLabel)
        this.state.orderInstance.Terminate({from: this.props.account})
            .then(function(result){
                console.log("Successfully terminated order.")
                // update order
                self.orderToState()
            })
            .catch(function(e){
                console.log("Error while terminating order:")
                console.log(e)
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

        // indicate that order is loading/updating.
        self.setState({isLoading: true})

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
        promises.push(window.web3.eth.getBalancePromise(this.state.orderInstance.address).then(function (balance) {
            flatOrder.balance = balance
        }))
        promises.push(this.props.orderInstance.getEntitledFunds.call().then(function (entitledFunds) {
            flatOrder.entitledFunds = entitledFunds
        }))
        promises.push(this.props.orderInstance.getUnclaimedFunds.call().then(function (unclaimedFunds) {
            flatOrder.collectibleFunds = unclaimedFunds
        }))
        promises.push(this.state.orderInstance.claimedFunds.call().then(function (claimedFunds) {
            flatOrder.claimedFunds = claimedFunds
        }))
        promises.push(this.state.orderInstance.isTerminated.call().then(function (terminated) {
            flatOrder.isTerminated = terminated;
        }))

        Promise.all(promises).then(function (results) {
            flatOrder.fundsInsufficient = flatOrder.entitledFunds.gt(flatOrder.collectibleFunds)
            flatOrder.withdrawEnabled = flatOrder.ownerFunds.gt(0)
            flatOrder.terminateEnabled = flatOrder.ownerFunds.lte(0) && (!flatOrder.isTerminated)
            flatOrder.paymentsCovered = flatOrder.ownerFunds.dividedBy(flatOrder.paymentAmount)
            flatOrder.collectFn = self.handleCollect
            flatOrder.withdrawFn = self.handleWithdraw
            flatOrder.fundFn = self.handleFund
            if (flatOrder.isTerminated) {
                // Ownerfunds might be negative. As a terminated order can't be funded anymore, just set ownerFunds to 0
                flatOrder.ownerFunds = window.web3.toBigNumber(0)
            }
            self.calculateNextPaymentDate(flatOrder)
            self.calculateFailureDate(flatOrder)
            self.setState({
                flatOrder: flatOrder,
                isLoading: false
            })
        }, function(err){
            console.log("Error while retrieving order details:")
            console.log(err)
        })
    }

    // When will the next payment be made
    calculateNextPaymentDate(flatOrder) {
        // If startime is not yet reached the next payment date is the starttime!
        if (Date.now()/1000 < flatOrder.startTime.toNumber()) {
            flatOrder.nextPaymentDate = moment.unix(flatOrder.startTime.toNumber())
            return
        }

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
        this.filter.stopWatching(function(error, result){
            if (error) {
                console.log("Error while stopWatching: " + error)
            }
        })
    }

    render() {
        return <StandingOrder
            order={this.state.flatOrder}
            onTerminate={this.handleTerminate}
            onRelabel={this.handleRelabel}
            outgoing={this.props.outgoing}
            isLoading={this.state.isLoading}
        />
    }
}

export default StandingOrderContainer