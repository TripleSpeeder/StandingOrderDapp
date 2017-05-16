pragma solidity ^0.4.4;


import 'zeppelin/ownership/Ownable.sol';
import 'zeppelin/SafeMath.sol';


contract StandingOrder is Ownable, SafeMath {

    address public payee;        // The payee gets the money
    uint public startTime;       // Time when first payment should take place
    uint public paymentInterval; // How often can payee claim paymentAmount
    uint public paymentAmount;   // How much can payee claim per period
    uint public claimedFunds;    // How much funds have been claimed already
    string public ownerLabel;    // Label managed by contract owner
    string public payeeLabel;    // Label managed by payee

    function StandingOrder(address _owner, address _payee, uint _paymentInterval, uint _paymentAmount, uint _startTime, string _label) payable {
        // Sanity check parameters
        if (_paymentInterval < 1)
            throw;
        if (_paymentAmount < 1)
            throw;

        // override default behaviour of Ownable base contract
        // Explicitly set owner to _owner, as msg.sender is the StandingOrderFactory contract
        owner = _owner;

        payee = _payee;
        paymentInterval = _paymentInterval;
        paymentAmount = _paymentAmount;
        ownerLabel = _label;
        payeeLabel = _label;
        startTime = _startTime;
    }

    modifier onlyPayee() {
        if (msg.sender != payee) {
            throw;
        }
        _;
    }

    /* Allow adding funds to existing order */
    function() payable {
        // TODO: Log entry?
    }

    // How much funds should be available for withdraw right now.
    // Note that this might be more than actually available!
    function getEntitledFunds() constant returns (uint) {
        // sanity check
        if (now < startTime) {
            return 0;
        }

        // Calculate theoretical amount that payee should own right now
        uint age = safeSub(now, startTime);
        if (age == 0) {
            // order has just been created
            return 0;
        }

        uint completeIntervals = safeDiv(age, paymentInterval); // implicitly rounding down
        uint totalAmount = safeMul(completeIntervals, paymentAmount);

        // subtract already withdrawn funds
        return safeSub(totalAmount, claimedFunds);
    }

    /* How much funds are owned by Payee but not yet withdrawn */
    function getUnclaimedFunds() constant returns (uint) {
        /* entitledAmount might be more than available balance. In this case
         * available balance is the limit */
        return min256(this.getEntitledFunds(), this.balance);
    }

    /* How much funds are still owned by owner (not yet reserved for payee)
     This can be negative in cases when contract was not funded enough!
    */
    function getOwnerFunds() constant returns (int) {
        return int256(this.balance) - int256(getEntitledFunds());
    }

    /* Collect payment */
    function collectFunds() {
        // only payee can collect funds
        if (msg.sender != payee) {
            throw;
        }

        uint amount = getUnclaimedFunds();

        if (amount <= 0) {
            // nothing to collect :-(
            throw;
        }

        // keep track of collected funds
        claimedFunds = safeAdd(claimedFunds, amount);

        if (payee.send(amount) == false)
            throw;
    }

    /* Returns remaining funds to owner. 
     * Note that this does not return unclaimed funds - They 
     * can only be claimed by payee!
     * The Standingorder is not yet cancelled, at any time owner can 
     * fund it again!
     */
    function WithdrawOwnerFunds() onlyOwner {
        int ownerFunds = getOwnerFunds();
        if (ownerFunds <= 0)
            throw;
        // conversion int -> uint should be safe as I'm checking <= 0 above!
        if (owner.send(uint256(ownerFunds)) == false)
            throw;
    }

    /* Completely cancel this standingOrder */
    function Cancel() onlyOwner {
        // only possible when no funds are left in the contract
        if (this.balance > 0) {
            throw;
        }

        selfdestruct(owner);
    }

    function SetOwnerLabel(string _label) onlyOwner {
        ownerLabel = _label;
    }

    function SetPayeeLabel(string _label) onlyPayee {
        payeeLabel = _label;
    }
}


contract StandingOrderFactory {

    // keep track who issued standing orders
    mapping (address => StandingOrder[]) public standingOrdersByOwner;
    // keep track of payees of standing orders
    mapping (address => StandingOrder[]) public standingOrdersByPayee;

    // Events
    event LogOrderCreated(
        address orderAddress,
        address indexed owner,
        address indexed payee
    );

    // Create a new standing order.
    function createStandingOrder(address payee, uint rate, uint interval, uint startTime, string label) returns (StandingOrder) {
        StandingOrder so = new StandingOrder(msg.sender, payee, interval, rate, startTime, label);
        standingOrdersByOwner[msg.sender].push(so);
        standingOrdersByPayee[payee].push(so);
        LogOrderCreated(so, msg.sender, payee);
        return so;
    }

    function getNumOrdersByOwner() constant returns (uint) {
        return standingOrdersByOwner[msg.sender].length;
    }

    function getOwnOrderByIndex(uint index) constant returns (StandingOrder) {
        return standingOrdersByOwner[msg.sender][index];
    }

    function getNumOrdersByPayee() constant returns (uint) {
        return standingOrdersByPayee[msg.sender].length;
    }

    function getPaidOrderByIndex(uint index) constant returns (StandingOrder) {
        return standingOrdersByPayee[msg.sender][index];
    }
}
