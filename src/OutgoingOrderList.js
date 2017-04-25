import React, {Component} from 'react';
import {Table} from 'react-bootstrap';
import OutgoingOrderContainer from './OutgoingOrderContainer'

class OutgoingOrderList extends Component {

    render() {
        // Prepare table rows for incoming orders
        var rows = []
        this.props.outgoingOrders.forEach((order) => {
            rows.push(<OutgoingOrderContainer
                orderInstance={order}
                account={this.props.account}
                key={order.address}
            />)
        })

        console.log("Rendering OutgoingOrderList for account " + this.props.account)

        return <div>
                <h3>Outgoing orders</h3>
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Address</th>
                        <th>Owner</th>
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
