import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Modal, Button, Alert} from 'react-bootstrap'


class CollectOrderResultModal extends Component {

    render() {
        if (this.props.transaction===null) {
            return <Modal bsSize="small" show={this.props.showModal} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Funds collected</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert bsStyle="warning">
                        <strong>Got empty transaction result. This is most likely a bug in testRPC when running with -b option (background mining).</strong>
                    </Alert>
                    <p><a href="#" target="_blank">Verify on etherchain.org</a></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        }

        let verifyUrl = 'https://etherchain.org/tx/' + this.props.transaction.hash

        const modal = (
            <Modal bsSize="small" show={this.props.showModal} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Funds collected</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><a href={verifyUrl} target="_blank">Verify on etherchain.org</a></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        )

        return modal
    }
}

CollectOrderResultModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default CollectOrderResultModal