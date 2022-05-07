const link = require("./utility").link;

task("deploy", "Deploys a smart contract to the blockchain")
    .addParam("target", "The target of the raffle contract")
    .setAction(async (args) => {
        const Contract = await ethers.getContractFactory("Raffle");
        const contract = await Contract.deploy(parseInt(args.target));
        await contract.deployed();
        console.log("Contract deployed to address: " + link(contract.address));
    });