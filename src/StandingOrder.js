import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button} from 'react-bootstrap'
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
        var decimalPlaces = 6
        return window.web3.fromWei(bignum, unit).round(decimalPlaces).toString()
    }

    renderAsIncoming() {
        return <tr>
            <td>
                {this.props.order.payeeLabel}
                <RelabelButton label={this.props.order.payeeLabel} onRelabel={this.props.onRelabel}/>
            </td>
            <td>{this.props.order.owner}</td>
            <td>{this.props.order.paymentInterval.toString()}</td>
            <td>{this.BigNumWeiToDisplayString(this.props.order.collectibleFunds)}</td>
            <td>{this.props.order.next_payment}</td>
            <td>
                <Button onClick={this.handleCollect.bind(this)}>Collect</Button>
            </td>
        </tr>
    }

    renderAsOutgoing() {
        return <tr>
            <td>
                {this.props.order.ownerLabel}
                <RelabelButton label={this.props.order.ownerLabel} onRelabel={this.props.onRelabel}/>
            </td>
            <td>{this.props.order.payee}</td>
            <td>{this.BigNumWeiToDisplayString(this.props.order.paymentAmount)}</td>
            <td>{this.props.order.paymentInterval.toString()}</td>
            <td>{this.BigNumWeiToDisplayString(this.props.order.ownerFunds)}</td>
            <td>{this.props.order.funded_until}</td>
            <td>
                <Button bsStyle="danger" onClick={this.handleFund.bind(this)}>
                    Fund
                </Button>
                {
                    this.props.order.ownerFunds > 0 &&
                    <Button bsStyle="danger" onClick={this.handleWithdraw.bind(this)}>
                        Withdraw
                    </Button>
                }
                {
                    this.props.order.balance.isZero() &&
                    <Button bsStyle="danger" onClick={this.handleCancel.bind(this)}>
                        Cancel
                    </Button>
                }
            </td>
        </tr>
    }

    render() {
        if (this.props.outgoing)
            return this.renderAsOutgoing()
        else
            return this.renderAsIncoming()
    }
}

StandingOrder.propTypes = {
    outgoing: PropTypes.bool.isRequired,
    // allow "any" for order as we may render with a dummy order until the real one is loaded
    order: PropTypes.any.isRequired
}

export default StandingOrder