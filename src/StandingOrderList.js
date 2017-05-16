import React, {Component} from 'react'
import {Panel, Label, Table} from 'react-bootstrap'
import StandingOrderContainer from './StandingOrderContainer'
import NewOrderButton from "./NewOrderButton"
import EtherDisplay from "./EtherDisplay"

class StandingOrderList extends Component {

    renderAsIncoming() {
        // Prepare table rows for incoming orders
        let rows = []
        this.props.Orders.forEach((order) => {
            rows.push(<StandingOrderContainer
                orderInstance={order}
                key={order.address}
                account={this.props.account}
                outgoing={this.props.outgoing}
            />)
        })

        console.log("Rendering IncomingOrderList for account " + this.props.account)

        var collectible = window.web3.toBigNumber('75542205000000000')

        const incomingHeader = <div>
            <h4>Incoming orders <Label bsStyle="success">
                <EtherDisplay wei={collectible}/> available!
            </Label>
            </h4>
        </div>

        return <Panel collapsible defaultExpanded header={incomingHeader} bsStyle="success">
            <Table fill striped hover>
                <thead>
                <tr>
                    <td>&nbsp;</td>
                    <td>Label</td>
                    <td>From</td>
                    <td>Available</td>
                    <td>Next Payment</td>
                </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </Panel>
    }

    renderAsOutgoing() {
        // Prepare table rows for outgoing orders
        let rows = []
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

        const outgoingHeader = <div>
            <h4>Outgoing orders <Label bsStyle="danger">1 Order with insufficient funds!</Label></h4>
        </div>

        return <Panel collapsible defaultExpanded header={outgoingHeader} bsStyle="primary">
            <Table fill striped hover>
                <thead>
                <tr>
                    <td>&nbsp;</td>
                    <td>Label</td>
                    <td>To</td>
                    <td>Amount</td>
                    <td>Intervall</td>
                    <td>Remaining</td>
                    <td>Funded until</td>
                    <td>Unclaimed</td>
                    <td>&nbsp;</td>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
            <NewOrderButton label="Create new Order" factoryInstance={this.props.factoryInstance}/>
        </Panel>
    }

    render() {
        if (this.props.outgoing)
            return this.renderAsOutgoing()
        else
            return this.renderAsIncoming()
    }
}

export default StandingOrderList
