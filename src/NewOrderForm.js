import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Form, ControlLabel, FormGroup, FormControl, Col, HelpBlock} from 'react-bootstrap'
import {ThreeBounce} from 'better-react-spinkit'
import moment from 'moment'
import Duration from "./Duration"
import EtherAmount from './EtherAmount'
import DateTime from 'react-datetime'
import 'react-datetime/css/react-datetime.css'
import EtherDisplay from "./EtherDisplay"


class NewOrderForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            label: '',
            receiver: '',
            period: 60 * 60 * 24 * 7, // 1 week
            rate: window.web3.toBigNumber('0'),
            startTime: moment(),
            labelValid: false,
            receiverValid: false,
            rateValid: false
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleDurationChange = this.handleDurationChange.bind(this)
        this.handleAmountChange = this.handleAmountChange.bind(this)
        this.handleStartTimeChange = this.handleStartTimeChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.estimateGasCosts = this.estimateGasCosts.bind(this)
    }

    estimateGasCosts(){
        this.setState({gasEstimate: 'Estimating...'})
        var order = {
            label: this.state.label,
            receiver: this.state.receiver,
            rate: this.state.rate,
            period: this.state.period,
            startTime: this.state.startTime,
        }
        this.props.onEstimateGas(order)
    }

    componentDidUpdate(prevProps, prevState){
        // Check if we should retrigger gas estimate
        if (!this.formIsValid()) {
            // Don't bother...
            return
        }
        if ((prevState.label !== this.state.label) ||
            (!prevState.rate.equals(this.state.rate)) ||
            (!prevState.period===this.state.period) ||
            (!prevState.startTime.isSame(this.state.startTime))) {
            this.estimateGasCosts()
        }
    }

    handleInputChange(event) {
        const target = event.target
        const name = target.name
        const value = target.value
        this.setState({
            [name]: value
        })

        // check for valid receiver address
        if (name === 'receiver') {
            this.setState({receiverValid: (/^(0x)?[0-9a-f]{40}$/i.test(value))})
        }

        // check for valid label
        if (name === 'label') {
            this.setState({labelValid: (value.length >= 2)})
        }
    }

    handleDurationChange(seconds) {
        this.setState({
            period: parseInt(seconds, 10)
        })
    }

    handleAmountChange(wei) {
        // don't allow negative rate
        if (wei.lessThan(0))
            wei = window.web3.toBigNumber('0')

        this.setState({
            rate: wei,
            rateValid: wei.greaterThan(0)
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
            period: this.state.period,
            startTime: this.state.startTime,
        }
        console.log(order)
        this.props.onNewOrder(order)
    }

    formIsValid() {
        return (this.state.rateValid && this.state.labelValid && this.state.receiverValid)
    }

    render() {
        let gasCostEstimate = "Please fix form errors to get gas estimate"
        if (this.formIsValid() && this.props.gasPrice && this.props.gasEstimate){
            let gasCosts = this.props.gasPrice.mul(this.props.gasEstimate)
            gasCostEstimate = <span>
                <EtherDisplay wei={gasCosts}/>
                <br/>
                <small>(gas usage: {this.props.gasEstimate}, current gas price: <EtherDisplay wei={this.props.gasPrice}/>)</small>
            </span>
        }
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
                if (this.formIsValid()) {
                    createButton = <Button bsStyle="primary" type="submit">
                        Create order
                    </Button>
                } else {
                    createButton = <Button bsStyle="primary" type="submit" disabled>
                        Create order
                    </Button>
                }
                cancelButton = <Button onClick={this.props.onCancel}>
                    Cancel
                </Button>
                break
        }

        return (
            <Form horizontal onSubmit={this.handleSubmit}>
                <FormGroup validationState={this.state.labelValid ? 'success' : 'error'}>
                    <Col componentClass={ControlLabel} sm={2}>
                        Label
                    </Col>
                    <Col sm={10}>
                        <FormControl name="label"
                                     type="text"
                                     value={this.state.label}
                                     placeholder="Enter Contract Label"
                                     onChange={this.handleInputChange}
                                     required
                        />
                        <FormControl.Feedback />
                    </Col>
                </FormGroup>

                <FormGroup validationState={this.state.receiverValid ? 'success' : 'error'}>
                    <Col componentClass={ControlLabel} sm={2}>
                        Receiver
                    </Col>
                    <Col sm={10}>
                        <FormControl name="receiver"
                                     type="text"
                                     value={this.state.receiver}
                                     placeholder="Enter Receiver address"
                                     onChange={this.handleInputChange}
                                     required
                        />
                        <FormControl.Feedback />
                    </Col>
                </FormGroup>

                <FormGroup validationState={this.state.rateValid ? 'success' : 'error'}>
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
                    <Col componentClass={ControlLabel} sm={2}>
                        First payment
                    </Col>
                    <Col sm={10}>
                        <DateTime
                            value={this.state.startTime}
                            onChange={this.handleStartTimeChange}
                        />
                        <HelpBlock>When is the first payment due. Dates in the past are allowed!</HelpBlock>
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>
                        Estimated gas costs
                    </Col>
                    <Col sm={10}>
                        <FormControl.Static>
                            {gasCostEstimate}
                        </FormControl.Static>
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