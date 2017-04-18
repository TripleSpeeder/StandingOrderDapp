import React, {Component} from 'react';
import {Table, Button} from 'react-bootstrap';

class OutgoingOrderList extends Component {

    render() {
        // Prepare table rows for incoming orders
        const listItems = this.props.outgoingOrders.map((order) =>
            <tr key={order.address}>
                <td>{order.address}</td>
                <td>{order.payee}</td>
                <td>{order.paymentAmount}</td>
                <td>{order.paymentInterval}</td>
                <td>{order.ownerFunds}</td>
                <td>{order.funded_until}</td>
                <td>{order.owner_funds > 0 && <Button>Withdraw</Button> } <Button bsStyle="danger">Cancel</Button></td>
            </tr>
        );

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
                        {listItems}
                    </tbody>
                </Table>
            </div>

    }
}

export default OutgoingOrderList
