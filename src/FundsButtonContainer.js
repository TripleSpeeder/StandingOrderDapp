import React, {Component} from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import FundsButton from './FundsButton'
import FundOrderModal from "./FundOrderModal"


class FundsButtonContainer extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal:false
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleOpenModal = this.handleOpenModal.bind(this)
    }

    handleOpenModal() {
        this.setState({showModal:true})
    }

    handleSubmit(amount) {
        this.props.onFund(amount)
        this.setState({showModal:false})
    }

    handleCancel(){
        this.setState({showModal:false})
    }

    render() {
        return <div>
            <FundsButton
                order={this.props.order}
                onWithdraw={this.props.onWithdraw}
                onFund={this.handleOpenModal}
            />
            <FundOrderModal showModal={this.state.showModal}
                            order={this.props.order}
                            onSubmit={this.handleSubmit}
                            onCancel={this.handleCancel}
            />
            </div>
    }

}

FundsButtonContainer.propTypes = {
    order: PropTypes.object.isRequired,
    onFund: PropTypes.func.isRequired,
    onWithdraw: PropTypes.func.isRequired,
}

export default FundsButtonContainer
