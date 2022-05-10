# Jewel Protocol

Jewel Protocol is a collection of smart contracts.

## Frontend

The frontend is a static web app made with [React](https://reactjs.org) deployed to [GitHub pages](https://pages.github.com). You can run the following npm tasks:
* `npm run start` to run the app locally.
* `npm run deploy` to deploy the app to GitHub pages.

## Contract

The smart contracts are built in [Solidity](https://docs.soliditylang.org/en/v0.8.13/) and can be deployed using [Hardhat](https://hardhat.org). The following hardhat tasks exist:
* `npx hardhat balance` to get the ETH or ERC20 balance of an address.
* `npx hardhat deploy` to deploy a smart contract to the blockchain.
* `npx hardhat verify` to verify a smart contract on [Etherscan](https://etherscan.io).

## Development

A few development commands:
* `npm run lint` to run [ESLint](https://eslint.org).
* `npm run test` to run the [Mocha](https://mochajs.org) tests.

*This repository is not open source! Copyright (c) 2022 jewel.cash*