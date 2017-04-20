import React, {Component} from 'react';
import {Table} from 'react-bootstrap';
import OutgoingOrderList from './OutgoingOrderList'

class OutgoingOrderListContainer extends Component {

    constructor(props){
        console.log("OutgoingOrderListContainer props: ")
        console.log(props)
        super(props)
        this.state = {
            outgoingOrders: [],
            account: props.account
        }
    }

    componentDidMount() {
        console.log("OutgoingOrderList DidMount")
        return

        var self = this

        // Get all existing contracts
        var allEvents = this.props.factoryInstance.allEvents({fromBlock: 0, toBlock: 'latest'})
        allEvents.get(function (error, logs) {
            if (error === null) {
                console.log("Got " + logs.length + " Past events")
                var entry
                for (entry of logs) {
                    console.log(entry)
                    self.orderContract.at(entry.args.orderAddress).then(function (order_instance) {
                        console.log("Adding order:")
                        console.log(order_instance)
                        self.setState({
                            // use concat to create a new array extended with the new order
                            outgoingOrders: self.state.outgoingOrders.concat([order_instance])
                        })
                    })
                }
            }
            else {
                console.log("Error while fetching past events:")
                console.log(error)
            }
        })

        // Start watching for new contracts
        this.createdOrders = this.props.factoryInstance.LogOrderCreated({fromBlock: 'pending', toBlock: 'latest'})
        this.createdOrders.watch(function (error, result) {
            // This will catch all createdOrder events, regardless of how they originated.
            if (error === null) {
                console.log('LogOrderCreated event:')
                console.log(result.args)
                self.orderContract.at(result.args.orderAddress).then(function (order_instance) {
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

    componentWillUnmount() {
        // Stop watching for new contracts
        this.createdOrders.stopWatching()
    }

    render() {
        console.log("Rendering OutgoingOrderListContainer!")
        return <OutgoingOrderList
            outgoingOrders={this.state.outgoingOrders}
        />
    }
}

export default OutgoingOrderListContainer
