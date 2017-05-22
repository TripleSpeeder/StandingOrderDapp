import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, ButtonGroup, DropdownButton, MenuItem, Glyphicon, Label} from 'react-bootstrap'
import EtherDisplay from "./EtherDisplay"

class OutgoingFundsButton extends Component {

    constructor(props) {
        super(props)

        this.handleSelect = this.handleSelect.bind(this)
        this.determineStyle = this.determineStyle.bind(this)
    }

    handleSelect(key, event) {
        console.log("Selected " + key + " for order " + this.props.order.address)
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

    render() {
        let etherDisplay = <EtherDisplay wei={this.props.order.ownerFunds}/>
        let bsStyle = this.determineStyle()
        return (
            <DropdownButton
                title={etherDisplay}
                id="dropDownButtonID"
                bsSize="small"
                onSelect={this.handleSelect}
                bsStyle={bsStyle}
                block
            >
                <MenuItem eventKey="fund">Fund <Glyphicon glyph="upload"/></MenuItem>
                <MenuItem
                    eventKey="withdraw"
                    disabled={!this.props.order.withdrawEnabled}>
                    Withdraw <Glyphicon glyph="download"/>
                </MenuItem>
            </DropdownButton>
        )
    }

}

OutgoingFundsButton.propTypes = {
    order: PropTypes.object.isRequired,
    onFund: PropTypes.func.isRequired,
    onWithdraw: PropTypes.func.isRequired,
}

export default OutgoingFundsButton
