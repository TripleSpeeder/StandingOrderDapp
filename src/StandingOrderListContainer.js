import React, {Component} from 'react'
import PropTypes from 'prop-types'
import StandingOrderList from './StandingOrderList'

class StandingOrderListContainer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            outgoingOrders: [],
        }
        this.isWatching = false
        this.onRemoveOrder = this.onRemoveOrder.bind(this)
        this.onAddOrder = this.onAddOrder.bind(this)
    }

    retrieveOrders(count) {
        var self = this
        console.log("Start retrieving " + count + " orders owned by " + self.props.account + "...")
        var index
        for (index = 0; index < count; index++) {
            // get address of order contract
            self.retrievalFunction.call(
                index,
                {from: self.props.account}
            ).then(function (address) {
                    console.log("Retrieving order located at address " + address)
                    // get contract instance
                    return (self.props.orderContract.at(address))
                }
            ).then(function (order_instance) {
                    console.log("Got order instance:")
                    console.log(order_instance)
                    self.onAddOrder(order_instance)
                }
            )
        }
    }

    tryStartWatching() {
        var self = this

        if (self.props.factoryInstance === null) {
            console.log("Factory still undefined...")
            return
        } else {
            console.log("Factory: " + self.props.factoryInstance)
        }

        if (self.props.account === null) {
            console.log("Account undefined. Can't retrieve outgoing orders.")
            return
        } else {
            console.log("Account: " + self.props.account)
        }

        // Okay, I'm watching
        self.isWatching = true

        // setup event listener/filters/retrieval functions
        if (self.props.outgoing) {
            // Set filter to look for outgoing events
            self.eventFilter = {owner: self.props.account}
            self.retrievalCountFunction = self.props.factoryInstance.getNumOrdersByOwner
            self.retrievalFunction = self.props.factoryInstance.getOwnOrderByIndex
        } else {
            // Set filter to look for incoming events
            self.eventFilter = {payee: self.props.account}
            self.retrievalCountFunction = self.props.factoryInstance.getNumOrdersByPayee
            self.retrievalFunction = self.props.factoryInstance.getPaidOrderByIndex
        }

        // Get all existing outgoing ordercontracts from current account
        console.log("Looking for orders owned by " + self.props.account)
        self.retrievalCountFunction({from: self.props.account}).then(function (result) {
            self.retrieveOrders(result)
        })

        // Start watching for new contracts
        this.OrderCreatedEvent = self.props.factoryInstance.LogOrderCreated(
            this.eventFilter,
            {
                fromBlock: 'latest',
                toBlock: 'latest'
            })
        this.OrderCreatedEvent.watch(function (error, result) {
            if (error === null) {
                console.log('LogOrderCreated event:')
                console.log(result.args)
                self.props.orderContract.at(result.args.orderAddress).then(function (order_instance) {
                    console.log("Got contract at " + result.args.orderAddress + ":")
                    console.log(order_instance)
                    // TODO: There is a risk the order has changed ownership in the meantime. So I need to
                    // double-check here that I'm really the owner
                    self.onAddOrder(order_instance)
                })
            } else {
                console.log('Error while watching events:')
                console.log(error)
            }
        })

    }

    tryStopWatching() {
        if (this.isWatching) {
            this.isWatching = false
            this.OrderCreatedEvent.stopWatching()
        }
    }

    componentWillUnmount() {
        // Stop watching for new contracts
        this.tryStopWatching()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.props.account) {
            console.log("OrderListContainer getting new account " + nextProps.account)
            // stop watching for events of old owner
            this.tryStopWatching()
            // clear all existing orders as they are from old owner
            this.setState({
                outgoingOrders: [],
            })
        }
    }

    onRemoveOrder(orderInstance) {
        // FIXME - Use async setState to prevent race conditions!
        var newOrderArray = this.state.outgoingOrders.filter((instance) => {
            return (instance.address !== orderInstance.address)
        })
        this.setState({outgoingOrders: newOrderArray})
    }

    onAddOrder(orderInstance) {
        // TODO Check for duplicates!
        // FIXME - Use async setState to prevent race conditions!
        this.setState({
            // use concat to create a new array extended with the new order
            outgoingOrders: this.state.outgoingOrders.concat([orderInstance])
        })
    }

    render() {
        console.log("Rendering StandingOrderListContainer!")
        console.log("Props: ")
        console.log(this.props)
        if (!this.isWatching) {
            this.tryStartWatching()
        }

        return <StandingOrderList
            Orders={this.state.outgoingOrders}
            account={this.props.account}
            outgoing={this.props.outgoing}
            factoryInstance={this.props.factoryInstance}
        />
    }
}

StandingOrderListContainer.propTypes = {
    outgoing: PropTypes.bool.isRequired,
    factoryInstance: PropTypes.any.isRequired, // TODO: Use specifc protype instead of any!
}


export default StandingOrderListContainer
