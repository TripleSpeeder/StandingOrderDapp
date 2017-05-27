import React, {Component} from 'react'
import PropTypes from 'prop-types'
import OutgoingFundsButton from './OutgoingFundsButton'
import FundOrderModal from "./FundOrderModal"
import FundOrderResultModal from "./FundOrderResultModal"


class OutgoingFundsButtonContainer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal:false,
            fundingProgress: 'idle',
            showResultsModal:false,
            fundingTransaction:null,
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleOpenModal = this.handleOpenModal.bind(this)
        this.handleCloseResultsModal = this.handleCloseResultsModal.bind(this)
    }

    handleOpenModal() {
        this.setState({
            showModal:true,
            showResultsModal:false,
            fundingTransaction:null,
        })
    }

    handleSubmit(amount) {
        var self=this

        self.setState({fundingProgress:'waitingTransaction'})

        var transaction_object = {
            from: this.props.order.owner,
            to: this.props.order.address,
            value: amount
        }
        window.web3.eth.sendTransaction(transaction_object, function (err, address) {
            if (err) {
                console.log("Error while sending transaction: ")
                console.log(err)
                self.setState({fundingProgress:'idle'})
            } else {
                console.log("Contract funded. Transaction address: " + address)
                self.setState({fundingProgress:'checkingTransaction'})
                window.web3.eth.getTransaction(address, function(err, transaction) {
                    if (!err) {
                        console.log("Got transaction: " + transaction)
                        self.setState({
                            showModal:false,
                            showResultsModal:true,
                            fundingProgress:'idle',
                            fundingTransaction:transaction,
                        })
                    } else {
                        console.log("Error fetching transaction details!")
                        self.setState({
                            showModal:false,
                            showResultsModal:false,
                            fundingProgress:'idle'
                        })
                    }
                })
            }
        })
    }

    handleCancel(){
        this.setState({fundingProgress:'idle'})
        this.setState({showModal:false})
    }

    handleCloseResultsModal() {
        this.setState({
            showResultsModal:false,
            fundingTransaction:null,
        })
    }

    render() {
        return <div>
            <OutgoingFundsButton
                order={this.props.order}
                onWithdraw={this.props.onWithdraw}
                onFund={this.handleOpenModal}
            />
            <FundOrderModal showModal={this.state.showModal}
                            order={this.props.order}
                            onSubmit={this.handleSubmit}
                            onCancel={this.handleCancel}
                            fundingProgress={this.state.fundingProgress}
            />
            <FundOrderResultModal
                showModal={this.state.showResultsModal}
                onClose={this.handleCloseResultsModal}
                transaction={this.state.fundingTransaction}
            />
            </div>
    }

}

OutgoingFundsButtonContainer.propTypes = {
    order: PropTypes.object.isRequired,
    onWithdraw: PropTypes.func.isRequired,
}

export default OutgoingFundsButtonContainer
