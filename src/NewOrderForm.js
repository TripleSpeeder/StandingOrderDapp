import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Form, ControlLabel, FormGroup, FormControl, Col, HelpBlock} from 'react-bootstrap'
import {CubeGrid, ThreeBounce} from 'better-react-spinkit'
import moment from 'moment'
import Duration from "./Duration"
import EtherAmount from './EtherAmount'
import DateTime from 'react-datetime'
import 'react-datetime/css/react-datetime.css';


class NewOrderForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            label: '',
            receiver: '',
            period: 60 * 60 * 24 * 7, // 1 week
            rate: window.web3.toBigNumber('0'),
            startTime: moment()
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleDurationChange = this.handleDurationChange.bind(this)
        this.handleAmountChange = this.handleAmountChange.bind(this)
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this)
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

    handleDurationChange(seconds) {
        this.setState({
            period: seconds
        })
    }

    handleAmountChange(wei) {
        this.setState({
            rate: wei
        })
    }

    handleStartTimeChange(startTime) {
        this.setState({
            startTime: startTime
        })
    }

    handleSubmit(event) {
        event.preventDefault()
        var order = {
            label: this.state.label,
            receiver: this.state.receiver,
            rate: this.state.rate,
            period: parseInt(this.state.period, 10),
            startTime: this.state.startTime,
        }
        console.log(order)
        this.props.onNewOrder(order)
    }

    render() {
        let createButton
        let cancelButton
        switch (this.props.createOrderProgress) {
            case 'waitingTransaction':
                createButton = <Button bsStyle="primary" type="submit" disabled>
                                <ThreeBounce/> Waiting...
                            </Button>
                cancelButton = <Button onClick={this.props.onCancel} disabled>
                            Cancel
                        </Button>
                break
            case 'done':
                createButton = <Button bsStyle="primary" type="submit" disabled>
                                Done!
                            </Button>
                cancelButton = <Button onClick={this.props.onCancel} disabled>
                            Cancel
                        </Button>
                break
            case 'idle':
            default:
                createButton = <Button bsStyle="primary" type="submit">
                                Create order
                            </Button>
                cancelButton = <Button onClick={this.props.onCancel}>
                            Cancel
                        </Button>
                break
        }

        return (
            <Form horizontal onSubmit={this.handleSubmit}>
                <FormGroup>
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

                <FormGroup>
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

                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>
                        Payment Amount
                    </Col>
                    <Col sm={10}>
                        <EtherAmount
                            wei={this.state.rate}
                            unit="ether"
                            onChange={this.handleAmountChange}/>
                        <HelpBlock>Amount Receiver gets per payment period</HelpBlock>
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>
                        First payment
                    </Col>
                    <Col sm={10}>
                        <DateTime
                            value={this.state.startTime}
                            onChange={this.handleStartTimeChange}
                        />
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>
                        Payment Period
                    </Col>
                    <Col sm={10}>
                        <Duration
                            seconds={this.state.period}
                            unit="weeks"
                            onChange={this.handleDurationChange}/>
                        <HelpBlock>Duration between payments</HelpBlock>
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col smOffset={2} sm={3}>
                        {createButton}
                    </Col>
                    <Col smOffset={5} sm={2}>
                        {cancelButton}
                    </Col>
                </FormGroup>
            </Form>
        )
    }
}

NewOrderForm.propTypes = {
    onNewOrder: PropTypes.func.isRequired,
    createOrderProgress: PropTypes.string.isRequired,
}

export default NewOrderForm