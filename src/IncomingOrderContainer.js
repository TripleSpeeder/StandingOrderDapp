import React, {Component} from 'react'
import IncomingOrder from './IncomingOrder'

class IncomingOrderContainer extends Component {

    constructor(props){
        super(props)
        this.state = {
            orderInstance: props.orderInstance,
            flatOrder: {
                address: '0x0',
                owner: '0x0',
                payee: '0x0',
                paymentInterval: 0,
                paymentAmount: 0,
                collectibleFunds: 0,
                next_payment: ''
            }
        }
        this.orderToState = this.orderToState.bind(this)
        this.handleCollect = this.handleCollect.bind(this)
    }

    handleCollect() {
        console.log("TODO: Collecting funds from contract")
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
        promises.push(this.state.orderInstance.owner.call().then(function (owner) {
            flatOrder.owner = owner
        }))
        promises.push(this.state.orderInstance.paymentAmount.call().then(function (amount) {
            flatOrder.paymentAmount = amount.toString()
        }))
        promises.push(this.state.orderInstance.paymentInterval.call().then(function (interval) {
            flatOrder.paymentInterval = interval.toString()
        }))
        promises.push(this.state.orderInstance.getUnclaimedFunds.call().then(function (unclaimedFunds) {
            flatOrder.collectibleFunds = unclaimedFunds.toString()
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
            self.orderToState()
        })
    }

    componentWillUnmount() {
        // Stop listening to new block events
        this.filter.stopWatching()
    }

    render() {
        return <IncomingOrder
            order={this.state.flatOrder}
            onCollectFunds={this.handleCollect}
        />
    }
}

export default IncomingOrderContainer