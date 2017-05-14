import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Alert } from 'react-bootstrap'
import { BigNumWeiToDisplayString } from './Utils'

class CurrentOrderStateAlert extends Component {

    constructor(props) {
        super(props)

        this.renderInsufficient = this.renderInsufficient.bind(this)
        this.renderSufficient = this.renderSufficient.bind(this)
    }

    renderInsufficient() {
        return (
            <Alert bsStyle="danger">
                <p>
                    Contract is missing <strong>{BigNumWeiToDisplayString(this.props.ownerFunds.abs())}</strong> ETH!
                </p>
            </Alert>
        )
    }

    renderZero() {
        let missingAmount = this.props.paymentAmount.minus(this.props.ownerFunds)

        return (
            <Alert bsStyle="warning">
                <p>
                    Not enough funds to cover next payment due in TODO days.
                    Missing amount: <strong>{BigNumWeiToDisplayString(missingAmount)}</strong> ETH.
                </p>
            </Alert>
        )
    }

    renderSufficient() {
        return (
            <Alert bsStyle="success">
                <p>
                    Next <strong>{this.props.paymentsCovered.toNumber()}</strong> payments covered until <strong>todo: Date here!</strong>
                </p>
            </Alert>
        )
    }

    render() {
        if (this.props.ownerFunds.lessThan(0))
            return this.renderInsufficient()

        if(this.props.ownerFunds.lessThan(this.props.paymentAmount))
            return this.renderZero()

        return this.renderSufficient()
    }
}

CurrentOrderStateAlert.propTypes = {
    // order: PropTypes.object.isRequired,
    paymentAmount: PropTypes.object.isRequired, // BigNumber
    ownerFunds: PropTypes.object.isRequired, // BigNumber
    paymentsCovered: PropTypes.object.isRequired, // BigNumber
}

export default CurrentOrderStateAlert