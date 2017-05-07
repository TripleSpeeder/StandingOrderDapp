import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, ButtonGroup, Glyphicon, Label} from 'react-bootstrap'
import RelabelButton from "./RelabelButton"

class StandingOrder extends Component {

    handleFund(event) {
        // add funds to contract
        this.props.onFundContract()
        event.preventDefault()
    }

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

    BigNumWeiToDisplayString(bignum) {
        var unit = 'ether'
        var decimalPlaces = 10
        return window.web3.fromWei(bignum, unit).round(decimalPlaces).toString()
    }

    renderAsIncoming() {
        return <tr>
            <td>#</td>
            <td>
                <strong>{this.props.order.payeeLabel}</strong> <RelabelButton label={this.props.order.payeeLabel} onRelabel={this.props.onRelabel}/>
            </td>
            <td>{this.props.order.owner}</td>
            <td>
                {this.BigNumWeiToDisplayString(this.props.order.collectibleFunds)} <Button
                    bsStyle="primary"
                    bsSize="small"
                    title="Collect"
                    onClick={this.handleCollect.bind(this)}>
                    <Glyphicon glyph="download"/>
                </Button>
            </td>
            <td>{this.props.order.next_payment}</td>
        </tr>
    }

    renderAsOutgoing() {
        return <tr>
            <td>#</td>
            <td>
                {this.props.order.fundsInsufficient &&
                <Label bsStyle="danger" title="Insufficient funds!">
                    <Glyphicon glyph="alert"/>
                </Label> }<strong>{this.props.order.ownerLabel}</strong>
            </td>
            <td>{this.props.order.payee}</td>
            <td>{this.BigNumWeiToDisplayString(this.props.order.paymentAmount)}</td>
            <td>{this.props.order.paymentInterval.toString()} seconds</td>
            <td>{this.BigNumWeiToDisplayString(this.props.order.ownerFunds)}
                <ButtonGroup>
                    <Button bsStyle="success" bsSize="small" title="Add Funds" onClick={this.handleFund.bind(this)}>
                        <Glyphicon glyph="upload"/>
                    </Button>
                    <Button bsStyle="warning" bsSize="small" title="Withdraw Funds" disabled={!this.props.order.withdrawEnabled}
                            onClick={this.handleWithdraw.bind(this)}>
                        <Glyphicon glyph="download"/>
                    </Button>
                </ButtonGroup>
            </td>
            <td>{this.BigNumWeiToDisplayString(this.props.order.collectibleFunds)}</td>
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