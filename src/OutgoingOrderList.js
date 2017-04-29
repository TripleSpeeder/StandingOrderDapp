import React, {Component} from 'react';
import {Table} from 'react-bootstrap';
import StandingOrderContainer from './StandingOrderContainer'

class OutgoingOrderList extends Component {

    render() {
        // Prepare table rows for outgoing orders
        var rows = []
        this.props.outgoingOrders.forEach((order) => {
            rows.push(<StandingOrderContainer
                orderInstance={order}
                key={order.address}
                account={this.props.account}
                onRemoveOrder={this.props.onRemoveOrder}
                outgoing={true}
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
