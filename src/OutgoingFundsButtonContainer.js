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
            modalMode:'fund'
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleCloseResultsModal = this.handleCloseResultsModal.bind(this)
        this.onFund = this.onFund.bind(this)
        this.onWithdraw = this.onWithdraw.bind(this)
        this.doFund = this.doFund.bind(this)
        this.doWithdraw = this.doWithdraw.bind(this)
    }

    onFund() {
        // open funds manager in "funding" mode
        this.setState({
            modalMode:'fund',
            showModal:true,
            showResultsModal:false,
            fundingTransaction:null,
        })
    }

    onWithdraw() {
        // open funds manager in "withdraw" mode
        this.setState({
            modalMode:'withdraw',
            showModal:true,
            showResultsModal:false,
            fundingTransaction:null,
        })
    }

    handleSubmit(amount) {
        if (this.state.modalMode === 'withdraw')
            this.doWithdraw(amount)
        else
            this.doFund(amount)
    }

    doWithdraw(amount) {
        var self=this

        self.setState({fundingProgress:'waitingTransaction'})
        this.props.order.withdrawFn(amount.abs()).then(function(result) {
            console.log("Withdraw issued: ")
            console.log(result)
            window.web3.eth.getTransaction(result.tx, function (err, transaction) {
                if (!err) {
                    console.log("Got withdrawal transaction: " + transaction)
                    self.setState({
                        showModal:false,
                        showResultsModal:true,
                        fundingProgress:'idle',
                        fundingTransaction:transaction,
                    })
                } else {
                    console.log("Error fetching withdrawal transaction details!")
                    self.setState({
                        showModal:false,
                        showResultsModal:false,
                        fundingProgress:'idle'
                    })
                }
            })
        })
    }

    doFund(amount) {
        var self=this

        self.setState({fundingProgress:'waitingTransaction'})
        var transaction_object = {
            from: this.props.order.owner,
            to: this.props.order.address,
            value: amount
        }
        window.web3.eth.sendTransaction(transaction_object, function (err, hash) {
            if (err) {
                console.log("Error while sending transaction: ")
                console.log(err)
                self.setState({fundingProgress:'idle'})
            } else {
                console.log("Contract funded. Transaction hash: " + hash)
                self.setState({fundingProgress:'checkingTransaction'})
                window.web3.eth.getTransaction(hash, function(err, transaction) {
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
                onWithdraw={this.onWithdraw}
                onFund={this.onFund}
            />
            <FundOrderModal showModal={this.state.showModal}
                            order={this.props.order}
                            onSubmit={this.handleSubmit}
                            onCancel={this.handleCancel}
                            fundingProgress={this.state.fundingProgress}
                            modalMode={this.state.modalMode}
            />
            <FundOrderResultModal
                showModal={this.state.showResultsModal}
                onClose={this.handleCloseResultsModal}
                transaction={this.state.fundingTransaction}
                isFunding={this.state.modalMode === 'withdraw' ? false : true}
            />
            </div>
    }

}

OutgoingFundsButtonContainer.propTypes = {
    order: PropTypes.object.isRequired,
}

export default OutgoingFundsButtonContainer
