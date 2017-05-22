import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
    Button,
    Modal,
    Row,
    Col,
    Form,
    FormGroup,
    HelpBlock,
    FormControl,
    ControlLabel,
    Well
} from 'react-bootstrap'
import EtherAmount from './EtherAmount'
import CurrentOrderStateAlert from "./CurrentOrderStateAlert"
import { BigNumWeiToDisplayString, secondsToDisplayString} from "./Utils"


class FundOrderModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            amount: props.order.paymentAmount,
            numberOfPayments: 1,
        }

        this.reset = this.reset.bind(this)
        this.handleAmountChange = this.handleAmountChange.bind(this)
        this.handleNumPaymentsChange = this.handleNumPaymentsChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.getTotalCoveredPayments = this.getTotalCoveredPayments.bind(this)
        this.getNewFailureDate = this.getNewFailureDate.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal !== this.state.showModal){
            if (nextProps.showModal)
                this.reset()
        }
    }

    reset() {
        if (this.props.order.ownerFunds < 0) {
            // Set the missing amount as start value
            this.handleAmountChange(this.props.order.ownerFunds.abs())
        } else {
            // Set one payment as start value
            this.setState({
                amount: this.props.order.paymentAmount,
                numberOfPayments: 1,
            })
        }

    }

    handleSubmit(event) {
        event.preventDefault()
        this.props.onSubmit(this.state.amount)
    }

    /*
     User changed the amount he wants to fund
     */
    handleAmountChange(wei) {
        if (wei.lessThan(0))
            wei = window.web3.toBigNumber(0)
        // Calculate resulting number of payments that are covered
        const numberOfPayments = wei.dividedBy(this.props.order.paymentAmount)
        this.setState({
            amount: wei,
            numberOfPayments: numberOfPayments
        })
    }

    /*
     User changed the number of payments he wants to fund for.
     */
    handleNumPaymentsChange(event) {
        const target = event.target
        let number = target.value
        if (number < 0)
            number = 0;
        const amount = this.props.order.paymentAmount.times(number)
        this.setState({
            amount: amount,
            numberOfPayments: number
        })
    }

    getTotalCoveredPayments() {
        // add number of future payments based on current funding settings
        return this.props.order.paymentsCovered.plus(this.state.numberOfPayments)
    }

    getNewFailureDate(){
        let secondsToFailure = this.getTotalCoveredPayments().floor() * this.props.order.paymentInterval
        return this.props.order.nextPaymentDate.clone().add(secondsToFailure, 's')
    }


    render() {
        let validationState = "success"
        if (this.getTotalCoveredPayments().isZero())
            validationState = "warning"
        else if (this.getTotalCoveredPayments().lessThan(0))
            validationState = "error"

        const modal = (
            <Modal bsSize="large" show={this.props.showModal} onHide={this.close}>
                <Modal.Header closeButton>
                    <Modal.Title>Fund order "{this.props.order.ownerLabel}"</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Row>
                        <Col md={6}>
                            <Well>
                                <h4>Contract Info</h4>
                                <Row>
                                    <Col md={6}>
                                        Payment amount:
                                    </Col>
                                    <Col md={6}>
                                        {BigNumWeiToDisplayString(this.props.order.paymentAmount)}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        Payment interval:
                                    </Col>
                                    <Col md={6}>
                                        {secondsToDisplayString(this.props.order.paymentInterval.toNumber())}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <hr/>
                                        <strong>Current funding state:</strong>
                                        <CurrentOrderStateAlert
                                            paymentAmount={this.props.order.paymentAmount}
                                            ownerFunds={this.props.order.ownerFunds}
                                            paymentsCovered={this.props.order.paymentsCovered}
                                            nextPaymentDate={this.props.order.nextPaymentDate}
                                            failureDate={this.props.order.failureDate}
                                        />
                                    </Col>
                                </Row>

                            </Well>
                        </Col>

                        <Col md={6}>
                            <Well>
                            <h4>Add Funds</h4>
                            <Form horizontal onSubmit={this.handleSubmit}>
                                <FormGroup validationState={validationState}>
                                    <Col componentClass={ControlLabel} md={4}>
                                        Amount
                                    </Col>
                                    <Col md={8}>
                                        <EtherAmount
                                            wei={this.state.amount}
                                            unit="ether"
                                            onChange={this.handleAmountChange}/>
                                        <HelpBlock>Change this value to directly set the ether amount to transfer to contract</HelpBlock>
                                    </Col>
                                </FormGroup>

                                <FormGroup validationState={validationState}>
                                    <Col componentClass={ControlLabel} md={4}>
                                        Number of payments
                                    </Col>
                                    <Col md={8}>
                                        <FormControl name="numberPayments"
                                                     type="number"
                                                     value={this.state.numberOfPayments}
                                                     onChange={this.handleNumPaymentsChange}/>
                                        <HelpBlock>Change this value to automatically set ether amount based on the number of payments you want to cover.</HelpBlock>
                                    </Col>
                                </FormGroup>
                            </Form>
                            <Row>
                                <Col md={12}>
                                    <strong>Resulting funding state:</strong>
                                    <CurrentOrderStateAlert
                                        paymentAmount={this.props.order.paymentAmount}
                                        ownerFunds={this.props.order.ownerFunds.plus(this.state.amount)}
                                        paymentsCovered={this.getTotalCoveredPayments()}
                                        nextPaymentDate={this.props.order.nextPaymentDate}
                                        failureDate={this.getNewFailureDate()}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                <Col mdOffset={2} md={5}>
                                    <Button bsStyle="primary" onClick={this.handleSubmit}>
                                        Initiate payment
                                    </Button>
                                </Col>
                                <Col mdOffset={0} md={5}>
                                    <Button bsStyle="danger" onClick={this.props.onCancel}>
                                        Cancel
                                    </Button>
                                </Col>
                            </Row>
                            </Well>
                        </Col>
                    </Row>

                </Modal.Body>
            </Modal>
        )

        return modal
    }

}

FundOrderModal.propTypes = {
    order: PropTypes.object.isRequired,
    showModal: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
}

export default FundOrderModal