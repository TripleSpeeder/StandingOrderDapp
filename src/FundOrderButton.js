import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
    Button,
    Modal,
    Glyphicon,
    Row,
    Col,
    Form,
    FormGroup,
    HelpBlock,
    FormControl,
    ControlLabel
} from 'react-bootstrap'
import moment from 'moment'
import 'moment-duration-format'
import EtherAmount from './EtherAmount'


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
        this.setState({
            amount: this.props.order.paymentAmount,
            numberOfPayments: 1,
        })
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
                        <Col md={5}>
                            <h3>Contract Info</h3>
                        </Col>
                        <Col md={7}>
                            <h3>Setup Funding</h3>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={5}>

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

                        </Col>
                        <Col md={7}>
                            <Form horizontal onSubmit={this.handleSubmit}>
                                <FormGroup>
                                    <Col componentClass={ControlLabel} md={2}>
                                        Payment Amount
                                    </Col>
                                    <Col md={10}>
                                        <EtherAmount
                                            wei={this.state.amount}
                                            unit="ether"
                                            onChange={this.handleAmountChange}/>
                                    </Col>
                                </FormGroup>

                                <FormGroup>
                                    <Col componentClass={ControlLabel} md={2}>
                                        # of payments
                                    </Col>
                                    <Col md={10}>
                                        <FormControl name="numberPayments"
                                                     type="number"
                                                     value={this.state.numberOfPayments}
                                                     onChange={this.handleNumPaymentsChange}/>
                                    </Col>
                                </FormGroup>
                            </Form>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={5}>
                            <Row>
                                <Col md={12}>
                                    <h3>Current funding state:</h3>
                                    <p>{this.props.order.paymentsCovered.toNumber()} payments covered (until todo: Date here!)</p>
                                </Col>
                            </Row>
                        </Col>

                        <Col md={7}>
                            <Row>
                                <Col md={12}>
                                    <h3>Resulting funding state:</h3>
                                    <p>{this.getTotalCoveredPayments()} covered until (todo: Date here!)</p>
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