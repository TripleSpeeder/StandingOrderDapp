import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Modal} from 'react-bootstrap'
import NewOrderForm from './NewOrderForm'
import CreateOrderResultModal from "./CreateOrderResultModal"

class NewOrderButton extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showCreateModal: false,
            showResultModal: false,
            createOrderProgress: 'idle'
        }

        this.onCreateOrder = this.onCreateOrder.bind(this)
        this.openCreateModal = this.openCreateModal.bind(this)
        this.closeCreateModal = this.closeCreateModal.bind(this)
        this.openResultModal = this.openResultModal.bind(this)
        this.closeResultModal = this.closeResultModal.bind(this)
    }

    onCreateOrder(order) {
        var self=this
        this.setState({createOrderProgress:'waitingTransaction'})
        this.props.factoryInstance.createStandingOrder(order.receiver, order.rate, order.period, order.startTime.unix(), order.label, {
            from: this.props.account,
            gas: 1000000
        }).then(function(result){
            console.log('Created StandingOrder - transaction: ' + result.tx)
            console.log(result.receipt)
            // check for log entries. If there are no logs created, contract creation failed!
            if(result.logs.length < 1) {
                throw new Error('Transaction completed, but no log entries -> Contract creation failed.')
            }
            self.setState({createOrderProgress:'done'})
            self.closeCreateModal()
        }).catch(function(e) {
            // There was an error! Handle it.
            console.log("Error while creating order. Message: " + e)
            self.setState({createOrderProgress:'idle'})
            self.closeCreateModal()
            self.openResultModal()
        })
    }

    closeCreateModal() {
        this.setState({showCreateModal: false})
    }

    openCreateModal() {
        this.setState(
            {
                showCreateModal: true,
                createOrderProgress:'idle'
            })
    }

    openResultModal() {
        this.setState({showResultModal: true})
    }

    closeResultModal() {
        this.setState({showResultModal: false})
    }


    render() {
        let button = <Button
            bsStyle="primary"
            onClick={this.openCreateModal}>
            {this.props.label}
        </Button>

        let createModal = <Modal show={this.state.showCreateModal} onHide={this.closeCreateModal}>
            <Modal.Header closeButton>
                <Modal.Title>Create standing order</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <NewOrderForm
                    onNewOrder={this.onCreateOrder}
                    onCancel={this.closeCreateModal}
                    createOrderProgress={this.state.createOrderProgress}
                />
            </Modal.Body>
        </Modal>

        let resultModal = <CreateOrderResultModal showModal={this.state.showResultModal} onClose={this.closeResultModal}/>

        return <div>
            {button}
            {createModal}
            {resultModal}
        </div>
    }
}

NewOrderButton.propTypes = {
    label: PropTypes.string.isRequired,
    account: PropTypes.string.isRequired,
    factoryInstance: PropTypes.any.isRequired, // TODO: Use specifc protype instead of 'any'!
}

export default NewOrderButton