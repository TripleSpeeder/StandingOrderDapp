import React, {Component} from 'react'
import OutgoingOrder from './OutgoingOrder'

class OutgoingOrderContainer extends Component {

    constructor(props){
        super(props)
        this.state = {
            orderInstance: props.orderInstance,
            flatOrder: {
                address: '0x0',
                payee:   '0x0',
                paymentAmount: 0,
                paymentInterval: 0,
                ownerFunds: 0,
                funded_until: ''
            }
        }
        this.handleFundContract = this.handleFundContract.bind(this)
        this.orderToState = this.orderToState.bind(this)
        this.handleWithdraw = this.handleWithdraw.bind(this)
    }

    handleWithdraw() {
        console.log("Withdrawing owned funds from contract")
    }

    handleFundContract() {
        var contract_address = this.state.orderInstance.address
        console.log("Funding contract " + this.state.orderInstance)

        window.web3.eth.getAccounts(function (error, accounts) {
            var transaction_object = {
                from: accounts[0],
                to: contract_address,
                value: window.web3.toWei('1', 'ether')
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

    orderToState() {
        var self = this

        // address is immediately available
        var flatOrder = {
            address: this.state.orderInstance.address
        }

        // get all other info via call() and promises
        var promises = []
        promises.push(this.state.orderInstance.payee.call().then(function (payee) {
            flatOrder.payee = payee
        }))
        promises.push(this.state.orderInstance.paymentAmount.call().then(function (amount) {
            flatOrder.paymentAmount = amount.toString()
        }))
        promises.push(this.state.orderInstance.paymentInterval.call().then(function (interval) {
            flatOrder.paymentInterval = interval.toString()
        }))
        promises.push(this.state.orderInstance.getOwnerFunds.call().then(function (ownerFunds) {
            flatOrder.ownerFunds = ownerFunds.toString()
        }))

        Promise.all(promises).then(function () {
            // console.log("All promises resolved!")
            self.setState({
                flatOrder: flatOrder
            })
        })
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
            // console.log('New block!')
            self.orderToState()
        })
    }

    componentWillUnmount() {
        // Stop listening to new block events
        this.filter.stopWatching()
    }

    render() {
        return <OutgoingOrder
            order={this.state.flatOrder}
            onFundContract={this.handleFundContract}
            onWithdrawOwnerFunds={this.handleWithdraw}
        />
    }
}

export default OutgoingOrderContainer