import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
    Alert,
    Button,
    Modal,
    Glyphicon,
    Row,
    Col,
    Form,
    FormGroup,
    Panel,
    FormControl,
    ControlLabel,
    Well
} from 'react-bootstrap'
import moment from 'moment'
import 'moment-duration-format'
import EtherAmount from './EtherAmount'
import CurrentOrderStateAlert from "./CurrentOrderStateAlert"


class FundOrderButton extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
            amount: props.order.paymentAmount,
            numberOfPayments: 1,
        }

        this.open = this.open.bind(this)
        this.close = this.close.bind(this)
        this.reset = this.reset.bind(this)
        this.handleAmountChange = this.handleAmountChange.bind(this)
        this.handleNumPaymentsChange = this.handleNumPaymentsChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.getTotalCoveredPayments = this.getTotalCoveredPayments.bind(this)
    }

    close() {
        this.setState({showModal: false})
    }

    open() {
        this.reset()
        this.setState({showModal: true})
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
        this.props.onFund(this.state.amount)
        this.close()
    }

    BigNumWeiToDisplayString(bignum) {
        var unit = 'ether'
        var decimalPlaces = 10
        return window.web3.fromWei(bignum, unit).toFixed()
    }

    secondsToDisplayString(seconds) {
        if (seconds < 60 * 60 * 24) // less than one day?
            return moment.duration(seconds, "seconds").format("hh:mm.ss", {trim: false})
        return moment.duration(seconds, "seconds").format("d [days]")
    }

    /*
     User changed the amount he wants to fund
     */
    handleAmountChange(wei) {
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
        const number = target.value
        const amount = this.props.order.paymentAmount.times(number)
        this.setState({
            amount: amount,
            numberOfPayments: number
        })
    }

    getTotalCoveredPayments() {
        // add number of future payments based on current funding settings
        return this.props.order.paymentsCovered.plus(this.state.numberOfPayments).toFixed()
    }


    render() {
        const modal = (
            <Modal bsSize="large" show={this.state.showModal} onHide={this.close}>
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
                                        {this.BigNumWeiToDisplayString(this.props.order.paymentAmount)}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        Payment interval:
                                    </Col>
                                    <Col md={6}>
                                        {this.secondsToDisplayString(this.props.order.paymentInterval.toNumber())}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <hr/>
                                        <CurrentOrderStateAlert order={this.props.order}/>
                                    </Col>
                                </Row>

                            </Well>
                        </Col>

                        <Col md={6}>
                            <Well>
                            <h4>Setup Funding</h4>
                            <Form horizontal onSubmit={this.handleSubmit}>
                                <FormGroup>
                                    <Col componentClass={ControlLabel} md={4}>
                                        Payment Amount
                                    </Col>
                                    <Col md={8}>
                                        <EtherAmount
                                            wei={this.state.amount}
                                            unit="ether"
                                            onChange={this.handleAmountChange}/>
                                    </Col>
                                </FormGroup>

                                <FormGroup>
                                    <Col componentClass={ControlLabel} md={4}>
                                        # of payments
                                    </Col>
                                    <Col md={8}>
                                        <FormControl name="numberPayments"
                                                     type="number"
                                                     value={this.state.numberOfPayments}
                                                     onChange={this.handleNumPaymentsChange}/>
                                    </Col>
                                </FormGroup>
                            </Form>
                            <Row>
                                <Col md={12}>
                                    <Alert bsStyle="info">
                                        <strong>Resulting funding state:</strong>
                                        <p>
                                            Next <strong>{this.getTotalCoveredPayments()}</strong> payments
                                            covered until <strong>todo: Date here!</strong>
                                        </p>
                                    </Alert>
                                </Col>
                            </Row>

                            <Row>
                                <Col mdOffset={2} md={5}>
                                    <Button bsStyle="primary" onClick={this.handleSubmit}>
                                        Initiate payment
                                    </Button>
                                </Col>
                                <Col mdOffset={0} md={5}>
                                    <Button bsStyle="danger" onClick={this.close}>
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

        return <Button bsStyle="success" bsSize="small" title="Add Funds"
                       onClick={this.open}>
            <Glyphicon glyph="upload"/>
            {modal}
        </Button>
    }

}

FundOrderButton.propTypes = {
    order: PropTypes.object.isRequired,
    onFund: PropTypes.func.isRequired,
    // factoryInstance: PropTypes.any.isRequired,
}

export default FundOrderButton