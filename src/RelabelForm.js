import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Form, ControlLabel, FormGroup, FormControl} from 'react-bootstrap'



class RelabelForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            label: props.label,
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleInputChange(event) {
        const target = event.target
        const name = target.name
        const value = target.value
        this.setState({
            [name]: value
        })
    }

    handleSubmit(event) {
        event.preventDefault()
        console.log(this.state.label)
        // Notify parent about new Label
        this.props.onRelabel(this.state.label)
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormGroup>
                    <ControlLabel>Enter new Label:</ControlLabel>
                    <FormControl
                        name="label"
                        type="text"
                        value={this.state.label}
                        placeholder="Enter label"
                        onChange={this.handleInputChange}/>
                </FormGroup>
                <Button type="submit">
                    Submit
                </Button>
            </Form>
        )
    }
}

RelabelForm.propTypes = {
    onRelabel: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
}

export default RelabelForm