import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Modal} from 'react-bootstrap'
import NewOrderForm from './NewOrderForm'

class NewOrderButton extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false
        }

        this.onNewOrder = this.onNewOrder.bind(this)
        this.open = this.open.bind(this)
        this.close = this.close.bind(this)
    }

    onNewOrder(order) {
        this.props.factoryInstance.createStandingOrder(order.receiver, order.rate, order.period, order.startTime.unix(), order.label, {
            from: this.props.account,
            gas: 1000000
        }).then(function (result) {
            console.log('Created StandingOrder - transaction: ' + result.tx)
            console.log(result.receipt)
        })
        this.close()
    }

    close() {
        this.setState({showModal: false})
    }

    open() {
        this.setState({showModal: true})
    }

    render() {
        return <div>
            <Button
                bsStyle="primary"
                onClick={this.open}>
                {this.props.label}
            </Button>
            <Modal show={this.state.showModal} onHide={this.close}>
                <Modal.Header closeButton>
                    <Modal.Title>Create standing order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NewOrderForm
                        onNewOrder={this.onNewOrder}
                        onCancel={this.close}
                    />
                </Modal.Body>
            </Modal>
        </div>
    }
}

NewOrderButton.propTypes = {
    label: PropTypes.string.isRequired,
    account: PropTypes.string.isRequired,
    factoryInstance: PropTypes.any.isRequired, // TODO: Use specifc protype instead of 'any'!
}

export default NewOrderButton