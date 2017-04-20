import React, {Component} from 'react'
import {Grid, Row, Col, Navbar, Jumbotron, Button} from 'react-bootstrap'
import IncomingOrderList from './IncomingOrderList'
import OutgoingOrderList from './OutgoingOrderList'
import ContractForm from './ContractForm'

/*
 Import our contract artifacts and turn them into usable abstractions.
 */
import standingOrderFactory_artifacts from '../build/contracts/StandingOrderFactory.json'
import standingOrder_artifacts from '../build/contracts/StandingOrder.json'

import { default as Web3 } from 'web3'

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn('Using web3 detected from external source.')
        // Use Mist/MetaMask's provider
        // eslint-disable-next-line no-undef
        window.web3 = new Web3(web3.currentProvider)
    } else {
        console.warn('No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
    }
})

class App extends Component {

    constructor(props) {
        super(props)

        // Setup some dummy orders
        this.state = {
            incomingOrders: [
                {
                    sender: '0x11111111',
                    rate: 100,
                    period: 2000,
                    available_amount: 200
                },
                {
                    sender: '0x222222',
                    rate: 40,
                    period: 1230,
                    available_amount: 0
                },
                {
                    sender: '0x333333333',
                    rate: 120,
                    period: 2000,
                    available_amount: 1200
                }
            ],
            outgoingOrders: []
        }

        this.handleNewIncomingOrder = this.handleNewIncomingOrder.bind(this)
        this.handleNewOutgoingOrder = this.handleNewOutgoingOrder.bind(this)
    }

    handleNewIncomingOrder(orderDetails) {
        // Explicitly need to call SetState(), otherwise the change will be ignored
        this.setState({
            // use concat to create a new array extended with the new order
            incomingOrders: this.state.incomingOrders.concat([orderDetails])
        })
    }

    handleNewOutgoingOrder(order) {
        var self = this
        // get accounts
        self.web3RPC.eth.getAccounts(function (error, accounts) {
            return self.factoryInstance.createStandingOrder(order.receiver, order.rate, order.period, {
                from: accounts[0],
                gas: 500000
            }).then(function (result) {
                console.log('Created StandingOrder - transaction: ' + result.tx)
                console.log(result.receipt)
            })
        })
    }


    componentWillMount() {
        /*
         * SMART CONTRACT EXAMPLE
         *
         * Normally these functions would be called in the context of a
         * state management library, but for convenience I've placed them here.
         */

        // So we can update state later.
        var self = this

        // TODO - Refactor this - no need to explicitly use this?
        self.web3RPC = window.web3

        // Get the RPC provider and setup our contracts.
        const provider = new Web3.providers.HttpProvider('http://localhost:8545')
        const contract = require('truffle-contract')
        self.factoryContract = contract(standingOrderFactory_artifacts)
        self.factoryContract.setProvider(provider)
        self.factoryInstance = null
        self.orderContract = contract(standingOrder_artifacts)
        self.orderContract.setProvider(provider)

        // Get accounts.
        self.web3RPC.eth.getAccounts(function (error, accounts) {
            console.log("Got accounts: ")
            console.log(accounts)
            self.accounts = accounts
        })

        // start watching events of factory
        self.factoryContract.deployed().then(function (factory_instance) {
            self.factoryInstance = factory_instance

            // get past events
            var allEvents = factory_instance.allEvents({fromBlock: 0, toBlock: 'latest'})
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
                            // self.orderToState(order_instance)
                        })
                    }
                }
                else {
                    console.log("Error while fetching past events:")
                    console.log(error)
                }
            })

            // watch for new events
            const createdOrders = factory_instance.LogOrderCreated({fromBlock: 'pending', toBlock: 'latest'})
            createdOrders.watch(function (error, result) {
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
                        // self.orderToState(order_instance)
                    })
                } else {
                    console.log('Error while watching events:')
                    console.log(error)
                }
            })
        })

        // Declaring this for later so we can chain functions on SimpleStorage.
        // var simpleStorageInstance

        // Get accounts.
        /*
         self.web3RPC.eth.getAccounts(function (error, accounts) {
         console.log(accounts)

         simpleStorage.deployed().then(function(instance) {
         simpleStorageInstance = instance

         // Stores a value of 5.
         return simpleStorageInstance.set(5, {from: accounts[0]})
         }).then(function(result) {
         // Get the value from the contract to prove it worked.
         return simpleStorageInstance.get.call(accounts[0])
         }).then(function(result) {
         // Update state with the result.
         return self.setState({ storageValue: result.c[0] })
         })
         })
         */
    }

    render() {
        return (
            <div>
                <Navbar inverse fixedTop>
                    <Grid>
                        <Navbar.Header>
                            <Navbar.Brand>
                                <a href="/">React App</a>
                            </Navbar.Brand>
                            <Navbar.Toggle />
                        </Navbar.Header>
                    </Grid>
                </Navbar>
                <Jumbotron>
                    <Grid>
                        <h1>Welcome to React</h1>
                        <p>
                            <Button
                                bsStyle="success"
                                bsSize="large"
                                href="http://react-bootstrap.github.io/components.html"
                                target="_blank">
                                View React Bootstrap Docs
                            </Button>
                        </p>
                    </Grid>
                </Jumbotron>
                <Grid>
                    <Row className="show-grid">
                        <Col md={8}>
                            <IncomingOrderList
                                incomingOrders={this.state.incomingOrders}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={8}>
                            <OutgoingOrderList
                                outgoingOrders={this.state.outgoingOrders}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={8}>
                            <ContractForm
                                onNewOutgoingOrder={this.handleNewOutgoingOrder}
                            />
                        </Col>
                    </Row>
                </Grid>
            </div>
        )
    }
}

export default App
