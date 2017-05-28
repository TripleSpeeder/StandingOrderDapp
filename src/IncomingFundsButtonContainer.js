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
            collectState: 'idle'
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
            console.log(result)
            self.setState({collectState:'checkingTransaction'})
            window.web3.eth.getTransaction(result.tx, function(err, transaction) {
                if (!err) {
                    console.log("Got transaction: " + transaction)
                    self.setState({
                        showResultsModal:true,
                        collectState:'idle',
                        collectingTransaction:transaction,
                    })
                } else {
                    console.log("Error fetching transaction details!")
                    self.setState({
                        showResultsModal:false,
                        collectState:'idle',
                    })
                }
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
                transaction={this.state.collectingTransaction}
            />
            </div>
    }

}

IncomingFundsButtonContainer.propTypes = {
    order: PropTypes.object.isRequired,
}

export default IncomingFundsButtonContainer
