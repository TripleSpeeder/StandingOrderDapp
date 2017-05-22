import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, ButtonGroup, DropdownButton, MenuItem, Glyphicon, Label} from 'react-bootstrap'
import EtherDisplay from "./EtherDisplay"

import moment from 'moment'

class FundsButton extends Component {

    constructor(props) {
        super(props)

        this.handleSelect = this.handleSelect.bind(this)
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

    render() {
        let etherDisplay = <EtherDisplay wei={this.props.order.ownerFunds}/>
        return (
            <div>
                <DropdownButton
                    title={etherDisplay}
                    id="dropDownButtonID"
                    bsSize="small"
                    onSelect={this.handleSelect}
                >
                    <MenuItem eventKey="fund">Fund <Glyphicon glyph="upload"/></MenuItem>
                    <MenuItem
                        eventKey="withdraw"
                        disabled={!this.props.order.withdrawEnabled}>
                        Withdraw <Glyphicon glyph="download"/>
                    </MenuItem>
                </DropdownButton>
            </div>
        )
    }

}

FundsButton.propTypes = {
    order: PropTypes.object.isRequired,
    onFund: PropTypes.func.isRequired,
    onWithdraw: PropTypes.func.isRequired,
}

export default FundsButton
