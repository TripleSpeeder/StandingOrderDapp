import React, {Component} from 'react'
import OutgoingOrder from './OutgoingOrder'

class OutgoingOrderContainer extends Component {

    constructor(props){
        super(props)
        this.state = {
            orderInstance: props.orderInstance,
            flatOrder: {
                address: '0x0',
                payee:   '0x0',
                paymentAmount: 0,
                paymentInterval: 0,
                ownerFunds: 0,
                funded_until: ''
            }
        }
        this.handleFundContract = this.handleFundContract.bind(this)
    }

    handleFundContract() {
        var contract_address = this.state.orderInstance.address
        console.log("Funding contract " + this.state.orderInstance)

        window.web3.eth.getAccounts(function (error, accounts) {
            var transaction_object = {
                from: accounts[0],
                to: contract_address,
                value: window.web3.toWei('1', 'ether')
            }
            window.web3.eth.sendTransaction(transaction_object, function (err, address) {
                if (err) {
                    console.log("Error while sending transaction: ")
                    console.log(err)
                } else {
                    console.log("Contract funded. Transaction address: " + address)
                }
            })
        })
    }

    orderToState(order_instance) {
        var self = this

        // address is immediately available
        var flatOrder = {
            address: order_instance.address
        }

        // get all other info via call() and promises
        var promises = []
        promises.push(order_instance.payee.call().then(function (payee) {
            flatOrder.payee = payee
        }))
        promises.push(order_instance.paymentAmount.call().then(function (amount) {
            flatOrder.paymentAmount = amount.toString()
        }))
        promises.push(order_instance.paymentInterval.call().then(function (interval) {
            flatOrder.paymentInterval = interval.toString()
        }))
        promises.push(order_instance.getOwnerFunds.call().then(function (ownerFunds) {
            flatOrder.ownerFunds = ownerFunds.toString()
        }))

        Promise.all(promises).then(function () {
            console.log("All promises resolved!")
            self.setState({
                flatOrder: flatOrder
            })
        })
    }

    componentWillMount() {
        // start update of flatOrder
        this.orderToState(this.state.orderInstance)
    }

    render() {
        return <OutgoingOrder
            order={this.state.flatOrder}
            onFundContract={this.handleFundContract}
        />
    }
}

export default OutgoingOrderContainer