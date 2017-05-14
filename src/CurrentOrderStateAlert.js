import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Alert } from 'react-bootstrap'

class CurrentOrderStateAlert extends Component {

    constructor(props) {
        super(props)

        this.renderInsufficient = this.renderInsufficient.bind(this)
        this.renderSufficient = this.renderSufficient.bind(this)
    }

    BigNumWeiToDisplayString(bignum) {
        var unit = 'ether'
        var decimalPlaces = 10
        return window.web3.fromWei(bignum, unit).toFixed()
    }

    renderInsufficient() {
        return (
            <div>
            <strong>Current funding state:</strong>
            <Alert bsStyle="danger">
                <p>
                    Contract is missing <strong>{this.BigNumWeiToDisplayString(this.props.order.ownerFunds.abs())}</strong> ETH!
                </p>
            </Alert>
            </div>
        )
    }

    renderZero() {
        let missingAmount = this.props.order.paymentAmount.minus(this.props.order.ownerFunds)

        return (
            <div>
                <strong>Current funding state:</strong>
            <Alert bsStyle="warning">
                <p>
                    Not enough funds to cover next payment due in TODO days. Missing: {this.BigNumWeiToDisplayString(missingAmount)} ETH.
                </p>
            </Alert>
            </div>
        )
    }

    renderSufficient() {
        return (
            <div>
                <strong>Current funding state:</strong>
            <Alert bsStyle="info">
                <p>
                    Next <strong>{this.props.order.paymentsCovered.toNumber()}</strong> payments covered until <strong>todo: Date here!</strong>
                </p>
            </Alert>
            </div>
        )
    }

    render() {
        if (this.props.order.ownerFunds.lessThan(0))
            return this.renderInsufficient()

        if(this.props.order.ownerFunds.lessThan(this.props.order.paymentAmount))
            return this.renderZero()

        return this.renderSufficient()
    }
}

CurrentOrderStateAlert.propTypes = {
    order: PropTypes.object.isRequired,
}

export default CurrentOrderStateAlert