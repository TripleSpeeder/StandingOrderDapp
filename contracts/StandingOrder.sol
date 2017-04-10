pragma solidity ^0.4.4;

import 'zeppelin/ownership/Ownable.sol';

contract StandingOrder is Ownable{

    address public payee;
    uint public startTime;
    uint public paymentInterval;
    uint public paymentAmount;
    uint public claimedFunds;  // How much funds have been claimed already
    
    function StandingOrder(address _payee, uint _paymentInterval, uint _paymentAmount) payable {
        payee = _payee;
        paymentInterval = _paymentInterval;
        paymentAmount = _paymentAmount;
        startTime = now;
    }

    /* Allow adding funds to existing order */
    function () payable {
        // TODO: Log entry
    }
    
    /* How much funds are owned by Payee but not yet withdrawn */
    function getUnclaimedFunds() constant returns(uint) {
        // sanity check
        if (now < startTime) {
            // bad miner trying to mess with block time?
            throw;
        }
        
        // Calculate theoretical amount that payee should own right now
        uint age = now - startTime;
        if (age == 0) {
            // order has just been created
            return 0;
        }

        uint completeIntervals = age/paymentInterval; // implicitly rounding down
        uint totalAmount = completeIntervals * paymentAmount;
        
        // subtract already withdrawn funds
        uint entitledAmount = totalAmount - claimedFunds;
        
        /* entitledAmount might be more than available balance. In this case 
         * available balance is the limit */
        uint availableAmount = min(entitledAmount, this.balance);
        
        return availableAmount;
    }
    
    /* How much funds are still owned by owner (not yet reserved for payee) */
    function getOwnerFunds() constant returns(uint) {
        return this.balance - getUnclaimedFunds();
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
        
        claimedFunds += amount;
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
        uint ownerFunds = getOwnerFunds();
        if (ownerFunds <= 0)
            throw;
        
        if (owner.send(ownerFunds)==false)
            throw;
        // TODO: Log event
    }
    
    /* Completely cancel this standingOrder */
    function Cancel() onlyOwner {

        // only possible when no funds are left in the contract
        if (this.balance > 0) {
            throw;
        }
        
        selfdestruct(owner);
    }
    
    function min(uint a, uint b) returns (uint) {
        if (a < b) return a;
            else return b;
    }
}

contract StandingOrderFactory {

    // keep track who issued standing orders
    mapping (address => StandingOrder[]) public standingOrdersByOwner;
    // keep track of payees of standing orders
    mapping (address => StandingOrder[]) public standingOrdersByPayee;

    // Events
    event LogOrderCreated(address orderAdress, address payee);

    // Create a new standing order. Allow to fund contract while creating, therefor "payable"
    function createStandingOrder(address payee, uint rate, uint interval) returns (StandingOrder) {
        // StandingOrder so = (new StandingOrder).value(msg.value)(msg.sender, payee, interval, rate);
        StandingOrder so = new StandingOrder(payee, interval, rate);
        // Now the factory is the owner. Give ownershop to real owner.
        so.transferOwnership(msg.sender);
        standingOrdersByOwner[msg.sender].push(so);
        standingOrdersByPayee[payee].push(so);
        LogOrderCreated(so, payee);
        return so;
    }

    function getNumOrdersByOwner() constant returns(uint) {
        return standingOrdersByOwner[msg.sender].length;
    }

    function getOwnOrderByIndex(uint index) constant returns(StandingOrder) {
        return standingOrdersByOwner[msg.sender][index];
    }

    function getNumOrdersByPayee() constant returns(uint) {
        return standingOrdersByPayee[msg.sender].length;
    }

    function getPaidOrderByIndex(uint index) constant returns(StandingOrder) {
        return standingOrdersByPayee[msg.sender][index];
    }
}
