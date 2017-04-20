import React, {Component} from 'react';
import {Table} from 'react-bootstrap';
import OutgoingOrderContainer from './OutgoingOrderContainer'
import { default as Web3 } from 'web3'

class OutgoingOrderList extends Component {

    render() {
        // Prepare table rows for incoming orders
        var rows = []
        this.props.outgoingOrders.forEach((order) => {
            rows.push(<OutgoingOrderContainer
                order={order}
                key={order.address}
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
