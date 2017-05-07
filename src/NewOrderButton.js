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
        var self = this
        // get accounts
        window.web3.eth.getAccounts(function (error, accounts) {
            return self.props.factoryInstance.createStandingOrder(order.receiver, order.rate, order.period, order.label, {
                from: accounts[0],
                gas: 1000000
            }).then(function (result) {
                console.log('Created StandingOrder - transaction: ' + result.tx)
                console.log(result.receipt)
            })
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
    factoryInstance: PropTypes.any.isRequired, // TODO: Use specifc protype instead of any!
}

export default NewOrderButton