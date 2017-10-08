import React, {Component} from 'react'
import PropTypes from 'prop-types'
import OutgoingFundsButton from './OutgoingFundsButton'
import FundOrderModal from "./FundOrderModal"
import FundOrderResultModal from "./FundOrderResultModal"
import WithdrawalErrorModal from "./WithdrawalErrorModal"


class OutgoingFundsButtonContainer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal:false,
            fundingProgress:'idle',
            showResultsModal:false,
            showErrorModal:false,
            transactionHash:'',
            amount:window.web3.toBigNumber(0),
            modalMode:'fund'
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleCloseResultsModal = this.handleCloseResultsModal.bind(this)
        this.handleCloseErrorModal = this.handleCloseErrorModal.bind(this)
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
        var self = this

        self.setState({fundingProgress: 'waitingTransaction'})
        this.props.order.withdrawFn(amount.abs())
            .then(function (result) {
                console.log("Withdraw issued: ")
                console.log(result)
                // find the event named "Withdraw"
                let ev = result.logs.find(function (entry) {
                    return entry.event === 'Withdraw'
                })
                if (ev===undefined) {
                    throw new Error('Withdrawal Transaction completed, but no log entries -> something failed!')
                }
                self.setState({
                    showModal: false,
                    showResultsModal: true,
                    showErrorModal: false,
                    fundingProgress: 'idle',
                    transactionHash: result.tx,
                    amount: ev.args['amount'],
                })
            })
            .catch(function (err) {
                console.log("Withdrawal error: " + err)
                self.setState({
                    showModal: false,
                    showResultsModalModal: false,
                    showErrorModal: true,
                    fundingProgress: 'idle',
                })
            })
    }

    doFund(amount) {
        var self=this
        self.setState({fundingProgress:'waitingTransaction'})
        this.props.order.fundFn(amount).then(function(result){
            self.setState({fundingProgress:'checkingTransaction'})
            // find the event named "Fund"
            let ev = result.logs.find(function (entry) {
                return entry.event === 'Fund'
            })
            self.setState({
                showModal:false,
                showResultsModal:true,
                showErrorModal: false,
                fundingProgress:'idle',
                amount:ev.args['amount'],
                transactionHash:result.tx,
            })
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

    handleCloseErrorModal() {
        this.setState({
            showErrorModal:false,
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
                transactionHash={this.state.transactionHash}
                isFunding={this.state.modalMode === 'withdraw' ? false : true}
                amount={this.state.amount}
                networkID={this.props.networkID}
            />
            <WithdrawalErrorModal
                showModal={this.state.showErrorModal}
                onClose={this.handleCloseErrorModal}
            />
            </div>
    }

}

OutgoingFundsButtonContainer.propTypes = {
    order: PropTypes.object.isRequired,
    networkID: PropTypes.number.isRequired,
}

export default OutgoingFundsButtonContainer
