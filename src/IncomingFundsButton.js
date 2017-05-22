import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, ButtonGroup, DropdownButton, MenuItem, Glyphicon, Label} from 'react-bootstrap'
import EtherDisplay from "./EtherDisplay"

class IncomingFundsButton extends Component {

    constructor(props) {
        super(props)

        this.handleSelect = this.handleSelect.bind(this)
        this.determineStyle = this.determineStyle.bind(this)
    }

    handleSelect(key, event) {
        console.log("Selected " + key + " for order " + this.props.order.address)
        switch (key) {
            case 'collect':
                this.props.onCollect()
                return
            default:
                console.log("Unhandled action in IncomingFundsButton!")
        }
    }

    determineStyle(){
        if (this.props.order.collectibleFunds.greaterThan(0))
            return 'success'
        return 'default'
    }

    render() {
        let etherDisplay = <EtherDisplay wei={this.props.order.collectibleFunds}/>
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
                    eventKey="collect"
                    disabled={!this.props.order.collectibleFunds.greaterThan(0)}>
                    <Glyphicon glyph="download"/> Collect
                </MenuItem>
            </DropdownButton>
        )
    }

}

IncomingFundsButton.propTypes = {
    order: PropTypes.object.isRequired,
    onCollect: PropTypes.func.isRequired,
}

export default IncomingFundsButton
