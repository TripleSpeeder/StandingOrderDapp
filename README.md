# Recurring payments/standing orders with Ethereum
## Website
The UI is live at [http://stors.dappstar.io](http://stors.dappstar.io). Note that the contracts
are currently only deployed on the Ropsten test network.  
## Problem
As a smart contract can not do anything by itself there is no straightforward way to 
have automatic recurring payments. You always need an external call (transaction) to trigger
a payment.
## Solution approach
Create a contract that acts as a proxy between payer and receiver. The payer creates the contract
and specifies receiver, payment interval and amount. The payer funds the contract, the receiver
can collect funds from the contract according to the parameters set by the payer.

The contract takes care that
- Receiver can not collect more funds than he is entitled to
- Funds that are due, but not yet collected, are kept in the contract until the receiver collects them
- Payer can withdraw any surplus funds that are not yet entitled to the receiver back to his account
- Payer can NOT withdraw funds that are already entitled to the receiver, even if the receiver
  did not collect them yet
  
### Example
Let's say I have rented a Lambo that costs 1 Ether every week. I set up a standing order with the 
following parameters:
- Label: "Lambo rent for customer ID 12345"
- Receiver: _Payment address of the rental company_
- Payment amount: 1 Ether
- Payment period: 1 week
- First payment: Date when the rent contract started (let's say 3 days ago)

When the order is created it will appear on [http://stors.dappstar.io](http://stors.dappstar.io)
as outgoing order. Also the renting company will see the order on stors.dappstar.io as incoming 
order. Initially the standing order will not have any funds in it, so the renting company will not be able to collect
anything. The UI will reflect that the order is underfunded, as the first payment
was due already 3 days ago! Let's fix this by opening the "Add funds" dialog.

#### Adding funds to a standing order
The "Add funds" screen displays on the left side the current contract information. Current funding state
will read something like "Contract is missing 1 eth!". On the right side I can specify how much ETH to
add; the UI will calculate how many payments will be covered based on the entered amount, or how much 
ETH are necessary based on the entered number of payments.

I want to fund the contract to cover 2 months, so I choose to fund 8 ETH. Once I'm satisfied with the parameters I click
on "Add funds" to initiate the transaction. The funds will now be transferred from my account to the contract.

#### Collecting funds from a standing order
If the rental company now checks [http://stors.dappstar.io](http://stors.dappstar.io), it will see the incoming order listed with 1 ether available
to collect. It can click on the "collect funds" button, and 1 ether will be transferred from the contract to 
the rental company's wallet. Note that only 1 ether is available to collect, although I have put 8 ETH to the
contract. Only after another payment period is passed there will be one more ether available to collect for the
rental company.

# Implementation details
The solidity part of the dapp consists of a factory contract and the actual standing order contracts. When creating a new
standing order you interact with the contract factory, which will deploy a new standing order.
Checkout [StandingOrder.sol](contracts/StandingOrder.sol) which contains all solidity code and more detailed
documentation.

## Deployed contract addresses
At the moment the stors dapp is only available on Ropsten test network. 
* Factory contract on Ropsten: [0x70a10e7acab0811aeb34d4a7d25d6e014f88d8d4](https://ropsten.etherscan.io/address/0x70a10e7acab0811aeb34d4a7d25d6e014f88d8d4)

# License
This code is licensed under the [MIT License](LICENSE.txt).