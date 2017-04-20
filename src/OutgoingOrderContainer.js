import React, {Component} from 'react'
import OutgoingOrder from './OutgoingOrder'

class OutgoingOrderContainer extends Component {

    constructor(props){
        super(props)
        this.state = {
            orderInstance: props.orderInstance
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

    // Create flatOrder dictionary from orderInstance
    _extract(orderInstance) {
        // TODO: real implementation
        return {
            address: '0x123456789',
            payee:   '0x987654321',
            paymentAmount: 1000,
            paymentInterval: 10,
            ownerFunds: 40000,
            funded_until: 'TODO'
        }
    }

    render() {
        var flatOrder = this._extract(this.state.orderInstance)
        return <OutgoingOrder
            order={flatOrder}
            onFundContract={this.handleFundContract}
        />
    }
}

export default OutgoingOrderContainer