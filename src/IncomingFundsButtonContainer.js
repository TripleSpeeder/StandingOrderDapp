import React, {Component} from 'react'
import PropTypes from 'prop-types'
import IncomingFundsButton from './IncomingFundsButton'
import CollectOrderResultModal from './CollectOrderResultModal'
import FeedbackModal from "./FeedbackModal"


class IncomingFundsButtonContainer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showResultsModal: false,
            showErrorModal: false,
            errorMessage: '',
            collectingTransaction: null,
            collectState: 'idle',
            collectedAmount: window.web3.toBigNumber(0),
            transactionHash: ''
        }

        this.handleCloseResultsModal = this.handleCloseResultsModal.bind(this)
        this.handleCloseErrorModal = this.handleCloseErrorModal.bind(this)
        this.handleCollect = this.handleCollect.bind(this)
    }

    handleCloseResultsModal() {
        this.setState({
            showResultsModal: false,
            fundingTransaction: null,
        })
    }

    handleCloseErrorModal() {
        this.setState({
            showErrorModal:false,
        })
    }

    handleCollect() {
        var self = this
        this.setState({collectState: 'waitingTransaction'})
        this.props.order.collectFn().then(function (result) {
            console.log("CollectFunds issued: ")
            // find the event named "Collect"
            let collectEvent = result.logs.find(function (entry) {
                return entry.event === 'Collect'
            })
            self.setState({
                showResultsModal: true,
                collectState: 'idle',
                collectedAmount: collectEvent.args['amount'],
                transactionHash: result.tx
            })
        }).catch(function (err) {
            console.log("Collectfunds error: " + err)
            self.setState({
                showModal: false,
                showResultsModal: false,
                showErrorModal: true,
                errorMessage: err.toString(),
                collectState: 'idle',
                fundingProgress: 'idle',
            })
        })
    }

    render() {
        let feedbackBody = <div>
            <p>An error occured while collecting funds:</p>
            <p>{this.state.errorMessage}</p>
        </div>

        return <div>
            <IncomingFundsButton
                order={this.props.order}
                onCollect={this.handleCollect}
                collectState={this.state.collectState}
            />
            <CollectOrderResultModal
                showModal={this.state.showResultsModal}
                onClose={this.handleCloseResultsModal}
                collectedAmount={this.state.collectedAmount}
                transactionHash={this.state.transactionHash}
                networkID={this.props.networkID}
            />
            <FeedbackModal title="Error occurred"
                           body={feedbackBody}
                           showModal={this.state.showErrorModal}
                           onClose={this.handleCloseErrorModal}/>
        </div>
    }

}

IncomingFundsButtonContainer.propTypes = {
    order: PropTypes.object.isRequired,
    networkID: PropTypes.number.isRequired,
}

export default IncomingFundsButtonContainer
