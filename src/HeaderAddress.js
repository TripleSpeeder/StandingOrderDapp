import React, {Component} from 'react'
import PropTypes from 'prop-types'

import 'react-widgets/dist/css/react-widgets.css'
import DropdownList from 'react-widgets/lib/DropdownList'

class HeaderAddress extends Component {

    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
        this.renderMultiAddress = this.renderMultiAddress.bind(this)
        this.renderSingleAddress = this.renderSingleAddress.bind(this)
    }

    render() {
        if (window.web3.eth.accounts.length > 1)
            return this.renderMultiAddress()
        else
            return this.renderSingleAddress()
    }

    renderMultiAddress() {
        return <h2>Account:
            <small>
                <DropdownList
                    defaultValue={this.props.account}
                    data={window.web3.eth.accounts}
                    filter='contains'
                    onChange={this.handleChange}
                />
            </small>
        </h2>
    }

    renderSingleAddress() {
        return <h2>Account: {this.props.account}</h2>
    }

    handleChange(account){
        console.log("HandleChange: " + account)
        this.props.handleChange(account)
    }
}

HeaderAddress.propTypes = {
    account: PropTypes.string.isRequired,
    handleChange: PropTypes.func.isRequired,
}

export default HeaderAddress