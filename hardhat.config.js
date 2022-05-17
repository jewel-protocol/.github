require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

let privateKey = "";
if (process.env.MNEMONIC == null) {
    privateKey = require("ethers").Wallet.createRandom().privateKey;
} else {
    privateKey = require("ethers").Wallet.fromMnemonic(process.env.MNEMONIC).privateKey;
}

require("fs").readdirSync("./scripts")
    .filter(x => x.endsWith(".js"))
    .map(x => `./scripts/${x}`)
    .forEach(require);

module.exports = {
    solidity: {
        version: "0.8.9",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000000,
            },
        },
    },
    networks: {
        hardhat: {
            forking: {
                url: process.env.RINKEBY_URL == null ? "" : process.env.RINKEBY_URL,
                blockNumber: 10639840
            }
        },
        mainnet: {
            url: process.env.MAINNET_URL == null ? "" : process.env.MAINNET_URL,
            accounts: [ privateKey ]
        },
        rinkeby: {
            url: process.env.RINKEBY_URL == null ? "" : process.env.RINKEBY_URL,
            accounts: [ privateKey ]
        },
        kovan: {
            url: process.env.KOVAN_URL == null ? "" : process.env.KOVAN_URL,
            accounts: [ privateKey ]
        },
        robsten: {
            url: process.env.ROBSTEN_URL == null ? "" : process.env.ROBSTEN_URL,
            accounts: [ privateKey ]
        },
        goerli: {
            url: process.env.GOERLI_URL == null ? "" : process.env.GOERLI_URL,
            accounts: [ privateKey ]
        }
    },
    etherscan: {
        apiKey: process.env.ETHER_KEY == null ? "" : process.env.ETHER_KEY
    }
};
