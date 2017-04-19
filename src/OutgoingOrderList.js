import React, {Component} from 'react';
import {Table} from 'react-bootstrap';
import OutgoingOrderRow from './OutgoingOrderRow'
import { default as Web3 } from 'web3'

class OutgoingOrderList extends Component {

    constructor(props){
        super(props)
        this.handleFundContract = this.handleFundContract.bind(this)
    }

    handleFundContract(contract_address) {
        var self = this
        console.log("Funding contract " + contract_address)

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

    render() {
        // Prepare table rows for incoming orders
        var rows = []
        this.props.outgoingOrders.forEach((order) => {
            rows.push(<OutgoingOrderRow
                order={order}
                key={order.address}
                onFundContract={this.handleFundContract}
            />)
        })

        return <div>
                <h3>Outgoing orders</h3>
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Address</th>
                        <th>Payee</th>
                        <th>Amount</th>
                        <th>Interval</th>
                        <th>Owned funds remaining</th>
                        <th>Funded until</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </Table>
            </div>

    }
}

export default OutgoingOrderList
