import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Modal} from 'react-bootstrap'
import NewOrderForm from './NewOrderForm'

class NewOrderButton extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showCreateModal: false
        }

        this.onCreateOrder = this.onCreateOrder.bind(this)
        this.openCreateModal = this.openCreateModal.bind(this)
        this.closeCreateModal = this.closeCreateModal.bind(this)
    }

    onCreateOrder(order) {
        this.props.factoryInstance.createStandingOrder(order.receiver, order.rate, order.period, order.startTime.unix(), order.label, {
            from: this.props.account,
            gas: 1000000
        }).then(function (result) {
            console.log('Created StandingOrder - transaction: ' + result.tx)
            console.log(result.receipt)
        })
        this.closeCreateModal()
    }

    closeCreateModal() {
        this.setState({showCreateModal: false})
    }

    openCreateModal() {
        this.setState({showCreateModal: true})
    }

    render() {
        let button =             <Button
                bsStyle="primary"
                onClick={this.openCreateModal}>
                {this.props.label}
            </Button>

        let createModal =             <Modal show={this.state.showCreateModal} onHide={this.closeCreateModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Create standing order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NewOrderForm
                        onNewOrder={this.onCreateOrder}
                        onCancel={this.closeCreateModal}
                    />
                </Modal.Body>
            </Modal>

        return <div>
            {button}
            {createModal}
        </div>
    }
}

NewOrderButton.propTypes = {
    label: PropTypes.string.isRequired,
    account: PropTypes.string.isRequired,
    factoryInstance: PropTypes.any.isRequired, // TODO: Use specifc protype instead of 'any'!
}

export default NewOrderButton