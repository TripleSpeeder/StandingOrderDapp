import React, {Component} from 'react';
import {Table, Button} from 'react-bootstrap';

class IncomingOrderList extends Component {

    render() {
        // Prepare table rows for incoming orders
        const listItems = this.props.incomingOrders.map((order) =>
            <tr key={order.sender}>
                <td>{order.sender}</td>
                <td>{order.rate}</td>
                <td>{order.period}</td>
                <td>{order.available_amount}</td>
                <td>{order.available_amount > 0 && <Button>Collect!</Button> }</td>
            </tr>
        );

        return <div>
                <h3>Incoming orders</h3>
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Sender</th>
                        <th>Rate</th>
                        <th>Period</th>
                        <th>Available amount</th>
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

export default IncomingOrderList
