pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/StandingOrder.sol";

contract UserMock {

    function doCreateStandingOrder(StandingOrderFactory _factory, address _payee, uint _rate, uint _interval) returns(StandingOrder){
        StandingOrder so = _factory.createStandingOrder(_payee, _rate, _interval, 'fromUserMock');
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
        return new StandingOrder(_payee, _paymentInterval, _paymentAmount, 'fromUserMock');
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

contract TestStandingOrderFactory {

    // This test needs a lot of ether to deploy. Start testrpc proving more initial funds:
    // testrpc --account="0xf258bc90ebe2d4a383a563a79636106dd6ecd5dd6efa3fe3031cdd383bc2bac3,10000000000000000000000000"

    uint public initialBalance = 100 ether;
    StandingOrderFactory sof;
    UserMock user1;
    UserMock user2;
    UserMock user3;

    function beforeEach() {
        // setup factory
        sof = new StandingOrderFactory();
        // setup 3 user
        user1 = new UserMock();
        user2 = new UserMock();
        user3 = new UserMock();
        // fund users with 2 ether each
        user1.fund.value(2 ether)();
        user2.fund.value(2 ether)();
        user3.fund.value(2 ether)();
    }

    function afterEach() {
        // selfdestruct user, getting funds back to this testcontract
        user1.doSelfdestruct(this);
        user2.doSelfdestruct(this);
        user3.doSelfdestruct(this);
    }

    function testCreateStandingOrder() {
        // check before creating any order
        uint expected = 0;
        // uint num = sof.getNumOrdersByOwner(user1);
        uint num = user1.doGetNumOrdersByOwner(sof);
        Assert.equal(num, expected, "No standing orders should be owned by user1");
        num = user2.doGetNumOrdersByPayee(sof);
        Assert.equal(num, expected, "No standing orders should be paying for user2");

        // now create one order from user1 for user2
        StandingOrder so = user1.doCreateStandingOrder(sof, user2, 100, 10);

        // check after creating one order
        expected = 1;
        num = user1.doGetNumOrdersByOwner(sof);
        Assert.equal(num, expected, "One standing order should be owned by user1");
        num = user2.doGetNumOrdersByPayee(sof);
        Assert.equal(num, expected, "One standing order should be paying for user2");

        // now create one order from user3 for user2
        StandingOrder so2 = user3.doCreateStandingOrder(sof, user2, 100, 10);

        // check after creating one order
        expected = 1;
        num = user1.doGetNumOrdersByOwner(sof);
        Assert.equal(num, expected, "One standing order should be owned by user1");
        num = user3.doGetNumOrdersByOwner(sof);
        Assert.equal(num, expected, "One standing order should be owned by user3");
        num = user2.doGetNumOrdersByPayee(sof);
        expected = 2;
        Assert.equal(num, expected, "Two standing orders should be paying for user2");
    }

    function testStandingOrderAccess() {
        // create multiple standing orders
        StandingOrder so1 = user1.doCreateStandingOrder(sof, user2, 100, 1);
        StandingOrder so2 = user1.doCreateStandingOrder(sof, user2, 100, 2);
        StandingOrder so3 = user3.doCreateStandingOrder(sof, user2, 100, 3);

        // retrieve Owner orders by index and check if they are the right instances
        StandingOrder so1_test = user1.doGetOwnOrderByIndex(sof, 0);
        StandingOrder so2_test = user1.doGetOwnOrderByIndex(sof, 1);
        StandingOrder so3_test = user3.doGetOwnOrderByIndex(sof, 0);
        Assert.equal(so1, so1_test, "First standing order by user1 should be the same");
        Assert.equal(so2, so2_test, "Second standing order by user 1 should be the same");
        Assert.equal(so3, so3_test, "First standing order by user3 should be the same");

        // retrieve payee orders by index and check if they are the right instances
        StandingOrder so1_payee_test = user2.doGetPaidOrderByIndex(sof, 0);
        StandingOrder so2_payee_test = user2.doGetPaidOrderByIndex(sof, 1);
        StandingOrder so3_payee_test = user2.doGetPaidOrderByIndex(sof, 2);
        Assert.equal(so1, so1_payee_test, "First standing order paying user2 should be the same");
        Assert.equal(so2, so2_payee_test, "Second standing order paying user2 should be the same");
        Assert.equal(so3, so3_payee_test, "Third standing order paying user2 should be the same");
    }
}

