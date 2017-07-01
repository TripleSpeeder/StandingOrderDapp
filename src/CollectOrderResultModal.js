import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Modal, Button} from 'react-bootstrap'
import EtherDisplay from "./EtherDisplay"


class CollectOrderResultModal extends Component {

    render() {

        let verifyUrl = 'https://etherchain.org/tx/' + this.props.transactionHash

        const modal = (
            <Modal bsSize="small" show={this.props.showModal} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Funds collected</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Collected <EtherDisplay wei={this.props.collectedAmount}/>.</p>
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
    transactionHash: PropTypes.any.isRequired,
    collectedAmount: PropTypes.any.isRequired
}

export default CollectOrderResultModal