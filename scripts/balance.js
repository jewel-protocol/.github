const config = require("hardhat/config");
const link = require("../utility/log").linkAddress;
const format = require("../utility/log").formatAmount;
const ERC20Abi = require("@openzeppelin/contracts/build/contracts/ERC20.json").abi;

config.task("balance", "Prints an account's balance")
    .addOptionalParam("address", "The wallet's address to look up the balance for")
    .addOptionalParam("token", "The token's address to look up the balance for")
    .addOptionalParam("precision", "The precision for printing the balance")
    .setAction(async (args) => {
        const signer = await hre.ethers.getSigner(0);
        const account = args.address == null ? signer.address : args.address;
        const precision = isNaN(args.precision) ? 2 : parseInt(args.precision);
        let symbol = "ETH";
        let decimals = 18;
        let balance = hre.ethers.BigNumber.from(0);
        if (args.token == null) {
            balance = await hre.ethers.provider.getBalance(account);            
        } else {
            const contract = new hre.ethers.Contract(args.token, ERC20Abi, signer);
            balance = await contract.balanceOf(account);
            symbol = await contract.symbol();
            decimals = await contract.decimals();
        }

        const formattedAmount = format(balance, symbol, args.token, decimals, precision);
        console.log("Account " + link(account.toLowerCase()) + " has " + formattedAmount);
    });