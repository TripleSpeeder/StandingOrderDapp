import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Modal, Glyphicon} from 'react-bootstrap'
import RelabelForm from './RelabelForm'

class RelabelButton extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false
        }

        this.onRelabel = this.onRelabel.bind(this)
        this.open = this.open.bind(this)
        this.close = this.close.bind(this)
    }

    onRelabel(_label) {
        // Form submitted a new label. Pass on event to parent and close self
        this.props.onRelabel(_label)
        this.close()
    }

    close() {
        this.setState({showModal: false})
    }

    open() {
        this.setState({showModal: true})
    }

    render() {
        return <span>
            <Button
                bsStyle="primary"
                bsSize="small"
                onClick={this.open}>
                <Glyphicon glyph="edit"/>
            </Button>
            <Modal bsSize="small" show={this.state.showModal} onHide={this.close}>
                <Modal.Header closeButton>
                    <Modal.Title>Rename order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <RelabelForm
                        label={this.props.label}
                        onRelabel={this.onRelabel}
                    />
                </Modal.Body>
            </Modal>

        </span>
    }
}

RelabelButton.propTypes = {
    label: PropTypes.string.isRequired,
    onRelabel: PropTypes.func.isRequired,
}

export default RelabelButton