var StandingOrder = artifacts.require('StandingOrder')

exports.createOrder = function (factory, owner, payee, amount, interval, startTime, label) {
        return factory.createStandingOrder(payee, amount, interval, startTime.unix(), label, {
            from: owner,
            gas: 1000000
        }).then(function (result) {
            // now get the actual standingOrderContract
            let orderIndex = 0
            return factory.getOwnOrderByIndex.call(orderIndex, {from: owner})
        }).then(function (address) {
            return StandingOrder.at(address)
        })
    }