import React, {Component} from 'react'
import PropTypes from 'prop-types'
import EtherDisplay from "./EtherDisplay"
import FeedbackModal from "./FeedbackModal"


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
        const body = <div>
            <p>Collected <EtherDisplay wei={this.props.collectedAmount}/>.</p>
            <p><a href={verifyUrl} target="_blank">Verify on etherscan.io</a></p>
        </div>

        return <FeedbackModal title="Funds collected" body={body} showModal={this.props.showModal} onClose={this.props.onClose}/>
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