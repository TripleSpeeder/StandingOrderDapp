import React, {Component} from 'react'
import {Grid, Row, Col, Navbar, Jumbotron, Button} from 'react-bootstrap';
import IncomingOrderList from './IncomingOrderList';
import OutgoingOrderList from './OutgoingOrderList';
import ContractForm from './ContractForm';

/*
 Import our contract artifacts and turn them into usable abstractions.
 */
import standingOrderFactory_artifacts from '../build/contracts/StandingOrderFactory.json'
import standingOrder_artifacts from '../build/contracts/StandingOrder.json'

import Web3 from 'web3'

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
            outgoingOrders: [
                {
                    receiver: '0x11111111',
                    rate: 100,
                    period: 2000,
                    owner_funds: 200,
                    funded_until: "3.3.2018"
                },
                {
                    receiver: '0x222222222',
                    rate: 300,
                    period: 1300,
                    owner_funds: 12000,
                    funded_until: "12.2.2018"
                },
                {
                    receiver: '0x333333333',
                    rate: 2000,
                    period: 1430,
                    owner_funds: 45000,
                    funded_until: "3.3.2020"
                }
            ]
        };

        this.handleNewIncomingOrder = this.handleNewIncomingOrder.bind(this);
        this.handleNewOutgoingOrder = this.handleNewOutgoingOrder.bind(this);
    }

    handleNewIncomingOrder(orderDetails) {
        // Explicitly need to call SetState(), otherwise the change will be ignored
        this.setState({
            // use concat to create a new array extended with the new order
            incomingOrders: this.state.incomingOrders.concat([orderDetails])
        })
    }

    handleNewOutgoingOrder(order) {
        var factoryInstance
        var self = this;
        // get accounts
        self.web3RPC.eth.getAccounts(function (error, accounts) {

            // Actually perform the contract call here
            self.factory.deployed().then(function (instance) {
                factoryInstance = instance;
                return factoryInstance.createStandingOrder(order.receiver, order.rate, order.period, {
                    from: accounts[0],
                    gas: 500000
                })
                    .then(function (result) {
                        console.log('Created StandingOrder - transaction: ' + result.tx)
                        console.log(result.receipt)
                        return
                    })
            })
        })
    }

    onNewOrder(error, result) {
        // This will catch all createdOrder events, regardless of how they originated.
        if (error == null) {
            console.log('New order created:')
            console.log(result.args)
            // Get the RPC provider and setup our SimpleStorage contract.
            const provider = new Web3.providers.HttpProvider('http://localhost:8545')
            const contract = require('truffle-contract')
            var order = contract(standingOrder_artifacts)
            order.setProvider(provider)
            order.at(result.address).then(function(instance){
                console.log(instance);
                return(instance.getUnclaimedFunds.call())
            }).then(function (balance) {
                console.log(balance.toNumber())
            }).catch(function (e) {
                console.log("Error!")
                console.log(e);
            })
        } else {
            console.log('Error onNewOrder:')
            console.log(error)
        }
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

        // Get the RPC provider and setup our SimpleStorage contract.
        const provider = new Web3.providers.HttpProvider('http://localhost:8545')
        const contract = require('truffle-contract')

        self.factory = contract(standingOrderFactory_artifacts)
        self.factory.setProvider(provider)
        // start watching events of factory
        self.factory.deployed().then(function (instance) {
            const createdOrders = instance.LogOrderCreated({fromBlock: 'latest'})
            createdOrders.watch(self.onNewOrder)
        })
        // Get Web3 so we can get our accounts.
        self.web3RPC = new Web3(provider)

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
