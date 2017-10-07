# Deployed contract addresses:
* Ropsten: 0x70a10e7acab0811aeb34d4a7d25d6e014f88d8d4

# TODO
* __Use enums instead of random strings for managing state of react components__
    
    Applicable for OutgoingFundsButtonContainer, NewOrderButton, ...

* __Think about changing underlying contract to not use factory and individual contracts per order__

    Instead store everything in the StandingOrder contract. Pros/Cons for current approach:
    
    Pro: 
    + more privacy, because payee only gets to see "his" incoming orders. -> Not really an argument,
    as everything is public anyway. Security by obscurity does not work!
    * Allows to update the StandingOrderContract without changing the factory itself. (Not sure about this)
    
    Con:
    + Changing ownership/"payeeship" does not work, as infos in factory contract are not updated. Would require 
    standingorder contract to actively call into factory to update ownerships, which does not sound like a clean architecture.
    