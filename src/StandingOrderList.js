import React, {Component} from 'react';
import {Table} from 'react-bootstrap';
import StandingOrderContainer from './StandingOrderContainer'

class StandingOrderList extends Component {

    renderAsIncoming(){
        // Prepare table rows for incoming orders
        var rows = []
        this.props.Orders.forEach((order) => {
            rows.push(<StandingOrderContainer
                orderInstance={order}
                key={order.address}
                outgoing={this.props.outgoing}
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

    renderAsOutgoing(){
        // Prepare table rows for outgoing orders
        var rows = []
        this.props.Orders.forEach((order) => {
            rows.push(<StandingOrderContainer
                orderInstance={order}
                key={order.address}
                account={this.props.account}
                onRemoveOrder={this.props.onRemoveOrder}
                outgoing={this.props.outgoing}
            />)
        })

        console.log("Rendering StandingOrderList for account " + this.props.account)

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

    render() {
        if (this.props.outgoing)
            return this.renderAsOutgoing()
        else
            return this.renderAsIncoming()
    }
}

export default StandingOrderList
