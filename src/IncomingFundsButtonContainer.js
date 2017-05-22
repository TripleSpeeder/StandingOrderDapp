import React, {Component} from 'react'
import PropTypes from 'prop-types'
import IncomingFundsButton from './IncomingFundsButton'


class IncomingFundsButtonContainer extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        return <div>
            <IncomingFundsButton
                order={this.props.order}
                onCollect={this.props.onCollect}
            />
            </div>
    }

}

IncomingFundsButtonContainer.propTypes = {
    order: PropTypes.object.isRequired,
    onCollect: PropTypes.func.isRequired,
}

export default IncomingFundsButtonContainer
