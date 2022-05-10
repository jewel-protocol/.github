const config = require("hardhat/config");
const linkAddress = require("../utility/log").linkAddress;
const linkTransaction = require("../utility/log").linkTransaction;
const constants = require("../utility/constants");

config.task("deploy", "Deploy a smart contract to the blockchain")
    .addParam("contract", "The name of the contract to deploy")
    .setAction(async (args) => {
        let params = [ ];
        if (args.contract === "Jewel") {
            const config = constants[hre.network.name];
            params.push(config.linkToken);
            params.push(config.linkCoordinator);
            params.push(config.linkKeyHash);
            params.push(config.wethAddress);
            params.push(config.swapRouterAddress);
        }
        const factory = await hre.ethers.getContractFactory(args.contract);
        const contract = await factory.deploy(...params);
        console.log(`Contract deployed to ${linkAddress(contract.address)} in ${linkTransaction(contract.deployTransaction.hash)}`);
    });