import React, {Component} from 'react'
import {Button} from 'react-bootstrap'

class IncomingOrder extends Component {

    handleCollect(event) {
        // Withdraw ownerfunds from contract
        this.props.onCollectFunds()
        event.preventDefault()
    }

    render() {
        return <tr>
            <td>{this.props.order.address}</td>
            <td>{this.props.order.owner}</td>
            <td>{this.props.order.payee}</td>
            <td>{this.props.order.paymentInterval}</td>
            <td>{this.props.order.collectibleFunds}</td>
            <td>{this.props.order.next_payment}</td>
            <td>
                <Button onClick={this.handleCollect.bind(this)}>Collect</Button>
            </td>
        </tr>
    }
}

export default IncomingOrder