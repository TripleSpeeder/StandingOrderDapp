import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {InputGroup, FormControl, DropdownButton, MenuItem} from 'react-bootstrap'

class EtherAmount extends Component {

    constructor(props) {
        super(props)
        this.state = {
            unit: props.unit,
        }
        this.lastRepresentation = ''

        this.onUnitSelected = this.onUnitSelected.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
    }

    toWei(value) {
        return window.web3.toBigNumber(window.web3.toWei(value, this.state.unit))
    }

    fromWei(wei) {
        return window.web3.fromWei(window.web3.toBigNumber(wei), this.state.unit).toFixed()
    }

    handleInputChange(event) {
        const target = event.target
        const value = target.value
        this.lastRepresentation = value
        this.props.onChange(this.toWei(value))
    }

    onUnitSelected(key, event) {
        this.lastRepresentation = '' // reset lastRepresentation to clear leading/trailing zeros
        this.setState({
            unit: key,
        })
    }

    render() {
        const {wei} = this.props
        // keep the string value entered by the user as long as it results in the same number of WEI. This enables entering
        // values with leading/trailing zeros like 0.005. Otherwise user would not be able to enter a zero after the decimal
        // point, as "0.0" would always be converted to plain "0" in the OnChange handler.
        // See https://github.com/TripleSpeeder/StandingOrderDapp/issues/65
        const oldwei = this.toWei(this.lastRepresentation)
        const value = (oldwei.equals(wei)) ? this.lastRepresentation : this.fromWei(wei)

        return <InputGroup>
            <FormControl
                type="number"
                value={value}
                onChange={this.handleInputChange}
            />
            <DropdownButton
                componentClass={InputGroup.Button}
                id="input-dropdown-addon"
                title={this.state.unit}
                onSelect={this.onUnitSelected}
            >
                <MenuItem eventKey='wei'    active={(this.state.unit === 'wei')}>wei</MenuItem>
                <MenuItem eventKey='kwei'   active={(this.state.unit === 'kwei')}>kwei</MenuItem>
                <MenuItem eventKey='mwei'   active={(this.state.unit === 'mwei')}>mwei</MenuItem>
                <MenuItem eventKey='gwei'   active={(this.state.unit === 'gwei')}>gwei</MenuItem>
                <MenuItem eventKey='szabo'  active={(this.state.unit === 'szabo')}>szabo</MenuItem>
                <MenuItem eventKey='finney'    active={(this.state.unit === 'finney')}>finney</MenuItem>
                <MenuItem eventKey='ether'   active={(this.state.unit === 'ether')}>ether</MenuItem>
                <MenuItem eventKey='kether'   active={(this.state.unit === 'kether')}>kether</MenuItem>
            </DropdownButton>
        </InputGroup>
    }
}

// static units
EtherAmount.units = [
    'wei',
    'kwei',
    'mwei',
    'gwei',
    'szabo',
    'finney',
    'ether',
    'kether',
]


EtherAmount.propTypes = {
    wei: PropTypes.object.isRequired,   // Expecting a BigNumber
    unit: PropTypes.oneOf(EtherAmount.units).isRequired,
    onChange: PropTypes.func,
}

export default EtherAmount