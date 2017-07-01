import React, {Component} from 'react'
import PropTypes from 'prop-types'
import IncomingFundsButton from './IncomingFundsButton'
import CollectOrderResultModal from './CollectOrderResultModal'


class IncomingFundsButtonContainer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showResultsModal:false,
            collectingTransaction:null,
            collectState: 'idle',
            collectedAmount: window.web3.toBigNumber(0),
            transactionHash: ''
        }

        this.handleCloseResultsModal = this.handleCloseResultsModal.bind(this)
        this.handleCollect = this.handleCollect.bind(this)
    }

    handleCloseResultsModal() {
        this.setState({
            showResultsModal:false,
            fundingTransaction:null,
        })
    }

    handleCollect() {
        var self = this
        this.setState({collectState: 'waitingTransaction'})
        this.props.order.collectFn().then(function(result){
            console.log("CollectFunds issued: ")
            // find the event named "Collect"
            let collectEvent = result.logs.find(function (entry) {
                return entry.event === 'Collect'
            })
            self.setState({
                showResultsModal:true,
                collectState:'idle',
                collectedAmount:collectEvent.args['amount'],
                transactionHash:result.tx
            })
        })
    }

    render() {
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
            />
            </div>
    }

}

IncomingFundsButtonContainer.propTypes = {
    order: PropTypes.object.isRequired,
}

export default IncomingFundsButtonContainer
