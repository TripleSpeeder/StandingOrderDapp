import React, {Component} from 'react'
import {
    Grid,
    Row,
    Col,
    Navbar,
    NavItem,
    Jumbotron,
    Button,
    Nav,
    Glyphicon,
    Panel,
    Label,
    Table,
    ButtonGroup,
} from 'react-bootstrap'
import {default as Web3} from 'web3'
import StandingOrderListContainer from './StandingOrderListContainer'
import NewOrderButton from "./NewOrderButton"
import standingOrderFactory_artifacts from '../build/contracts/StandingOrderFactory.json'
import standingOrder_artifacts from '../build/contracts/StandingOrder.json'
import HeaderAddress from "./HeaderAddress"


class App extends Component {

    constructor(props) {
        super(props)

        // Setup initial state
        this.state = {
            orderContract: null,
            factoryInstance: null,
            account: null,
            web3Available: false
        }

        this.handleNewOutgoingOrder = this.handleNewOutgoingOrder.bind(this)
        this.initialize = this.initialize.bind(this)

        var self = this
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
            self.initialize()
        })
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

    initialize() {
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
        var acc = self.web3RPC.eth.accounts[0]
        // This might be a bug in metamask? Anyway, make sure that account is NULL if it is undefined...
        if (acc === undefined)
            acc = null
        self.setState({account: acc})

        // keep an eye on the account - the user might switch his current account in Metamask
        // see the FAQ: https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
        var accountInterval = setInterval(function () {
            if (self.web3RPC.eth.accounts[0] !== self.state.account) {
                console.log("User switched account from " + self.state.account + " to " + self.web3RPC.eth.accounts[0])
                self.setState({account: self.web3RPC.eth.accounts[0]})
            }
        }, 100)

        // Get factory
        self.factoryContract.deployed().then(function (factory_instance) {
            self.setState({factoryInstance: factory_instance})
        })

        self.setState({web3Available: true})
    }

    newRender() {
        var incomingHeader = <div>
            <h4>Incoming orders <Label bsStyle="success">5.234 ETH available!</Label></h4>
            </div>

        var outgoingHeader = <div>
            <h4>Outgoing orders <Label bsStyle="danger">1 Order with insufficient funds!</Label></h4>
            </div>

        return <div>
            <Navbar>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="#">STORSDapp</a>
                    </Navbar.Brand>
                </Navbar.Header>
                <Nav>
                    <NavItem eventKey={1} href="#">Info</NavItem>
                    <NavItem eventKey={2} href="#">FAQ</NavItem>
                    <NavItem eventKey={2} href="#">Contract</NavItem>
                    <NavItem eventKey={2} href="#">Github</NavItem>
                </Nav>
            </Navbar>

            <Grid>
                <Jumbotron>
                    <HeaderAddress account={this.state.account}/>
                </Jumbotron>

                <Panel collapsible defaultExpanded header={outgoingHeader} bsStyle="primary">
                    <Table fill striped hover>
                        <thead>
                        <tr>
                            <td>&nbsp;</td>
                            <td>Label</td>
                            <td>To</td>
                            <td>Amount</td>
                            <td>Intervall</td>
                            <td>Remaining</td>
                            <td>Unclaimed</td>
                            <td>&nbsp;</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>1</td>
                            <td>
                                <strong>Rent</strong>
                            </td>
                            <td>0x1823455667788999</td>
                            <td>0.5 ETH</td>
                            <td>1 month</td>
                            <td>1.45 ETH <ButtonGroup>
                                    <Button bsStyle="success" bsSize="small" title="Add Funds">
                                        <Glyphicon glyph="upload"/>
                                    </Button>
                                    <Button bsStyle="warning" bsSize="small" title="Withdraw Funds">
                                        <Glyphicon glyph="download"/>
                                    </Button>
                                </ButtonGroup>
                            </td>
                            <td>0.2 ETH</td>
                            <td>
                                <Button bsStyle="danger" bsSize="small" title="Delete">
                                    <Glyphicon glyph="trash"/>
                                </Button>
                            </td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>
                                <Label bsStyle="danger" title="Insufficient funds!">
                                    <Glyphicon glyph="alert"/>
                                </Label>
                                <strong> Monthly paycheck John</strong>
                            </td>
                            <td>0x1823455667788999</td>
                            <td>1.5 ETH</td>
                            <td>1 month</td>
                            <td>0.00 ETH <ButtonGroup>
                                    <Button bsStyle="success" bsSize="small" title="Add Funds">
                                        <Glyphicon glyph="upload"/>
                                    </Button>
                                    <Button bsStyle="warning" bsSize="small" disabled title="Withdraw Funds">
                                        <Glyphicon glyph="download"/>
                                    </Button>
                                </ButtonGroup>
                            </td>
                            <td>1.258805 ETH</td>
                            <td>
                                <Button bsStyle="danger" bsSize="small" title="Delete">
                                    <Glyphicon glyph="trash"/>
                                </Button>
                            </td>
                        </tr>
                        </tbody>
                    </Table>
                    <p>
                        <Button bsStyle="primary" >Create new Order</Button>
                    </p>
                </Panel>

                <Panel collapsible defaultExpanded header={incomingHeader} bsStyle="success">
                    <Table fill striped hover>
                        <thead>
                        <tr>
                            <td>&nbsp;</td>
                            <td>Label</td>
                            <td>From</td>
                            <td>Available</td>
                            <td>Next Payment</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>1</td>
                            <td><strong>Rent</strong></td>
                            <td>0x1823455667788999</td>
                            <td>1.45 ETH <Button bsStyle="primary" bsSize="small" title="Collect">
                                <Glyphicon glyph="download"/>
                            </Button>
                            </td>
                            <td>05.03.2017</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td><strong>Weekly support</strong></td>
                            <td>0x1823455667788999</td>
                            <td>0.00 ETH <Button bsStyle="primary" bsSize="small" disabled>
                                <Glyphicon glyph="download"/>
                            </Button>
                            </td>
                            <td>15.05.2017</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td><strong>Thanks for your work on github!</strong></td>
                            <td>0x1823455667788999</td>
                            <td>0.45 ETH <Button bsStyle="primary" bsSize="small" title="Collect">
                                <Glyphicon glyph="download"/>
                            </Button></td>
                            <td>05.03.2017</td>
                        </tr>
                        </tbody>
                    </Table>
                </Panel>
            </Grid>

        </div>
    }

    render() {
        if (this.state.web3Available === false) {
            console.log("App.render: Web3 not yet injected!")
            return <div>
                <h1>Waiting for web3...</h1>
            </div>
        }

        return this.newRender()

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
