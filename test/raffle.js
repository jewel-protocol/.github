const assert = require("assert");
const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const rinkeby = require("../scripts/utility").rinkeby;

describe("Raffle", () => {
    const BigNum = ethers.BigNumber.from(10).pow(18);
    let Raffle;
    let Link;
    let Owner;
    let NonOwner;

    beforeEach(async () => {
        if (network.name != "hardhat") { throw Error("Should only run tests on local hardhat network."); }
        const contract = await ethers.getContractFactory("Raffle");
        [Owner, NonOwner] = await ethers.getSigners();
        Raffle = await contract.deploy(BigNum, rinkeby.linkToken, rinkeby.linkCoordinator, rinkeby.linkKeyHash);
        Link = new ethers.Contract(linkAddress, ERC20.abi, Owner);
        await Link.approve(Raffle.address, BigNum);
        await Raffle.topUPSubscription(BigNum);
    });

    it("Contract should be initialized with the correct target", async () => { 
        const target = await Raffle.target();
        assert(target.eq(BigNum), `${target} != ${BigNum}`);
    });

    it("Contract should be initialized without any LINK", async () => { 
        const balance = await Link.balanceOf(Raffle.address);
        assert(balance.eq(0), `${balance} != ${0}`);
    });

    it("Contract should be initialized without any ETH", async () => { 
        const balance = await ethers.provider.getBalance(Raffle.address);
        assert(balance.eq(0), `${balance} != ${0}`);
    });

    it("Should not be able to create a contract with a target lower than 1 ETH", async () => {
        const contract = await ethers.getContractFactory("Raffle");
        assert.rejects(async () => {
            await contract.deploy(1000, linkAddress, coordinatorAddress, keyHash);
        });
    });

    it("Should start with an initial position of zero", async () => {
        const position = await Raffle.position(NonOwner.address);
        assert(position.eq(0), `${position} != ${0}`);
    });

    it("Should be able to add a position", async () => {
        await NonOwner.sendTransaction({ to: Raffle.address, value: 1 });
        const position = await Raffle.position(NonOwner.address);
        assert(position.eq(1), `${position} != ${1}`);
    });

    it("Should be able to add a position that exceeds the target", async () => {
        const value = BigNum.mul(100).div(99).add(1);
        await NonOwner.sendTransaction({ to: Raffle.address, value: value });
        const position = await Raffle.position(NonOwner.address);
        assert(position.eq(1), `${position} != ${1}`);
    });

    it("Should be able to add a position that exceeds the target twice", async () => {
        const value = BigNum.mul(100).div(99).mul(2).add(1);
        await NonOwner.sendTransaction({ to: Raffle.address, value: value });
        const position = await Raffle.position(NonOwner.address);
        assert(position.eq(1), `${position} != ${1}`);
    });

    it("Should not be able to add a position if there is not enough LINK", async () => {
        const value = BigNum.mul(100).div(99).mul(4).add(1);
        await assert.rejects(async () => {
            await NonOwner.sendTransaction({ to: Raffle.address, value: value });
        });
    });

    it("Should not be able to add a position to an inactive contract", async () => {
        await Raffle.renounceOwnership();
        await assert.rejects(async () => {
            await NonOwner.sendTransaction({ to: Raffle.address, value: 1 });
        });
    });

    it("Non-owners should not be able to close the contract", async () => {
        await assert.rejects(async () => {
            await Raffle.connect(NonOwner).renounceOwnership();
        });
    });

    it("Should payout when target is reached", async () => {
        const value = BigNum.mul(100).div(99);
        const initialBalance = await NonOwner.getBalance();
        const transaction = await NonOwner.sendTransaction({ to: Raffle.address, value: value });
        const receipt = await transaction.wait();
        const gas = receipt.gasUsed.mul(receipt.effectiveGasPrice);
        const newBalance = await NonOwner.getBalance();
        const net = initialBalance.sub(newBalance);
        const spent = gas.add(value.div(100));
        assert(net.eq(spent), `${net} != ${spent}`);
    });

    it("Should transfer remaining ETH to owner on deactivate", async () => {
        const initialBalance = await Owner.getBalance();
        await NonOwner.sendTransaction({ to: Raffle.address, value: 1 });
        const transaction = await Raffle.renounceOwnership();
        const receipt = await transaction.wait();
        const gas = receipt.gasUsed.mul(receipt.effectiveGasPrice);
        const newBalance = await Owner.getBalance();
        const net = initialBalance.sub(newBalance);
        const spent = gas.sub(1);
        assert(net.eq(spent), `${net} != ${spent}`);
    });

    it("Should transfer remaining LINK owner on deactivate", async () => {
        const initialBalance = await Link.balanceOf(Owner.address);
        await Raffle.renounceOwnership();
        const newBalance = await Link.balanceOf(Owner.address);
        const net = newBalance.sub(initialBalance);
        assert(net.eq(BigNum), `${net} != ${BigNum}`);
    });

    it("Should be able to top up LINK subscription with a multiple of 0.25 LINK", async () => {
        const rafflesBefore = await Raffle.numberOfRafflesRemaining();
        await Link.approve(Raffle.address, BigNum);
        await Raffle.topUPSubscription(BigNum);
        const rafflesAfter = await Raffle.numberOfRafflesRemaining();
        const raffles = rafflesAfter.sub(rafflesBefore);
        assert(raffles.eq(4), `${raffles} != ${4}`);
    });

    it("Should not be able to top up LINK subscription if not approved for spending LINK", async () => {
        await assert.rejects(async () => {
            await Raffle.topUPSubscription(BigNum);
        });
        await Link.approve(Raffle.address, BigNum.div(2));
        await assert.rejects(async () => {
            await Raffle.topUPSubscription(BigNum);
        });
    });

    it("Should not be able to top up LINK subscription with an amount of 0", async () => {
        await Link.approve(Raffle.address, BigNum);
        await assert.rejects(async () => {
            await Raffle.topUPSubscription(0);
        });
    });

    it("Non-owners should not be able to top up LINK", async () => {
        await Link.connect(NonOwner).approve(Raffle.address, BigNum);
        await assert.rejects(async () => {
            await Raffle.connect(NonOwner).topUPSubscription(BigNum);
        });
    });

    it("Should payout to owner when a position is added", async () => {
        const initialBalance = await Owner.getBalance();
        await NonOwner.sendTransaction({ to: Raffle.address, value: BigNum });
        const newBalance = await Owner.getBalance();
        const payout = newBalance.sub(initialBalance);
        assert(payout.eq(BigNum.div(100)), `${payout} != ${BigNum.div(100)}`);
    });

    it("Contract balance should be equal to positions added", async () => {
        await NonOwner.sendTransaction({ to: Raffle.address, value: 1 });
        const balance = await ethers.provider.getBalance(Raffle.address);
        assert(balance.eq(1), `${balance} != ${1}`);
    });
});