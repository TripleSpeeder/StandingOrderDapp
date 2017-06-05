import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Glyphicon} from 'react-bootstrap'
import {secondsToDisplayString} from './Utils'
import {DoubleBounce} from 'better-react-spinkit'
import EtherDisplay from './EtherDisplay'
import OutgoingFundsButtonContainer from './OutgoingFundsButtonContainer'
import IncomingFundsButtonContainer from './IncomingFundsButtonContainer'

class StandingOrder extends Component {

    constructor(props) {
        super(props)

        this.handleCancel = this.handleCancel.bind(this)
    }

    handleCancel(event) {
        // Completely cancel contract
        this.props.onCancelContract()
        event.preventDefault()
    }

    renderAsIncoming() {
        return <tr>
            <td>
                {this.props.isLoading && <DoubleBounce /> }
            </td>
            <td>
                <strong>{this.props.order.ownerLabel}</strong>
            </td>
            <td>{this.props.order.owner}</td>
            <td><EtherDisplay wei={this.props.order.paymentAmount}/></td>
            <td>{secondsToDisplayString(this.props.order.paymentInterval.toNumber())}</td>
            <td>
                <IncomingFundsButtonContainer
                    order={this.props.order}
                    onCollect={this.handleCollect}/>
            </td>
            <td><EtherDisplay wei={this.props.order.claimedFunds}/></td>
            <td>{this.props.order.nextPaymentDate.format()}</td>
        </tr>
    }

    renderAsOutgoing() {
        return <tr>
            <td>
                {this.props.isLoading && <DoubleBounce /> }
            </td>
            <td>
                <strong>{this.props.order.ownerLabel}</strong>
            </td>
            <td>{this.props.order.payee}</td>
            <td><EtherDisplay wei={this.props.order.paymentAmount}/></td>
            <td>{secondsToDisplayString(this.props.order.paymentInterval.toNumber())}</td>
            <td>
                <OutgoingFundsButtonContainer
                    order={this.props.order}
                    onWithdraw={this.props.onWithdrawOwnerFunds}
                />
            </td>
            <td>{this.props.order.failureDate.format()}</td>
            <td><EtherDisplay wei={this.props.order.collectibleFunds}/></td>
            <td>
                <Button
                    bsStyle="danger"
                    bsSize="small"
                    title="Delete"
                    disabled={!this.props.order.cancelEnabled}
                    onClick={this.handleCancel}>
                    <Glyphicon glyph="trash"/>
                </Button>
            </td>

        </tr>
    }

    render() {
        if (!this.props.order) {
            return <tr>
                <td>
                    <DoubleBounce />
                </td>
                <td colSpan={7}>Loading...</td>
            </tr>
        }

        if (this.props.outgoing)
            return this.renderAsOutgoing()
        else
            return this.renderAsIncoming()
    }
}

StandingOrder.propTypes = {
    outgoing: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
}

export default StandingOrder