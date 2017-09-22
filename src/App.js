import React, {Component} from 'react'
import {
    Grid,
    Navbar,
    NavItem,
    Jumbotron,
    Nav,
    Panel,
} from 'react-bootstrap'
import StandingOrderListContainer from './StandingOrderListContainer'
import standingOrderFactory_artifacts from '../build/contracts/StandingOrderFactory.json'
import standingOrder_artifacts from '../build/contracts/StandingOrder.json'
import HeaderAddress from './HeaderAddress'
import Web3 from 'web3'
import contract from 'truffle-contract'

const PromisifyWeb3 = require("./promisifyWeb3.js")

class App extends Component {

    constructor(props) {
        super(props)

        // Setup initial state
        this.state = {
            orderContract: null,
            factoryInstance: null,
            account: null,
            accounts: [],
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
                console.log('Using web3 detected from external source.')
                // Use Mist/MetaMask's provider
                // eslint-disable-next-line no-undef
                window.web3 = new Web3(web3.currentProvider)
            }
            // FIXME - Probably can be removed once web3.js 1.0 is released
            PromisifyWeb3.promisify(window.web3)

            self.initialize()
        })
    }

    initialize() {
        var self = this

        // Store promises that need to be resolved for successfull initialization
        var promises = []

        // get version and network info
        self.setState({web3APIVersion: window.web3.version.api})
        promises.push(window.web3.version.getNode(function (error, result) {
            self.setState({web3NodeVersion: result,})
        }))
        promises.push(window.web3.version.getNetworkPromise().then((netId) => {
            let network = 'unknown'
            switch (netId) {
                case "6666":
                    network = 'local dev'
                    break
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
            network += ' (' + netId + ')'
            console.log("Running on network " + network)
            self.setState({network: network})
        }))

        // get accounts
        promises.push(window.web3.eth.getAccountsPromise().then(function (_accounts) {
                if (_accounts.length >= 1) {
                    self.setState({accounts: _accounts})
                    // by default select first account
                    self.onAccountSelected(_accounts[0])
                } else {
                    console.warn("No accounts available!")

                    // Check if running mist - then we can ask the user to provide accounts.
                    if (typeof mist !== 'undefined') {
                        // ask mist user to share account with me
                        // eslint-disable-next-line no-undef
                        mist.requestAccount(function (e, _accounts) {
                            // by default select first account
                            self.onAccountSelected(_accounts[0])
                            self.setState({accounts: _accounts})
                        })
                    }
                }
            })
        )

        // If running under metamask keep an eye on the account - the user might switch his current account anytime
        // see the FAQ: https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md#ear-listening-for-selected-account-changes
        if (window.web3.currentProvider.isMetaMask === true) {
            console.log("Metamask detected. Watching for account changes")
            setInterval(function () {
                window.web3.eth.getAccountsPromise().then(function (_accounts) {
                    let oldAccount = self.state.account
                    let newAccount = _accounts[0]
                    if (newAccount !== oldAccount) {
                        console.log("User switched account from " + oldAccount + " to " + newAccount)
                        self.setState({accounts: _accounts})
                        self.onAccountSelected(newAccount)
                    }
                })
            }, 100)
        }

        // setup our contracts
        self.factoryContract = contract(standingOrderFactory_artifacts)
        self.factoryContract.setProvider(window.web3.currentProvider)
        const orderContract = contract(standingOrder_artifacts)
        orderContract.setProvider(window.web3.currentProvider)
        self.setState({orderContract: orderContract})

        // Get contract factory
        //
        // Horrible workaround to fix deployed contracts not being found when running in mist. See
        // https://ethereum.stackexchange.com/questions/24117/how-can-i-get-my-dapp-interface-to-work-on-mist-im-using-truffle-framework-and
        window.web3.version.getNetworkPromise().then((netId) => {
            console.log("MIST + TRUFFLE Workaround: Got NetID: " + netId)
            promises.push(self.factoryContract.deployed().then(function (factory_instance) {
                self.setState({factoryInstance: factory_instance})
            }))
            // App is ready when all promises are resolved.
            Promise.all(promises).then(function () {
                // console.log("app initialization complete!")
                self.setState({web3Available: true})
            })
        })
    }

    onAccountSelected(newAccount) {
        console.log("Selecting account " + newAccount)
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
                <NavItem eventKey={2} target="_blank"
                         href="https://github.com/TripleSpeeder/StandingOrderDapp/blob/master/contracts/StandingOrder.sol">Contract</NavItem>
            </Nav>
        </Navbar>

        let jumbo, outList, inList, footer
        if (this.state.web3Available) {
            jumbo =
                <Jumbotron>
                    <HeaderAddress account={this.state.account}
                                   accounts={this.state.accounts}
                                   handleChange={this.onAccountSelected}
                    />
                </Jumbotron>
            outList = <StandingOrderListContainer
                account={this.state.account}
                factoryInstance={this.state.factoryInstance}
                orderContract={this.state.orderContract}
                outgoing={true}
            />
            inList = <StandingOrderListContainer
                account={this.state.account}
                factoryInstance={this.state.factoryInstance}
                orderContract={this.state.orderContract}
                outgoing={false}
            />
        } else {
            jumbo = <Jumbotron>
                <h2>Web3 not available</h2>
            </Jumbotron>
        }

        footer = <Panel>
            Network: {this.state.network} | Web3 API version: {this.state.web3APIVersion} | Node
            version: {this.state.web3NodeVersion}
        </Panel>


        return <div>
            {header}
            <Grid>
                {jumbo}
                {outList}
                {inList}
                {footer}
            </Grid>
        </div>

    }
}

export default App
