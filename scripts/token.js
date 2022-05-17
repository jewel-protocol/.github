const config = require("hardhat/config");
const linkAddress = require("../utility/log").linkAddress;
const linkTransaction = require("../utility/log").linkTransaction;
const linkToken = require("../utility/log").linkToken;
const constants = require("../utility/constants");
const captureLog = require("../utility/log").captureLog;
const format = require("../utility/log").formatAmount;

config.task("token", "Tasks related to the Jewel Token smart contract")
    .addPositionalParam("subtask", "The subtask to execute")
    .addOptionalParam("address", "The address of the Jewel Token contract")
    .addOptionalParam("contract", "The address of the contract to approve or revoke access")
    .addOptionalParam("amount", "The amount of Jewel token to use for this transaction")
    .setAction(async (args) => {
        const subtask = args.subtask;
        await run(`token-${subtask}`, args);
    });

config.task("token-deploy", "Deploy the Jewel Token smart contract to the blockchain")
    .setAction(async () => {
        const config = constants[hre.network.name];
        const params = [ 
            config.linkToken,
            config.linkCoordinator,
            config.linkKeyHash,
            config.wethAddress,
            config.swapRouterAddress
        ];
        const factory = await hre.ethers.getContractFactory("JewelToken");
        const contract = await factory.deploy(...params);
        console.log(`Jewel contract deployed to ${linkToken(contract.address)} in ${linkTransaction(contract.deployTransaction.hash)}`);
    });

config.task("token-verify", "Verify the Jewel Token smart contract on Etherscan")
    .addParam("address", "The address of the Jewel token contract")
    .setAction(async (args) => {
        const config = constants[hre.network.name];
        const params = [ 
            config.linkToken,
            config.linkCoordinator,
            config.linkKeyHash,
            config.wethAddress,
            config.swapRouterAddress
        ];
        const artifact = await hre.artifacts.readArtifact("JewelToken");
        const verifyParams = {
            contract: `${artifact.sourceName}:${artifact.contractName}`,
            address: args.address,
            constructorArgsParams: params
        };
        const log = captureLog();
        await hre.run("verify", verifyParams);
        log.unhook();
        console.log(`Successfully verified ${linkToken(contract.address, "JewelToken")} on Etherscan`);
    });

config.task("token-approve", "Add an address to the whitelist in a Jewel smart contract")
    .addParam("address", "The address of the Jewel token contract")
    .addParam("contract", "The address of the contract to approve access")
    .setAction(async (args) => {
        const signer = await hre.ethers.getSigner(0);
        const artifact = await hre.artifacts.readArtifact("JewelToken");
        const contract = new hre.ethers.Contract(args.address, artifact.abi, signer);
        const tx = await contract.addToWhitelist(args.contract);
        console.log(`Approved access to ${linkAddress(args.approve)} for ${linkToken(args.address, "JewelToken")} in ${linkTransaction(tx.hash)}`);
    });

config.task("token-revoke", "Remove an address from the whitelist in a Jewel smart contract")
    .addParam("address", "The address of the Jewel token contract")
    .addParam("contract", "The address of the contract to revoke access")
    .setAction(async (args) => {
        const signer = await hre.ethers.getSigner(0);
        const artifact = await hre.artifacts.readArtifact("JewelToken");
        const contract = new hre.ethers.Contract(args.address, artifact.abi, signer);
        const tx = contract.removeFromWhitelist(args.contract);
        console.log(`Revoked access to ${linkAddress(args.contract)} for ${linkToken(args.address, "JewelToken")} in ${linkTransaction(tx.hash)}`);
    });

config.task("token-mint", "Mint an initial supply of the Jewel Token")
    .addParam("address", "The address of the Jewel token contract")
    .addOptionalParam("amount", "The amount of Jewel token to mint")
    .setAction(async (args) => {
        const signer = await hre.ethers.getSigner(0);
        const ephemeral = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
        const amount = isNaN(args.amount) ? hre.ethers.BigNumber.from(10).pow(18) : hre.ethers.BigNumber.from(args.amount);
        const artifact = await hre.artifacts.readArtifact("JewelToken");
        const contract = new hre.ethers.Contract(args.address, artifact.abi, signer);

        const gasFee = async () => {
            const basePrice = await hre.ethers.provider.getGasPrice();
            const gasPrice = basePrice.add(2000000000);
            const gasLimit1 = await ephemeral.estimateGas({ to: args.address, value: amount });
            const gasLimit2 = await contract.connect(ephemeral).estimateGas.transfer(signer.address, amount);
            return gasLimit1.add(gasLimit2).mul(gasPrice).mul(1100).div(1000);
        };

        const gas1 = await gasFee();
        const amount1 = amount.add(gas1);
        const tx1 = await signer.sendTransaction({ to: ephemeral.address, value: amount1 });
        await tx1.wait();
        const gas2 = await gasFee();
        const amount2 = amount1.sub(gas2);
        const tx2 = await ephemeral.sendTransaction({ to: args.address, value: amount2 });
        await tx2.wait();
        await contract.connect(ephemeral).transfer(signer.address, amount);
        await contract.payout(signer.address, amount);

        const formattedJWL = format(amount, "JWL", args.address, 18, 2);
        const formattedETH = format(amount1.sub(amount), "ETH", null, 18, 2);
        console.log(`Minted ${formattedJWL} to ${linkAddress(signer.address)} through ${linkAddress(ephemeral.address)} for ${formattedETH}`);
    });