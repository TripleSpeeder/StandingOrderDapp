import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Modal, Button} from 'react-bootstrap'


class CollectErrorModal extends Component {

    render() {

        const modal = (
            <Modal bsSize="small" show={this.props.showModal} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Error occured</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>An error occured while collecting funds:</p>
                    <p>{this.props.errorMessage}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        )

        return modal
    }
}

CollectErrorModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    errorMessage: PropTypes.string.isRequired,
}

export default CollectErrorModal
