import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Form, ControlLabel, FormGroup, FormControl, Col, HelpBlock} from 'react-bootstrap'


class NewOrderForm extends Component {

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
        var order = {
            label: this.state.label,
            receiver: this.state.receiver,
            rate: parseInt(this.state.rate),
            period: parseInt(this.state.period),
        }
        console.log(order)
        this.props.onNewOrder(order)
    }

    render() {
        return (
            <Form horizontal onSubmit={this.handleSubmit}>
                <FormGroup controlID="controlOrderLabel">
                    <Col componentClass={ControlLabel} sm={2}>
                        Label
                    </Col>
                    <Col sm={10}>
                        <FormControl name="label"
                                     type="text"
                                     value={this.state.label}
                                     placeholder="Enter Contract Label"
                                     onChange={this.handleInputChange}/>
                    </Col>
                </FormGroup>

                <FormGroup controlID="controlOrderReceiverAddress">
                    <Col componentClass={ControlLabel} sm={2}>
                        Receiver
                    </Col>
                    <Col sm={10}>
                        <FormControl name="receiver"
                                     type="text"
                                     value={this.state.receiver}
                                     placeholder="Enter Receiver address"
                                     onChange={this.handleInputChange}/>
                    </Col>
                </FormGroup>

                <FormGroup controlID="controlOrderRate">
                    <Col componentClass={ControlLabel} sm={2}>
                        Payment Amount
                    </Col>
                    <Col sm={10}>
                        <FormControl name="rate"
                                     type="number"
                                     value={this.state.rate}
                                     placeholder="Enter Payment Amount"
                                     onChange={this.handleInputChange}/>
                        <HelpBlock>Amount Receiver gets per payment period</HelpBlock>
                    </Col>
                </FormGroup>

                <FormGroup controlID="controlOrderRate">
                    <Col componentClass={ControlLabel} sm={2}>
                        Payment Period
                    </Col>
                    <Col sm={10}>
                        <FormControl name="period"
                                     type="number"
                                     value={this.state.period}
                                     placeholder="Enter Payment period"
                                     onChange={this.handleInputChange}/>
                        <HelpBlock>Payment will occur every &lt;period&gt; seconds</HelpBlock>
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col smOffset={2} sm={3}>
                        <Button bsStyle="primary" type="submit">
                            Create order
                        </Button>
                    </Col>
                    <Col smOffset={5} sm={2}>
                        <Button onClick={this.props.onCancel}>
                            Cancel
                        </Button>
                    </Col>
                </FormGroup>
            </Form>
        )
    }
}

NewOrderForm.propTypes = {
    onNewOrder: PropTypes.func.isRequired,
}

export default NewOrderForm