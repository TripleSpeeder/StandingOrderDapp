import React, {Component} from 'react'
import IncomingOrderList from './IncomingOrderList'

class IncomingOrderListContainer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            incomingOrders: [],
        }
        this.isWatching = false
    }

    retrieveOrders(count) {
        var self = this
        console.log("Start retrieving " + count + " incoming orders for " + self.props.account + "...")
        var index
        for (index = 0; index < count; index++) {
            // get address of order contract
            self.props.factoryInstance.getPaidOrderByIndex.call(
                index,
                {from: self.props.account}
            ).then(function (address) {
                    console.log("Order " + index + " located at address " + address)
                    // get contract instance
                    return self.props.orderContract.at(address)
                }
            ).then(function (order_instance) {
                console.log("Order " + index + ":")
                console.log(order_instance)
                self.setState({
                    // use concat to create a new array extended with the new order
                    incomingOrders: self.state.incomingOrders.concat([order_instance])
                })
            })
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
            console.log("Account undefined. Can't retrieve incoming orders.")
            return
        } else {
            console.log("Account: " + self.props.account)
        }

        // Okay, I'm watching
        self.isWatching = true

        // Get all existing outgoing ordercontracts from current account
        var numOrders = 0
        console.log("Looking for orders for " + self.props.account)
        self.props.factoryInstance.getNumOrdersByPayee({from: self.props.account}).then(function (result) {
            self.retrieveOrders(result)
        })

        // Start watching for new contracts
        this.createdOrders = self.props.factoryInstance.LogOrderCreated({payee: self.props.account}, {
            fromBlock: 'pending',
            toBlock: 'latest'
        })
        this.createdOrders.watch(function (error, result) {
            if (error === null) {
                console.log('LogOrderCreated event:')
                console.log(result.args)
                self.props.orderContract.at(result.args.orderAddress).then(function (order_instance) {
                    console.log("Got contract at " + result.args.orderAddress + ":")
                    console.log(order_instance)
                    self.setState({
                        // use concat to create a new array extended with the new order
                        incomingOrders: self.state.incomingOrders.concat([order_instance])
                    })
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
            this.createdOrders.stopWatching()
        }
    }

    componentWillUnmount() {
        // Stop watching for new contracts
        this.tryStopWatching()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.account !== this.props.account) {
            console.log("IncomingOrderListContainer getting new account " + nextProps.account)
            // stop watching for events of old owner
            this.tryStopWatching()
            // clear all existing orders as they are from old owner
            this.setState({
                incomingOrders: [],
            })
        }
    }

    render() {
        console.log("Rendering IncomingOrderListContainer!")
        console.log("Props: ")
        console.log(this.props)
        if (!this.isWatching) {
            this.tryStartWatching()
        }

        return <IncomingOrderList
            incomingOrders={this.state.incomingOrders}
            account={this.props.account}
        />
    }
}

export default IncomingOrderListContainer
