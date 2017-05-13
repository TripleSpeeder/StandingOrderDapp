import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, ButtonGroup, Glyphicon, Label} from 'react-bootstrap'
import RelabelButton from "./RelabelButton"
import moment from 'moment'
import 'moment-duration-format'
import FundOrderButton from "./FundOrderButton"

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

    BigNumWeiToDisplayString(bignum) {
        var unit = 'ether'
        var decimalPlaces = 10
        return window.web3.fromWei(bignum, unit).toFixed()
    }

    secondsToDisplayString(seconds) {
        if (seconds < 60*60*24) // less than one day?
            return moment.duration(seconds, "seconds").format("hh:mm.ss", { trim: false })
        return moment.duration(seconds, "seconds").format("d [days]")
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
            <td>{this.secondsToDisplayString(this.props.order.paymentInterval.toNumber())}</td>
            <td>{this.BigNumWeiToDisplayString(this.props.order.ownerFunds)}
                <ButtonGroup>
                    <FundOrderButton order={this.props.order} onFund={this.props.onFundContract}/>
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