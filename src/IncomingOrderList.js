import React, {Component} from 'react';
import {Table} from 'react-bootstrap';
import IncomingOrderContainer from './IncomingOrderContainer'

class IncomingOrderList extends Component {

    render() {
        // Prepare table rows for incoming orders
        var rows = []
        this.props.incomingOrders.forEach((order) => {
            rows.push(<IncomingOrderContainer
                orderInstance={order}
                key={order.address}
            />)
        })

        console.log("Rendering IncomingOrderList for account " + this.props.account)

        return <div>
                <h3>Incoming orders</h3>
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Address</th>
                        <th>Owner</th>
                        <th>Payee</th>
                        <th>Interval</th>
                        <th>Collectable amount</th>
                        <th>Next payment</th>
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

export default IncomingOrderList
