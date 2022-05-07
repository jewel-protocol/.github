require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
const fs = require("fs");
const { Wallet } = require("ethers");
const { MAINNET_URL, RINKEBY_URL, MNEMONIC, ETHER_KEY } = process.env;
const wallet = MNEMONIC == null ? Wallet.createRandom() : Wallet.fromMnemonic(MNEMONIC);

fs.readdirSync("./scripts")
    .filter(x => x.endsWith(".js"))
    .map(x => "./scripts/" + x)
    .forEach(require);

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
