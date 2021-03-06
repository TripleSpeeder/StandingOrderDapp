import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Panel, Table} from 'react-bootstrap'
import StandingOrderContainer from './StandingOrderContainer'
import NewOrderButton from "./NewOrderButton"

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
                networkID={this.props.networkID}
            />)
        })

        console.log("Rendering IncomingOrderList for account " + this.props.account)

        const incomingHeader = <div>
            <h4>Incoming orders</h4>
        </div>

        return <Panel collapsible defaultExpanded header={incomingHeader} bsStyle="success">
            <Table fill striped hover>
                <thead>
                <tr>
                    <td style={{width:"40px"}}></td>
                    <td>Label</td>
                    <td>From</td>
                    <td>Amount</td>
                    <td>Intervall</td>
                    <td>Available</td>
                    <td>Collected</td>
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
                outgoing={this.props.outgoing}
                networkID={this.props.networkID}
            />)
        })

        console.log("Rendering StandingOrderList for account " + this.props.account)

        const outgoingHeader = <div>
            <h4>Outgoing orders</h4>
        </div>

        return <Panel collapsible defaultExpanded header={outgoingHeader} bsStyle="primary">
            <Table fill striped hover>
                <thead>
                <tr>
                    <td style={{width:"40px"}}></td>
                    <td>Label</td>
                    <td>To</td>
                    <td>Amount</td>
                    <td>Intervall</td>
                    <td>Remaining</td>
                    <td>Unclaimed</td>
                    <td>Funded until</td>
                    <td>&nbsp;</td>
                </tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </Table>
            <NewOrderButton
                label="Create new Order"
                account={this.props.account}
                factoryInstance={this.props.factoryInstance}/>
        </Panel>
    }

    render() {
        if (this.props.outgoing)
            return this.renderAsOutgoing()
        else
            return this.renderAsIncoming()
    }
}

StandingOrderList.propTypes = {
    networkID: PropTypes.number.isRequired,
}


export default StandingOrderList
