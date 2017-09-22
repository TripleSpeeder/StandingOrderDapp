import React, {Component} from 'react'
import moment from 'moment'

class BlockInfo extends Component {

    constructor(props) {
        super(props)
        this.state = {
            lastBlock: 'unknown',
            lastTimestamp: 0
        }
        this.updateBlockInfo = this.updateBlockInfo.bind(this)
    }

    updateBlockInfo(block) {
        this.setState({
            lastBlock: block.number,
            lastTimestamp: block.timestamp,
        })
    }

    componentDidMount() {
        var self=this

        // get current block
        window.web3.eth.getBlock('latest', function(error, block){
            self.updateBlockInfo(block)
        })

        // Start listening to new block events
        this.filter = window.web3.eth.filter('latest')
        this.filter.watch(function(error, result){
            window.web3.eth.getBlockPromise(result).then(function(block) {
                self.updateBlockInfo(block)
            })
        })
    }

    componentWillUnmount() {
        // Stop listening to new block events
        this.filter.stopWatching(function(error, result){
            if (error) {
                console.log("Error while stopWatching: " + error)
            }
        })
    }


    render() {
        let timestamp = 'unknown'
        if (this.state.lastTimestamp > 0) {
            timestamp = moment.unix(this.state.lastTimestamp).format()
        }
        return <span>
            Block: {this.state.lastBlock} ({timestamp})
        </span>
    }
}

export default BlockInfo
