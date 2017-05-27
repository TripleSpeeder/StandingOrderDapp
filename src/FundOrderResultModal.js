import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Modal, Button} from 'react-bootstrap'
import EtherDisplay from "./EtherDisplay"


class FundOrderResultModal extends Component {

    render() {
        if (this.props.transaction===null) {
            return <div></div>
        }

        let verifyUrl = 'https://etherchain.org/tx/' + this.props.transaction.hash

        const modal = (
            <Modal bsSize="small" show={this.props.showModal} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Funding successfull</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Sent <EtherDisplay wei={this.props.transaction.value}/>.</p>
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

FundOrderResultModal.propTypes = {
    //order: PropTypes.object.isRequired,
    //onWithdraw: PropTypes.func.isRequired,
    showModal: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default FundOrderResultModal