import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Modal, OverlayTrigger, Popover, Tooltip} from 'react-bootstrap'
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
        // Form submitted a new label. Pass on event to parent and close self
        this.props.onNewOrder(order)
        this.close()
    }

    close() {
        this.setState({showModal: false})
    }

    open() {
        this.setState({showModal: true})
    }

    render() {
        const popover = (
            <Popover id="modal-popover" title="popover">
                very popover. such engagement
            </Popover>
        )
        const tooltip = (
            <Tooltip id="modal-tooltip">
                wow.
            </Tooltip>
        )

        return <div>
            <Button
                bsStyle="primary"
                bsSize="small"
                onClick={this.open}>
                Create new standing order
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
    onNewOrder: PropTypes.func.isRequired,
}

export default NewOrderButton