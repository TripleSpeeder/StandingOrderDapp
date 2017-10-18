import React, {Component} from 'react'
import PropTypes from 'prop-types'
import EtherDisplay from "./EtherDisplay"
import FeedbackModal from "./FeedbackModal"


class FundOrderResultModal extends Component {

    render() {

        var blockexplorer
        switch (this.props.networkID) {
            case 3: // Ropsten
                blockexplorer = "https://ropsten.etherscan.io/tx/"
                break
            case 1: // main
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

        const title = this.props.isFunding ? "Funding successfull" : "Withdraw successfull"
        const {showModal, onClose} = this.props

        return <FeedbackModal title={title} body={body} showModal={showModal} onClose={onClose}/>
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