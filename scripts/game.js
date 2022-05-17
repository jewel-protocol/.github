const config = require("hardhat/config");
const linkAddress = require("../utility/log").linkAddress;
const linkTransaction = require("../utility/log").linkTransaction;
const captureLog = require("../utility/log").captureLog;

config.task("game", "Tasks related to the Jewel Game class of token smart contracts")
    .addPositionalParam("subtask", "The subtask to execute")
    .addOptionalParam("name", "The name of the Jewel Game smart contract")
    .addOptionalParam("jewel", "The address of the Jewel Token contract")
    .setAction(async (args) => {
        const subtask = args.subtask;
        await run(`game-${subtask}`, args);
    });

config.task("game-deploy", "Deploy a Jewel Game smart contract to the blockchain")
    .addParam("name", "The name of the Jewel Game smart contract")
    .addParam("jewel", "The address of the Jewel Token contract")
    .setAction(async (args) => {
        const params = [
            args.jewel
        ];
        const factory = await hre.ethers.getContractFactory(args.name);
        const contract = await factory.deploy(...params);
        console.log(`${args.name} contract deployed to ${linkAddress(contract.address)} in ${linkTransaction(contract.deployTransaction.hash)}`);
    });

config.task("game-verify", "Verify a Jewel Game smart contract on Etherscan")
    .addParam("name", "The name of the Jewel Game smart contract")
    .addParam("jewel", "The address of the Jewel Token contract")
    .addParam("address", "The address of the Jewel Game contract")
    .setAction(async (args) => {
        const params = [
            args.jewel
        ];
        const artifact = await hre.artifacts.readArtifact(args.name);
        const verifyParams = {
            contract: `${artifact.sourceName}:${artifact.contractName}`,
            address: args.address,
            constructorArgsParams: params
        };
        const log = captureLog();
        await hre.run("verify", verifyParams);
        log.unhook();
        console.log(`Successfully verified ${linkAddress(contract.address, args.name)} on Etherscan`);
    });