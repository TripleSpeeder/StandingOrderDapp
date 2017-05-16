import moment from 'moment'
import 'moment-duration-format'

export function BigNumWeiToDisplayString(bignum, unit='ether') {
        return window.web3.fromWei(bignum, unit).toFixed()
    }

export function secondsToDisplayString(seconds) {
        if (seconds < 60 * 60 * 24) // less than one day?
            return moment.duration(seconds, "seconds").format("hh:mm.ss", {trim: false})
        return moment.duration(seconds, "seconds").format("d [days]")
    }