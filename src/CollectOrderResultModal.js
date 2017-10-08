import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Modal, Button} from 'react-bootstrap'
import EtherDisplay from "./EtherDisplay"


class CollectOrderResultModal extends Component {

    render() {

        var blockexplorer
        switch (this.props.networkID) {
            case 3: // Ropsten
                blockexplorer = "https://ropsten.etherscan.io/tx/"
                break
            case 1: // main
            case 6666: // testrpc during dev
            default:
                blockexplorer = "https://etherscan.io/tx/"
        }
        let verifyUrl = blockexplorer + this.props.transactionHash

        const modal = (
            <Modal bsSize="small" show={this.props.showModal} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Funds collected</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Collected <EtherDisplay wei={this.props.collectedAmount}/>.</p>
                    <p><a href={verifyUrl} target="_blank">Verify on etherscan.io</a></p>
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
    collectedAmount: PropTypes.any.isRequired,
    networkID: PropTypes.number.isRequired,
}

export default CollectOrderResultModal