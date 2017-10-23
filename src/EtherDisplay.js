import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { BigNumWeiToDisplayString } from './Utils'

class EtherDisplay extends Component {

    constructor(props) {
        super(props)

        this.minGwei    = window.web3.toBigNumber('1000000000')
        this.minFinney  = window.web3.toBigNumber('100000000000')
        this.minEther   = window.web3.toBigNumber('100000000000000')

        this.determineUnit = this.determineUnit.bind(this)
    }

    /* I want to display wei, gwei, finney or ether. */
    determineUnit(weiAmount) {
        const absWei = weiAmount.abs()
        if (absWei.isZero())
            return "ether"
        else if (absWei.lessThan(this.minGwei))
            return "wei"
        else if (absWei.lessThan(this.minFinney))
            return "gwei"
        else if (absWei.lessThan(this.minEther))
            return "finney"
        else
            return "ether"
    }

    render() {
        const unit = this.determineUnit(this.props.wei)
        return <span>
            {BigNumWeiToDisplayString(this.props.wei, unit)} {unit}
        </span>
    }
}

EtherDisplay.propTypes = {
    wei: PropTypes.object.isRequired // BigNumber
}

export default EtherDisplay
