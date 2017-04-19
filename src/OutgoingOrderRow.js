import React, {Component} from 'react'
import {Button} from 'react-bootstrap'

class OutgoingOrderRow extends Component {

    handleFund(event) {
        // add funds to contract
        this.props.onFundContract(event.currentTarget.getAttribute('data-contract-address'))
        event.preventDefault()
    }

    render() {
        return <tr>
            <td>{this.props.order.address}</td>
            <td>{this.props.order.payee}</td>
            <td>{this.props.order.paymentAmount}</td>
            <td>{this.props.order.paymentInterval}</td>
            <td>{this.props.order.ownerFunds}</td>
            <td>{this.props.order.funded_until}</td>
            <td><Button bsStyle="danger"
                        onClick={this.handleFund.bind(this)}
                        data-contract-address={this.props.order.address}>Fund</Button>
                { this.props.order.owner_funds > 0 && <Button>Withdraw</Button> }
                <Button bsStyle="danger">Cancel</Button></td>
        </tr>
    }
}

export default OutgoingOrderRow