import React, {Component} from 'react'
import {Button} from 'react-bootstrap'

class OutgoingOrder extends Component {

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

    BigNumWeiToDisplayString(bignum)
    {
        var unit='ether'
        var decimalPlaces = 6
        return window.web3.fromWei(bignum, unit).round(decimalPlaces).toString()
    }

    render() {
        return <tr>
            <td>{this.props.order.address}</td>
            <td>{this.props.order.owner}</td>
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
}

export default OutgoingOrder