import React, {Component} from 'react'
import {
    Grid,
    Navbar,
    NavItem,
    Jumbotron,
    Nav,
    Row,
    Col,
    Panel,
} from 'react-bootstrap'
import StandingOrderListContainer from './StandingOrderListContainer'
import standingOrderFactory_artifacts from '../build/contracts/StandingOrderFactory.json'
import standingOrder_artifacts from '../build/contracts/StandingOrder.json'
import HeaderAddress from './HeaderAddress'
import Web3 from 'web3'

const PromisifyWeb3 = require("./promisifyWeb3.js");

class App extends Component {

    constructor(props) {
        super(props)

        // Setup initial state
        this.state = {
            orderContract: null,
            factoryInstance: null,
            account: null,
            web3Available: false,
            web3APIVersion: null,
            web3NodeVersion: null,
            network: null,
        }

        this.initialize = this.initialize.bind(this)
        this.onAccountSelected = this.onAccountSelected.bind(this)

        var self = this
        window.addEventListener('load', function () {
            // Checking if Web3 has been injected by the browser (Mist/MetaMask)
            if (typeof web3 !== 'undefined') {
                console.warn('Using web3 detected from external source.')
                // Use Mist/MetaMask's provider
                // eslint-disable-next-line no-undef
                window.web3 = new Web3(web3.currentProvider)
            }
            PromisifyWeb3.promisify(window.web3);
            self.initialize()
        })
    }

    initialize() {
        var self = this

        // TODO - Refactor this - no need to explicitly use this?
        self.web3RPC = window.web3

        // get version and network info
        self.setState({web3APIVersion: window.web3.version.api})
        window.web3.version.getNode(function(error, result){
            self.setState({ web3NodeVersion: result,})
        })
        window.web3.version.getNetwork((err, netId) => {
            let network = 'unknown'
            switch (netId) {
                case "1":
                    network = 'mainnet'
                    break
                case "2":
                    network = 'Morden (deprecated!)'
                    break
                case "3":
                    network = 'Ropsten'
                    break
                case "4":
                    network = 'Rinkeby'
                    break
                case "42":
                    network = 'Kovan'
                    break
                case "61":
                    network = 'ETC'
                    break
                case "62":
                    network = 'ETC Testnet'
                    break
                default:
                    network = 'Unknown'
            }
            self.setState({ network: network})
        })

        // provider-specific account-handling
        if(typeof mist !== 'undefined') {
            console.log("Mist detected. Looking for provided accounts...")
            if (window.web3.eth.accounts.length >= 1) {
                // by default select first account
                self.onAccountSelected(self.web3RPC.eth.accounts[0])
            } else {
                // ask mist user to share account with me
                // eslint-disable-next-line no-undef
                mist.requestAccount(function(e, address){
                    console.log('Added new account', address)
                    console.log('e:', e)
                    self.onAccountSelected(address)
                });
            }
        } else if (window.web3.currentProvider.isMetaMask === true) {
            console.log("Metamask detected. Trying to use first account")
            if (window.web3.eth.accounts.length >= 1) {
                // by default select first account
                self.onAccountSelected(self.web3RPC.eth.accounts[0])
            }
            // keep an eye on the account - the user might switch his current account in Metamask
            // see the FAQ: https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
            setInterval(function () {
                if (self.web3RPC.eth.accounts[0] !== self.state.account) {
                    console.log("User switched account from " + self.state.account + " to " + self.web3RPC.eth.accounts[0])
                    self.onAccountSelected(self.web3RPC.eth.accounts[0])
                }
            }, 100)
        } else {
            console.log("Unknown environment.")
            if (window.web3.eth.accounts.length >= 1) {
                // by default select first account
                self.onAccountSelected(self.web3RPC.eth.accounts[0])
            } else {
                console.error("No account available :-(")
            }
        }

        // setup our contracts
        const contract = require('truffle-contract')
        self.factoryContract = contract(standingOrderFactory_artifacts)
        self.factoryContract.setProvider(window.web3.currentProvider)
        const orderContract = contract(standingOrder_artifacts)
        orderContract.setProvider(window.web3.currentProvider)
        self.setState({orderContract: orderContract})

        // start async initialization
        var promises = []
        // Get contract factory
        promises.push(self.factoryContract.deployed().then(function (factory_instance) {
            self.setState({factoryInstance: factory_instance})
        }))

        // App is ready when all promises are resolved.
        Promise.all(promises).then(function () {
            // console.log("app initialization complete!")
            self.setState({web3Available: true})
        })
    }

    onAccountSelected(newAccount) {
        this.setState({
                account: newAccount
            })
    }

    render() {
        let header = <Navbar>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="/">STORSDapp</a>
                    </Navbar.Brand>
                </Navbar.Header>
                <Nav>
                    <NavItem eventKey={2} target="_blank" href="https://github.com/TripleSpeeder/StandingOrderDapp/blob/master/contracts/StandingOrder.sol">Contract</NavItem>
                </Nav>
            </Navbar>

        let body
        if (this.state.web3Available) {
            body = <Grid>
                <Jumbotron>
                    <HeaderAddress account={this.state.account}
                                   handleChange={this.onAccountSelected}
                    />
                </Jumbotron>

                <StandingOrderListContainer
                    account={this.state.account}
                    factoryInstance={this.state.factoryInstance}
                    orderContract={this.state.orderContract}
                    outgoing={true}
                />

                <StandingOrderListContainer
                    account={this.state.account}
                    factoryInstance={this.state.factoryInstance}
                    orderContract={this.state.orderContract}
                    outgoing={false}
                />
                <Row>
                    <Col md={12}>
                        <Panel>
                            Network: {this.state.network} - Web3 API version: {this.state.web3APIVersion} - Node version: {this.state.web3NodeVersion}
                        </Panel>
                    </Col>
                </Row>
            </Grid>
        } else {
            body = <Grid>
                <Jumbotron>
                    <h2>Web3 not available</h2>
                </Jumbotron>
            </Grid>
        }

        return <div>
            {header}
            {body}
        </div>

    }
}

export default App
