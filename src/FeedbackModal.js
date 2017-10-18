import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Modal, Button} from 'react-bootstrap'


class FeedbackModal extends Component {

    render() {

        const {title, body, showModal, onClose} = this.props;

        const modal = (
            <Modal bsSize="small" show={showModal} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {body}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={onClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        )

        return modal
    }
}

FeedbackModal.propTypes = {
    title: PropTypes.any.isRequired,
    body: PropTypes.any.isRequired,
    showModal: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default FeedbackModal