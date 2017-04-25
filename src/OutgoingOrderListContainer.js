import React, {Component} from 'react'
import OutgoingOrderList from './OutgoingOrderList'

class OutgoingOrderListContainer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            outgoingOrders: [],
        }
        this.isWatching = false
    }

    retrieveOrders(count) {
        var self=this
        console.log("Start retrieving " + count + " outgoing orders owned by " + self.props.account +"...")
        var index
        for (index = 0; index < count; index++) {
            // get address of order contract
            self.props.factoryInstance.getOwnOrderByIndex.call(
                index,
                {from: self.props.account}
            ).then(function (address) {
                console.log("Order " + index + " located at address " + address)
                // get contract instance
                return self.props.orderContract.at(address)}
            ).then(function (order_instance) {
                console.log("Order " + index + ":")
                console.log(order_instance)
                self.setState({
                    // use concat to create a new array extended with the new order
                    outgoingOrders: self.state.outgoingOrders.concat([order_instance])
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
            console.log("Account undefined. Can't retrieve outgoing orders.")
            return
        } else {
            console.log("Account: " + self.props.account)
        }

        // Okay, I'm watching
        self.isWatching = true

        // Get all existing outgoing ordercontracts from current account
        var numOrders = 0
        console.log("Looking for orders owned by " + self.props.account)
        self.props.factoryInstance.getNumOrdersByOwner({from: self.props.account}).then(function (result) {
            self.retrieveOrders(result)
        })

        // Start watching for new contracts
        this.createdOrders = self.props.factoryInstance.LogOrderCreated({fromBlock: 'pending', toBlock: 'latest'})
        this.createdOrders.watch(function (error, result) {
            // This will catch all createdOrder events, regardless of how they originated.
            if (error === null) {
                console.log('LogOrderCreated event:')
                console.log(result.args)
                self.props.orderContract.at(result.args.orderAddress).then(function (order_instance) {
                    console.log("Got contract at " + result.args.orderAddress + ":")
                    console.log(order_instance)
                    self.setState({
                        // use concat to create a new array extended with the new order
                        outgoingOrders: self.state.outgoingOrders.concat([order_instance])
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

    render() {
        console.log("Rendering OutgoingOrderListContainer!")
        console.log("Props: ")
        console.log(this.props)
        if (!this.isWatching) {
            this.tryStartWatching()
        }

        return <OutgoingOrderList
            outgoingOrders={this.state.outgoingOrders}
            account={this.props.account}
        />
    }
}

export default OutgoingOrderListContainer
