import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Modal, Button} from 'react-bootstrap'
import EtherDisplay from "./EtherDisplay"


class FundOrderResultModal extends Component {

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

        let body
        if (this.props.isFunding) {
            body =  <div><p>Sent <EtherDisplay wei={this.props.amount}/>.</p> <p><a href={verifyUrl} target="_blank">Verify on etherscan.io</a></p></div>
        } else {
            body =  <div><p>Received <EtherDisplay wei={this.props.amount}/>.</p> <p><a href={verifyUrl} target="_blank">Verify on etherscan.io</a></p></div>
        }

        const modal = (
            <Modal bsSize="small" show={this.props.showModal} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.isFunding ? "Funding successfull" : "Withdraw successfull"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {body}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        )

        return modal
    }
}

FundOrderResultModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isFunding: PropTypes.bool.isRequired,
    transactionHash: PropTypes.string.isRequired,
    amount: PropTypes.any.isRequired,
}

export default FundOrderResultModal