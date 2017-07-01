import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Modal, Button, Alert} from 'react-bootstrap'
import EtherDisplay from "./EtherDisplay"


class FundOrderResultModal extends Component {

    render() {
        if (this.props.transaction===null) {
            return <Modal bsSize="small" show={this.props.showModal} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Funding successfull</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert bsStyle="warning">
                        <strong>Got empty transaction result. This is most likely a bug in testRPC when running with -b option (background mining).</strong>
                    </Alert>
                    <p>Sent XXX eth.</p>
                    <p><a href="#" target="_blank">Verify on etherchain.org</a></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.props.onClose}>Close</Button>
                </Modal.Footer>
            </Modal>

        }

        let verifyUrl = 'https://etherchain.org/tx/' + this.props.transaction.hash

        let body
        if (this.props.isFunding) {
            body =  <div><p>Sent <EtherDisplay wei={this.props.transaction.value}/>.</p> <p><a href={verifyUrl} target="_blank">Verify on etherchain.org</a></p></div>
        } else {
            body =  <div><p>Withdrawal successfull.</p><p><a href={verifyUrl} target="_blank">See transaction on etherchain.org</a></p></div>
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
}

export default FundOrderResultModal