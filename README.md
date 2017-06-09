# Truffle Box (React)

This box comes with everything you need to start using smart contracts from a react app. This is as barebones as it gets, so nothing stands in your way.

## Installation

1. Install truffle and an ethereum client. For local development, try EthereumJS TestRPC.
    ```javascript
    npm install -g truffle // Version 3.0.5+ required.
    npm install -g ethereumjs-testrpc
    ```

2. Clone or download the truffle box of your choice.
    ```javascript
    git clone [repo]
    ```

3. Install the node dependencies.
    ```javascript
    npm install
    ```

4. Compile and migrate the contracts.
    ```javascript
    truffle compile
    truffle migrate
    ```

5. Run the webpack server for front-end hot reloading. For now, smart contract changes must be manually recompiled and migrated.
    ```javascript
    npm run start
    ```

6. Jest is included for testing React components and Truffle's own suite is incldued for smart contracts. Be sure you've compile your contracts before running jest, or you'll receive some file not found errors.
    ```javascript
    // Runs Jest for component tests.
    npm run test

    // Runs Truffle's test suite for smart contract tests.
    truffle test
    ```

7. To build the application for production, use the build command. A production build will be in the build_webpack folder.
    ```javascript
    npm run build
    ```

## FAQ

* __Why is there both a truffle.js file and a truffle-config.js file?__

    Truffle requires the truffle.js file be named truffle-config on Windows machines. Feel free to delete the file that doesn't correspond to your platform.

* __Where is my production build?__

    The production build will be in the build_webpack folder. This is because Truffle outputs contract compilations to the build folder.

* __Where can I find more documentation?__

    All truffle boxes are a marriage of [Truffle](http://truffleframework.com/) and a React setup created with [create-react-app](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md). Either one would be a great place to start!


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
    