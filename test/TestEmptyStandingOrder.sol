pragma solidity ^0.4.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/StandingOrder.sol";


contract UserMockA {

    function doCreateStandingOrder(StandingOrderFactory _factory, address _payee, uint _rate, uint _interval) returns(StandingOrder){
        StandingOrder so = _factory.createStandingOrder(_payee, _rate, _interval, 'fromUserA');
        return so;
    }

    function doGetNumOrdersByOwner(StandingOrderFactory _factory) constant returns(uint) {
        return _factory.getNumOrdersByOwner();
    }

    function doGetNumOrdersByPayee(StandingOrderFactory _factory) constant returns(uint) {
        return _factory.getNumOrdersByPayee();
    }

    function doGetOwnOrderByIndex(StandingOrderFactory _factory, uint _index) constant returns(StandingOrder) {
        StandingOrder so = _factory.getOwnOrderByIndex(_index);
        return so;
    }

    function doGetPaidOrderByIndex(StandingOrderFactory _factory, uint _index) constant returns(StandingOrder) {
        StandingOrder so = _factory.getPaidOrderByIndex(_index);
        return so;
    }

    function doSelfdestruct(address owner) {
        selfdestruct(owner);
    }

    function fund() payable {
    }

    function doCreateStandingOrder(address _payee, uint _paymentInterval, uint _paymentAmount) returns(StandingOrder) {
        return new StandingOrder(_payee, _paymentInterval, _paymentAmount, 'fromUserA');
    }

    function doCancelStandingOrder(StandingOrder _so) {
        _so.Cancel();
    }

    /*
    function doDeposit(Bank bank, uint amount){
        bank.deposit.value(amount)();
    }

    function doWithDraw(Bank bank, uint amount) {
        bank.withdraw(amount);
    }

    // Needed so the bank can actually send back money in the Withdrawal tests!!!
    function() payable {
    }

    function doGetBalance(Bank bank) returns(uint) {
        return bank.getBalance();
    }
    */
}

contract TestEmptyStandingOrder {

    StandingOrder emptyStandingOrder;
    UserMockA owner;
    UserMockA payee;
    uint paymentInterval = 100;
    uint paymentAmount = 1 finney;

    function beforeAll() {
        owner = new UserMockA();
        payee = new UserMockA();
    }

    function beforeEach() {
        // create an empty (unfunded) standingorder
        // emptyStandingOrder = new StandingOrder(owner, payee, paymentInterval, paymentAmount);
        emptyStandingOrder = owner.doCreateStandingOrder(payee, paymentInterval, paymentAmount);
    }

    function testEmptyStandingOrder() {
        // test that all relevant methods return 0
        Assert.balanceIsZero(address(emptyStandingOrder), "Empty order should not have any balance");
        Assert.isZero(emptyStandingOrder.claimedFunds(), "Claimed funds should be zero");
        Assert.isZero(emptyStandingOrder.getUnclaimedFunds(), "Unclaimed funds should be zero");
        Assert.isZero(emptyStandingOrder.getOwnerFunds(), "Owner funds should be zero");
    }

    function testEmptyCollect() {
        // TODO test that collect does not work
    }

    function testEmptyCancel() {
        // test that cancelling does work
        owner.doCancelStandingOrder(emptyStandingOrder);
    }

    function testEmptyWithdrawal() {
        // TODO test that withdrawal does not work
    }
}
