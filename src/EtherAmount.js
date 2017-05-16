import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {InputGroup, FormControl, DropdownButton, MenuItem} from 'react-bootstrap'

class EtherAmount extends Component {

    constructor(props) {
        super(props)
        this.state = {
            unit: props.unit,
        }

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
        this.props.onChange(this.toWei(value))
    }

    onUnitSelected(key, event) {
        this.setState({unit: key})
    }

    render() {
        return <InputGroup>
            <FormControl
                type="number"
                value={this.fromWei(this.props.wei)}
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