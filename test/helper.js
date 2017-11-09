var StandingOrder = artifacts.require('StandingOrder')

exports.createOrder = async function (factory, owner, payee, amount, interval, startTime, label) {
    let result = await factory.createStandingOrder(payee, amount, interval, startTime.unix(), label, {
        from: owner,
        gas: 1000000
    })
    // now get the actual standingOrderContract
    let orderIndex = 0
    let address = await factory.getOwnOrderByIndex.call(orderIndex, {from: owner})
    return StandingOrder.at(address)
}