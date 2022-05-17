const config = require("hardhat/config");
const link = require("../utility/log").linkBlock;
const format = require("../utility/log").formatAmount;

config.task("gas", "Get the gas price for a specific block")
    .setAction(async () => {
        const block = await hre.ethers.provider.getBlockNumber();
        const gasPrice = await hre.ethers.provider.getGasPrice();

        const formattedAmount = format(gasPrice, "GWEI", null, 9, 0);
        console.log(`The gas price on block ${link(block)} is ${formattedAmount}`);
    });