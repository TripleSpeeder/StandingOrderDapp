pragma solidity ^0.4.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/StandingOrder.sol";


contract UserMockB {

    function fund() payable {
    }

    function doCreateStandingOrder(StandingOrderFactory _factory, address _payee, uint _rate, uint _interval) returns(StandingOrder){
        StandingOrder so = _factory.createStandingOrder(_payee, _rate, _interval, 'fromUserB');
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

    function doCreateStandingOrder(address _payee, uint _paymentInterval, uint _paymentAmount) returns(StandingOrder) {
        return new StandingOrder(_payee, _paymentInterval, _paymentAmount, 'fromUserB');
    }

    function doFundStandingOrder(StandingOrder _so, uint _amount) returns(bool) {
        return(_so.send(_amount));
    }

    function doCancelStandingOrder(StandingOrder _so) {
        _so.Cancel();
    }

    function doCollect(StandingOrder _so) {
        _so.collectFunds();
    }

    /*
    function doDeposit(Bank bank, uint amount){
        bank.deposit.value(amount)();
    }

    function doWithDraw(Bank bank, uint amount) {
        bank.withdraw(amount);
    }

    function doGetBalance(Bank bank) returns(uint) {
        return bank.getBalance();
    }
    */
}

contract TestFundedStandingOrder {

    uint public initialBalance = 10 ether;

    StandingOrder standingOrder;
    UserMockB owner;
    UserMockB payee;
    uint fundAmount = 1 ether;
    uint paymentInterval = 1;
    uint paymentAmount = 1 finney;

    function beforeAll() {
    }

    function beforeEach() {
        // setup user
        owner = new UserMockB();
        payee = new UserMockB();
        // fund owner
        owner.fund.value(5 ether)();
        // fund payee?
        // create a standingorder from owner for payee
        standingOrder = owner.doCreateStandingOrder(payee, paymentInterval, paymentAmount);
        // fund standingorder
        Assert.isTrue(owner.doFundStandingOrder(standingOrder, 1 ether), "Funding should work");
    }

    function afterEach() {
        // selfdestruct user, getting funds back to this testcontract
        owner.doSelfdestruct(this);
        payee.doSelfdestruct(this);
    }

    function testFundedStandingOrder() {
        // test that all relevant methods return expected values
        Assert.balanceEqual(address(standingOrder), fundAmount, "Order should have funded balance");
        Assert.isZero(standingOrder.claimedFunds(), "Claimed funds should be zero");
        Assert.equal(standingOrder.getUnclaimedFunds(), paymentAmount, "One payment should be unclaimed"); // Assuming one block has been mined since creating contract
        Assert.equal(standingOrder.getOwnerFunds(), fundAmount-paymentAmount, "Owner funds should be funded balance"); // same assumption!
    }

    function testCollect() {
	// check precondition - In order to collect funds something has to be available
	uint age = now - standingOrder.startTime();
	Assert.isAbove(age, 0, "Age should be > 0");
        Assert.isNotZero(standingOrder.getUnclaimedFunds(), "Unclaimed funds should be available");
        // test that collect does work
        payee.doCollect(standingOrder);
        Assert.balanceEqual(payee, paymentAmount, "Payee balance should match after collecting");
    }

    function testCancel() {
        // TODO test that cancelling does not work
        // owner.doCancelStandingOrder(standingOrder);
    }

    function testWithdrawal() {
        // TODO test that withdrawal does work
    }
}
