import React, {Component} from 'react'
import {Grid, Row, Col, Navbar, Jumbotron, Button} from 'react-bootstrap'
import { default as Web3 } from 'web3'
import StandingOrderListContainer from './StandingOrderListContainer'
import NewOrderButton from "./NewOrderButton"
import standingOrderFactory_artifacts from '../build/contracts/StandingOrderFactory.json'
import standingOrder_artifacts from '../build/contracts/StandingOrder.json'

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
            orderContract: null,
            factoryInstance: null,
            account: null,
        }

        this.handleNewOutgoingOrder = this.handleNewOutgoingOrder.bind(this)
    }

    handleNewOutgoingOrder(order) {
        var self = this
        // get accounts
        self.web3RPC.eth.getAccounts(function (error, accounts) {
            return self.state.factoryInstance.createStandingOrder(order.receiver, order.rate, order.period, order.label, {
                from: accounts[0],
                gas: 1000000
            }).then(function (result) {
                console.log('Created StandingOrder - transaction: ' + result.tx)
                console.log(result.receipt)
            })
        })
    }

    componentWillMount() {
        // So we can update state later.
        var self = this

        // TODO - Refactor this - no need to explicitly use this?
        self.web3RPC = window.web3

        // Get the RPC provider and setup our contracts.
        const provider = new Web3.providers.HttpProvider('http://localhost:8545')
        const contract = require('truffle-contract')
        self.factoryContract = contract(standingOrderFactory_artifacts)
        self.factoryContract.setProvider(provider)
        var orderContract = contract(standingOrder_artifacts)
        orderContract.setProvider(provider)
        self.setState({orderContract: orderContract})

        // Get currently selected account
        self.setState({account: self.web3RPC.eth.accounts[0]})
        // keep an eye on the account - the user might switch his current account in Metamask
        // see the FAQ: https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
        var accountInterval = setInterval(function() {
            if (self.web3RPC.eth.accounts[0] !== self.state.account) {
                console.log("User switched account from " + self.state.account + " to " + self.web3RPC.eth.accounts[0])
                self.setState({account: self.web3RPC.eth.accounts[0]})
            }
        }, 100);

        // Get factory
        self.factoryContract.deployed().then(function (factory_instance) {
            self.setState({factoryInstance: factory_instance})
        })
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
                            <StandingOrderListContainer
                                account={this.state.account}
                                factoryInstance={this.state.factoryInstance}
                                orderContract={this.state.orderContract}
                                outgoing={false}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={8}>
                            <StandingOrderListContainer
                                account={this.state.account}
                                factoryInstance={this.state.factoryInstance}
                                orderContract={this.state.orderContract}
                                outgoing={true}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={8}>
                            <NewOrderButton onNewOrder={this.handleNewOutgoingOrder}/>
                        </Col>
                    </Row>
                </Grid>
            </div>
        )
    }
}

export default App
