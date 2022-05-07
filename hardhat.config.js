require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
const { Wallet } = require("ethers");
const { MAINNET_URL, RINKEBY_URL, MNEMONIC, ETHER_KEY } = process.env;
const wallet = MNEMONIC == null ? Wallet.createRandom() : Wallet.fromMnemonic(MNEMONIC);

const link = (text) => {
    const etherscan = network.name == "rinkeby" ? "https://rinkeby.etherscan.io/address/" : "https://etherscan.io/address/";
    return "\u001b]8;;" + etherscan + text.toString() + "\u0007" + text.toString() + "\u001b]8;;\u0007";
};

task("balance", "Prints an account's balance")
    .addOptionalParam("address", "The wallet's address to look up the balance for")
    .setAction(async(args) => {
        const account = args.address == null ? wallet.address : args.address;
        const wei = await ethers.provider.getBalance(account);
        const eth = ethers.utils.formatEther(wei);
        const balance = Math.round(eth * 1000) / 1000;
        console.log("Account " + link(account.toLowerCase()) + " has " + balance + " ETH");
    });

task("deploy", "Deploys a smart contract to the blockchain")
    .addParam("target", "The target of the raffle contract")
    .setAction(async(args) => {
        const Contract = await ethers.getContractFactory("Raffle");
        const contract = await Contract.deploy(parseInt(args.target));
        await contract.deployed();
        console.log("Contract deployed to address: " + link(contract.address));
    });

module.exports = {
    solidity: {
        version: "0.8.4",
        settings: {
            optimizer: {
                enabled: true,
                runs: 2000,
            },
        },
    },
    defaultNetwork: "rinkeby",
    networks: {
        hardhat: {
            forking: {
                url: RINKEBY_URL == null ? "" : RINKEBY_URL,
            }
        },
        mainnet: {
            url: MAINNET_URL == null ? "" : MAINNET_URL,
            accounts: [ wallet.privateKey ]
        },
        rinkeby: {
            url: RINKEBY_URL == null ? "" : RINKEBY_URL,
            accounts: [ wallet.privateKey ]
        },
    },
    etherscan: {
        apiKey: ETHER_KEY == null ? "" : ETHER_KEY
    }
};
