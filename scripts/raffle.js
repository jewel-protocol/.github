const config = require("hardhat/config");
const linkAddress = require("../utility/log").linkAddress;
const linkTransaction = require("../utility/log").linkTransaction;
const format = require("../utility/log").formatAmount;
const mainnet = require("../utility/constants").mainnet;
const rinkeby = require("../utility/constants").rinkeby;
const ERC20Abi = require("@openzeppelin/contracts/build/contracts/ERC20.json").abi;

config.task("raffle", "Tasks related to the Raffle smart Contract")
    .addPositionalParam("subtask", "The subcommand to execute")
    .setAction(async (args) => { //TODO: does not take a dict
        const subtask = args.subtask;
        await run("raffle-" + subtask, args);
    });

config.subtask("raffle-deploy", "Deploys a Raffle smart contract to the blockchain")
    .addOptionalParam("target", "The target of the Raffle contract")
    .setAction(async (args) => {
        const target = isNaN(args.target) ? hre.ethers.BigNumber.from(10).pow(18) : hre.ethers.BigNumber.from(args.target);
        const constants = hre.network.name == "mainnet" ? mainnet : rinkeby;
        const factory = await hre.ethers.getContractFactory("Raffle");
        const raffle = await factory.deploy(target, constants.linkToken, constants.linkCoordinator, constants.linkKeyHash);
        await raffle.deployed();
        console.log("Contract deployed to address: " + linkAddress(raffle.address) + " in " + linkTransaction(raffle.deployTransaction.hash));
    });

config.subtask("raffle-fund", "Funds a Raffle smart contract with LINK")
    .addParam("address", "The address of the contract to fund with LINK")
    .addOptionalParam("amount", "The amount of LINK to fund into the contract")
    .setAction(async (args) => {
        const owner = await hre.ethers.getSigner(0);
        const amount = isNaN(args.amount) ? hre.ethers.BigNumber.from(10).pow(18) : hre.ethers.BigNumber.from(args.amount);
        const RaffleAbi = hre.artifacts.readArtifact("Raffle");
        const raffle = new hre.ethers.Contract(args.address, RaffleAbi, owner);

        const constants = hre.network.name == "mainnet" ? mainnet : rinkeby;
        const link = new hre.ethers.Contract(constants.linkToken, ERC20Abi, owner);
        const approveTx = await link.approve(raffle.address, amount);
        const topUpTx = await raffle.topUPSubscription(amount);

        const formattedAmount = format(amount, "LINK", constants.linkToken, 18, 2);
        console.log("Contract " + linkAddress(raffle.address) + " funded with " + formattedAmount + " in "  + linkTransaction(approveTx.hash) + " and " + linkTransaction(topUpTx.hash));
    });