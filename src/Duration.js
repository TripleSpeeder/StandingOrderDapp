import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {FormGroup, InputGroup, FormControl, DropdownButton, MenuItem} from 'react-bootstrap'

class Duration extends Component {

    constructor(props) {
        super(props)
        this.state = {
            unit: props.unit,
        }

        this.onUnitSelected = this.onUnitSelected.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
    }

    getDisplayNumber(seconds) {
        switch (this.state.unit) {
            case 'seconds':
                return seconds
            case 'minutes':
                return seconds / 60
            case 'hours':
                return seconds / (60 * 60)
            case 'days':
                return seconds / (60 * 60 * 24)
            case 'weeks':
                return seconds / (60 * 60 * 24 * 7)
        }
    }

    secondsFromUnit(value) {
        switch (this.state.unit){
            case 'seconds':
                return value
            case 'minutes':
                return value * 60
            case 'hours':
                return value * (60 * 60)
            case 'days':
                return value * (60 * 60 * 24)
            case 'weeks':
                return value * (60 * 60 * 24 * 7)
        }
    }

    handleInputChange(event) {
        const target = event.target
        const name = target.name
        const value = target.value
        this.props.onChange(this.secondsFromUnit(value))
    }

    onUnitSelected(key, event) {
        const target = event.target
        const name = target.name
        const value = target.value
        console.log("Selectd unit: " + key)
        this.setState({unit: key})
    }

    render() {
        return <InputGroup>
                <FormControl
                    type="number"
                    value={this.getDisplayNumber(this.props.seconds)}
                    onChange={this.handleInputChange}
                />
                <DropdownButton
                    componentClass={InputGroup.Button}
                    id="input-dropdown-addon"
                    title={this.state.unit}
                    onSelect={this.onUnitSelected}
                >
                    <MenuItem eventKey='seconds' active={(this.state.unit === 'seconds')}>seconds</MenuItem>
                    <MenuItem eventKey='minutes' active={(this.state.unit === 'minutes')}>minutes</MenuItem>
                    <MenuItem eventKey='hours' active={(this.state.unit === 'hours')}>hours</MenuItem>
                    <MenuItem eventKey='days' active={(this.state.unit === 'days')}>days</MenuItem>
                    <MenuItem eventKey='weeks' active={(this.state.unit === 'weeks')}>weeks</MenuItem>
                </DropdownButton>
            </InputGroup>
    }
}

Duration.propTypes = {
    seconds: PropTypes.number.isRequired,
    unit: PropTypes.oneOf(['weeks', 'days', 'hours', 'minutes', 'seconds']).isRequired,
    onChange: PropTypes.func,
}

export default Duration