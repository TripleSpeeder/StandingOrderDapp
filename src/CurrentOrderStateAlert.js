import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Alert } from 'react-bootstrap'
import EtherDisplay from "./EtherDisplay"

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
                    Contract is missing <strong><EtherDisplay wei={this.props.ownerFunds.abs()}/></strong>!
                </p>
            </Alert>
        )
    }

    renderZero() {
        let missingAmount = this.props.paymentAmount.minus(this.props.ownerFunds)

        return (
            <Alert bsStyle="warning">
                <p>
                    Not enough funds to cover next payment due {this.props.nextPaymentDate.format()}.
                    Missing amount: <strong><EtherDisplay wei={missingAmount}/></strong>.
                </p>
            </Alert>
        )
    }

    renderSufficient() {
        return (
            <Alert bsStyle="success">
                <p>
                    Next <strong>{this.props.paymentsCovered.toNumber()}</strong> payments covered until <strong>{this.props.failureDate.format()}</strong>
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
    paymentAmount: PropTypes.object.isRequired, // BigNumber
    ownerFunds: PropTypes.object.isRequired, // BigNumber
    paymentsCovered: PropTypes.object.isRequired, // BigNumber
    nextPaymentDate: PropTypes.object.isRequired, // Moment
    failureDate: PropTypes.object.isRequired, // Moment
}

export default CurrentOrderStateAlert