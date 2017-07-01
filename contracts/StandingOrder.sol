pragma solidity ^0.4.11;


import 'zeppelin/ownership/Ownable.sol';
import 'zeppelin/SafeMath.sol';


contract StandingOrder is Ownable, SafeMath {

    /*

    Lifecycle of a standing order:
    - the payment amount per interval is set at construction time and can not be changed afterwards
    - the payee is set by the owner and can not be changed after creation (TODO: Decide if payee should be able to change receiving address?)
    - the owner can be changed by owner (using "ownable" base contract) (TODO: Change to "claimable" base contract for extra security!)
    - at <startTime> the first payment is due
    - every <intervall> seconds the next payment is due
    - the owner can terminate a standingorder anytime. Termination results in:
      - All superfluous funds being returned to owner
      - No further funding being allowed
      - order marked as "terminated" and not being displayed anymore in owner UI
      - as long as there are uncollected funds entitled to the payee, it is still displayed in payee UI
      - the payee can still collect funds owned to him
    - Contract self-destructs if
      - it is terminated
      - no more funds are available to collect for payee

    * Terminology *
    "withdraw" -> performed by owner - transfer funds stored in contract back to owner
    "collect"  -> performed by payee - transfer entitled funds from contract to payee

    * How does a payment work? *
    Since a contract can not trigger a payment by itself, it provides the method "collectFunds" for the payee.
    The payee can always query the contract to determine how many funds he is entitled to collect.
    The payee can call "collectFunds" to initiate transfer of entitled funds to his address.

    */

    address public payee;        // The payee is the receiver of funds
    uint public startTime;       // Date and time (unix timestamp - seconds since 1970) when first payment should take place
    uint public paymentInterval; // Interval (seconds) for payments
    uint public paymentAmount;   // How much can payee claim per period (Unit: Wei)
    uint public claimedFunds;    // How much funds have been claimed already (Unit: Wei)
    string public ownerLabel;    // Label (set by contract owner)
    bool public isTerminated;    // Marks order as terminated

    // Restrict functions to payee
    modifier onlyPayee() {
        require(msg.sender == payee);
        _;
    }

    function StandingOrder(
                            address _owner,
                            address _payee,
                            uint _paymentInterval,
                            uint _paymentAmount,
                            uint _startTime,
                            string _label)
                                            payable {
        // Sanity check parameters
        require(_paymentInterval > 0);
        require(_paymentAmount > 0);

        // override default behaviour of Ownable base contract
        // Explicitly set owner to _owner, as msg.sender is the StandingOrderFactory contract
        owner = _owner;

        payee = _payee;
        paymentInterval = _paymentInterval;
        paymentAmount = _paymentAmount;
        ownerLabel = _label;
        startTime = _startTime;
        isTerminated = false;
    }

    /* Allow adding funds to existing order */
    function() payable {
        // TODO: Dont make contract as a whole payable. Instead create a dedicated "addFunds" method to prevent any accidental payment!
        if (isTerminated) {
            // adding funds not allowed for terminated orders
            throw; // TODO: revert() to not unnecessarily burn gas?
        }
    }

    // How much funds should be available for withdraw right now.
    // Note that this might be more than actually available!
    function getEntitledFunds() constant returns (uint) {
        // First check if the contract startTime has been reached at all
        if (now < startTime) {
            // startTime not yet reached
            return 0;
        }

        // startTime has been reached, so add first payment
        uint entitledAmount = paymentAmount;

        // calculate number of complete intervals since startTime
        uint age = safeSub(now, startTime);
        uint completeIntervals = safeDiv(age, paymentInterval); // implicitly rounding down
        // add interval * paymentAmount to entitledAmount
        entitledAmount = safeAdd(entitledAmount, safeMul(completeIntervals, paymentAmount));

        // subtract already collected funds
        return safeSub(entitledAmount, claimedFunds);
    }

    /* How much funds are available for payee to collect. */
    function getUnclaimedFunds() constant returns (uint) {
        /* entitledAmount might be more than available balance. In this case
         * available balance is the limit */
        return min256(getEntitledFunds(), this.balance);
    }

    /* How much funds are still owned by owner (not yet reserved for payee)
       This can be negative in case contract is not funded enough to cover entitled amount of payee! */
    function getOwnerFunds() constant returns (int) {
        return int256(this.balance) - int256(getEntitledFunds());
    }

    /* Collect payment */
    function collectFunds() onlyPayee {
        uint amount = getUnclaimedFunds();
        if (amount <= 0) {
            // nothing to collect :-(
            throw; // TODO: revert() to not unnecessarily burn gas?
        }

        // keep track of collected funds
        claimedFunds = safeAdd(claimedFunds, amount);

        // initiate transfer of unclaimed funds to payee
        payee.transfer(amount);

        // if this order is terminated and no more funds available to collect in future, it can now be destroyed
        if (isTerminated && this.balance == 0) {
            selfdestruct(owner);
        }
    }

    /* Returns requested amount to owner.
     * Note that this does can not return unclaimed funds - They
     * can only be claimed by payee!
     * Withdrawing funds does not terminate the order, at any time owner can
     * fund it again!
     */
    function WithdrawOwnerFunds(uint amount) onlyOwner {
        int intOwnerFunds = getOwnerFunds(); // this might be negative in case of underfunded contract!

        if (intOwnerFunds <= 0) {
            // nothing available to withdraw :-(
            throw; // TODO: revert() to not unnecessarily burn gas?
        }

        // conversion int -> uint is safe here as I'm checking <= 0 above!
        uint256 ownerFunds = uint256(intOwnerFunds);

        if (amount > ownerFunds) {
            // Trying to withdraw more than available!
            throw; // Alternatively could just withdraw all available funds...
        }

        owner.transfer(amount);
    }

    /* Terminate standingOrder:
       - Can only be executed if no ownerfunds are left
       - marks order as terminated
       - if no unclaimed funds remaining -> selfdestructs contract
    */
    function Terminate() onlyOwner {
        require(getOwnerFunds() == 0);

        isTerminated = true;

        if (this.balance == 0) {
            // All remaining owner balance is withdrawn and payee has collected all available funds. Safe to selfdestruct!
            selfdestruct(owner);
        }
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
