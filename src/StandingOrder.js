import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, ButtonGroup, Glyphicon, Label} from 'react-bootstrap'
import RelabelButton from "./RelabelButton"
import FundOrderButton from "./FundOrderButton"
import { secondsToDisplayString} from "./Utils"
import EtherDisplay from "./EtherDisplay"

class StandingOrder extends Component {

    handleWithdraw(event) {
        // Withdraw ownerfunds from contract
        this.props.onWithdrawOwnerFunds()
        event.preventDefault()
    }

    handleCancel(event) {
        // Completely cancel contract
        this.props.onCancelContract()
        event.preventDefault()
    }

    handleCollect(event) {
        // Withdraw ownerfunds from contract
        this.props.onCollectFunds()
        event.preventDefault()
    }

    renderAsIncoming() {
        return <tr>
            <td>
                <strong>{this.props.order.payeeLabel}</strong> <RelabelButton label={this.props.order.payeeLabel} onRelabel={this.props.onRelabel}/>
            </td>
            <td>{this.props.order.owner}</td>
            <td>
                <EtherDisplay wei={this.props.order.collectibleFunds}/>
                <Button
                    bsStyle="primary"
                    bsSize="small"
                    title="Collect"
                    disabled={!this.props.order.collectibleFunds.greaterThan(0)}
                    onClick={this.handleCollect.bind(this)}>
                    <Glyphicon glyph="download"/>
                </Button>
            </td>
            <td>{this.props.order.nextPaymentDate.format()}</td>
        </tr>
    }

    renderAsOutgoing() {
        return <tr>
            <td>
                {this.props.order.fundsInsufficient &&
                <Label bsStyle="danger" title="Insufficient funds!">
                    <Glyphicon glyph="alert"/>
                </Label> }<strong>{this.props.order.ownerLabel}</strong>
            </td>
            <td>{this.props.order.payee}</td>
            <td><EtherDisplay wei={this.props.order.paymentAmount}/></td>
            <td>{secondsToDisplayString(this.props.order.paymentInterval.toNumber())}</td>
            <td>
                <EtherDisplay wei={this.props.order.ownerFunds}/>
                <ButtonGroup>
                    <FundOrderButton order={this.props.order} onFund={this.props.onFundContract}/>
                    <Button bsStyle="warning" bsSize="small" title="Withdraw Funds" disabled={!this.props.order.withdrawEnabled}
                            onClick={this.handleWithdraw.bind(this)}>
                        <Glyphicon glyph="download"/>
                    </Button>
                </ButtonGroup>
            </td>
            <td>{this.props.order.failureDate.format()}</td>
            <td><EtherDisplay wei={this.props.order.collectibleFunds}/></td>
            <td>
                <Button
                    bsStyle="danger"
                    bsSize="small"
                    title="Delete"
                    disabled={!this.props.order.cancelEnabled}
                    onClick={this.handleCancel.bind(this)}>
                    <Glyphicon glyph="trash"/>
                </Button>
            </td>

        </tr>
    }

    render() {
        if (!this.props.order) {
            return <tr>
                <td colSpan={8}>Loading...</td>
            </tr>
        }

        if (this.props.outgoing)
            return this.renderAsOutgoing()
        else
            return this.renderAsIncoming()
    }
}

StandingOrder.propTypes = {
    outgoing: PropTypes.bool.isRequired
}

export default StandingOrder