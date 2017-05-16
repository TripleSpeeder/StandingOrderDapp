import React, {Component} from 'react'
import {
    Grid,
    Navbar,
    NavItem,
    Jumbotron,
    Nav,
} from 'react-bootstrap'
import {default as Web3} from 'web3'
import StandingOrderListContainer from './StandingOrderListContainer'
import standingOrderFactory_artifacts from '../build/contracts/StandingOrderFactory.json'
import standingOrder_artifacts from '../build/contracts/StandingOrder.json'
import HeaderAddress from './HeaderAddress'


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

    initialize() {
        var self = this
        var promises = []

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
        setInterval(function () {
            if (self.web3RPC.eth.accounts[0] !== self.state.account) {
                console.log("User switched account from " + self.state.account + " to " + self.web3RPC.eth.accounts[0])
                self.setState({account: self.web3RPC.eth.accounts[0]})
            }
        }, 100)

        // Get factory
        promises.push(self.factoryContract.deployed().then(function (factory_instance) {
            self.setState({factoryInstance: factory_instance})
        }))

        Promise.all(promises).then(function () {
            // console.log("app initialization complete!")
            self.setState({web3Available: true})
        })
    }

    render() {
        if (this.state.web3Available === false) {
            console.log("App.render: Web3 not yet injected!")
            return <div>
                <h1>Waiting for web3...</h1>
            </div>
        }

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
            </Grid>
        </div>

    }
}

export default App
