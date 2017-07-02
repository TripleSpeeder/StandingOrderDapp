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
            transactionHash:'',
            amount:window.web3.toBigNumber(0),
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
                self.setState({
                    showModal: false,
                    showResultsModal: true,
                    fundingProgress: 'idle',
                    transactionHash: result.tx,
                    amount: ev.args['amount'],
                })
            })
            .catch(function (err) {
                // Easily catch all errors along the whole execution.
                console.log("ERROR! " + err.message)
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
            />
            </div>
    }

}

OutgoingFundsButtonContainer.propTypes = {
    order: PropTypes.object.isRequired,
}

export default OutgoingFundsButtonContainer
