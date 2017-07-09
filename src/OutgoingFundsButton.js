import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {DropdownButton, MenuItem, Glyphicon} from 'react-bootstrap'
import EtherDisplay from "./EtherDisplay"

class OutgoingFundsButton extends Component {

    constructor(props) {
        super(props)

        this.handleSelect = this.handleSelect.bind(this)
        this.determineStyle = this.determineStyle.bind(this)
    }

    handleSelect(key, event) {
        switch (key) {
            case 'fund':
                this.props.onFund()
                return
            case 'withdraw':
                this.props.onWithdraw();
                return
            default:
                console.log("Unhandled action in FundButton!")
        }
    }

    determineStyle(){
        if (this.props.order.fundsInsufficient)
            return 'danger'
        if (this.props.order.withdrawEnabled)
            return 'success'
        return 'warning'
    }

    renderDefault() {
        let etherDisplay = <EtherDisplay wei={this.props.order.ownerFunds}/>
        let bsStyle = this.determineStyle()
        return (
            <DropdownButton
                title={etherDisplay}
                id="dropDownButtonID"
                bsSize="small"
                onSelect={this.handleSelect}
                bsStyle={bsStyle}
            >
                <MenuItem
                    eventKey="fund">
                    <Glyphicon glyph="upload"/> Fund
                </MenuItem>
                <MenuItem
                    eventKey="withdraw"
                    disabled={!this.props.order.withdrawEnabled}>
                    <Glyphicon glyph="download"/> Withdraw
                </MenuItem>
            </DropdownButton>
        )
    }

    renderTerminated() {
        return <div>-</div>
    }

    render(){
        if (this.props.order.isTerminated) {
            return this.renderTerminated()
        }
        switch(this.props.actionState) {
            case 'waitingTransaction':
            case 'checkingTransaction':
                return this.renderWaiting()
            case 'idle':
            default:
                return this.renderDefault()
        }

    }

}

OutgoingFundsButton.propTypes = {
    order: PropTypes.object.isRequired,
    onFund: PropTypes.func.isRequired,
    onWithdraw: PropTypes.func.isRequired,
}

export default OutgoingFundsButton
