# Jewel Protocol

Jewel Protocol is a collection of smart contracts revolving around RNG games. The smart contracts can be grouped into two categories.
* The **Jewel Token** is an ERC20 token backend by ETH which provides ETH yield to holders.
* **Jewel Games** are RNG games where players can engage in high-risk-high-reward ETH staking. 

Holders of the Jewel Token will earn ETH yield as players play the Jewel Games. The Jewel Games hold no ETH of their own and use the liquidity provided by the Jewel Token to perform payouts to Jewel Game players. Jewel Games always slightly favor the house which is the foundation of providing ETH yield to Jewel Token holders. With this setup, new Jewel Games can be deployed, approved (and revoked) at any time.

## Frontend

The frontend is a static web app made with [React](https://reactjs.org) deployed to [GitHub pages](https://pages.github.com). You can run the following npm tasks:
* `npm run build` to compile the app into a static site.
* `npm run clean` to clean the react (./build) build folder.
* `npm run start` to compile and serve the app locally.
* `npm run deploy` to compile the app and deploy to GitHub pages.

## Smart Contracts

The smart contracts are built in [Solidity](https://docs.soliditylang.org/en/v0.8.13/) and can be deployed using [Hardhat](https://hardhat.org). The following hardhat tasks exist:
* `npx hardhat compile` to compile the Solidity smart contracts.
* `npx hardhat clean` to clean the hardhat (./artifacts) build folder.
* `npx hardhat balance` to get the ETH or ERC20 balance of an address.
* `npx hardhat token [subtask]` for tasks related to the Jewel Token contract.
* `npx hardhat game [subtask]` for tasks related to the Jewel Game class of contracts.

For example you can deploy the Jewel smart contract with a game called DoubleOrNothing:
```
npx hardhat token deploy
npx hardhat game deploy --name DoubleOrNothing --jewel 0x12...
npx hardhat token approve --address 0x12... --contract 0x34... 
```

## Development

A few development commands:
* `npm run lint` to run [ESLint](https://eslint.org) linter in fix mode.
* `npm run test` to run all the [Mocha](https://mochajs.org) tests.

*This repository is not open source! Copyright (c) 2022 jewel.cash*