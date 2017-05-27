import React, {Component} from 'react'
import PropTypes from 'prop-types'
import OutgoingFundsButton from './OutgoingFundsButton'
import FundOrderModal from "./FundOrderModal"


class OutgoingFundsButtonContainer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal:false,
            fundingProgress: 'idle'
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleOpenModal = this.handleOpenModal.bind(this)
    }

    handleOpenModal() {
        this.setState({showModal:true})
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
                self.setState({fundingProgress:'idle'})
                self.setState({showModal:false})
            }
        })
    }

    handleCancel(){
        this.setState({fundingProgress:'idle'})
        this.setState({showModal:false})
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
            </div>
    }

}

OutgoingFundsButtonContainer.propTypes = {
    order: PropTypes.object.isRequired,
    onWithdraw: PropTypes.func.isRequired,
}

export default OutgoingFundsButtonContainer
