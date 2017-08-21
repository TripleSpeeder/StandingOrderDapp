import moment from 'moment'
import 'moment-duration-format'

export function BigNumWeiToDisplayString(bignum, unit='ether') {
        // Following code does not work in webpack production build:
        //
        //  return window.web3.fromWei(bignum, unit).toFixed()
        //
        // Contrary to documentation, "fromWei" always returns a string in production build, so
        // calling <string>.toFixed does not work. In dev build it returns the expected "bignum" instance!

        let x = window.web3.fromWei(bignum, unit)
        if (typeof(x) === 'string') {
            // console.log("Expected bigNumber, got String instead: " + x)
            // console.log("Input was: " + typeof (bignum))
            return x;
        } else {
            // console.log("Got expected bigNumber, returning .toFixed.")
            return x.toFixed()
        }
    }

export function secondsToDisplayString(seconds) {
        if (seconds < 60 * 60 * 24) // less than one day?
            return moment.duration(seconds, "seconds").format("hh:mm.ss", {trim: false})
        return moment.duration(seconds, "seconds").format("d [days]")
    }