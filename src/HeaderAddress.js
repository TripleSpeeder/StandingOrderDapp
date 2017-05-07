import React, {Component} from 'react'
import PropTypes from 'prop-types'

class HeaderAddress extends Component {

    render() {
        return <h2>Address: {this.props.account}</h2>
    }
}

HeaderAddress.propTypes = {
    account: PropTypes.string.isRequired,
}

export default HeaderAddress