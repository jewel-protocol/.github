const assert = require("assert");
const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");

describe("Raffle", () => {
    const BigNum = ethers.BigNumber.from(10).pow(18);
    const linkAddress = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
    const coordinatorAddress = "0x6168499c0cFfCaCD319c818142124B7A15E857ab";
    const keyHash = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
    let Raffle;
    let Link;
    let Owner;
    let NonOwner;

    beforeEach(async() => {
        if (network.name != "hardhat") { throw Error("Should only run tests on local hardhat network."); }
        const contract = await ethers.getContractFactory("Raffle");
        [Owner, NonOwner] = await ethers.getSigners();
        Raffle = await contract.deploy(BigNum, linkAddress, coordinatorAddress, keyHash);
        Link = new ethers.Contract(linkAddress, ERC20.abi, Owner);
        await Link.approve(Raffle.address, BigNum);
        await Raffle.topUPSubscription(BigNum);
    });

    it("Contract should be initialized with the correct target", async() => { 
        const target = await Raffle.target();
        assert(target.eq(BigNum), `${target} != ${BigNum}`);
    });

    it("Should not be able to create a contract with a target lower than 1 ETH", async() => {
        const contract = await ethers.getContractFactory("Raffle");
        assert.rejects(async() => {
            await contract.deploy(1000, linkAddress, coordinatorAddress, keyHash);
        });
    });

    it("Should start with an initial position of zero", async() => {
        const position = await Raffle.position(NonOwner.address);
        assert(position.eq(0), `${position} != ${0}`);
    });

    it("Should be able to add a position", async() => {
        await NonOwner.sendTransaction({ to: Raffle.address, value: 1 });
        const position = await Raffle.position(NonOwner.address);
        assert(position.eq(1), `${position} != ${1}`);
    });

    it("Should be able to add a position that exceeds the target", async() => {
        const value = BigNum.add(BigNum.div(100)).add(1);
        await NonOwner.sendTransaction({ to: Raffle.address, value: value });
        const position = await Raffle.position(NonOwner.address);
        assert(position.eq(1), `${position} != ${1}`);
    });

    it("Should be able to add a position that exceeds the target twice", async() => {
        const value = BigNum.mul(2).add(BigNum.div(100)).add(1);
        await NonOwner.sendTransaction({ to: Raffle.address, value: value });
        const position = await Raffle.position(NonOwner.address);
        assert(position.eq(1), `${position} != ${1}`);
    });

    it("Should not be able to add a position if there is not enough LINK", async() => {
        assert.rejects(async() => {
            await NonOwner.sendTransaction({ to: Raffle.address, value: BigNum.mul(4).add(41) });
        });
    });

    it("Should not be able to add a position to an inactive contract", async() => {
        await Raffle.renounceOwnership();
        assert.rejects(async() => {
            await NonOwner.sendTransaction({ to: Raffle.address, value: BigNum });
        });
    });

    it("Non-owners should not be able to close the contract", async() => {
        assert.rejects(async() => {
            await Raffle.connect(NonOwner).renounceOwnership();
        });
    });

    it("Should payout when target is reached", async() => {
        const initialBalance = await NonOwner.getBalance();
        await NonOwner.sendTransaction({ to: Raffle.address, value: BigNum });
        const newBalance = await NonOwner.getBalance();
        const net = initialBalance.sub(newBalance);
        assert(net.eq(10), `${net} != ${10}`);
    });

    it("Should transfer remaining ETH to owner on deactivate", async() => {
        const initialBalance = await Owner.getBalance();
        await NonOwner.sendTransaction({ to: Raffle.address, value: BigNum });
        const transaction = await Raffle.renounceOwnership();
        const receipt = await transaction.wait();
        const gas = receipt.gasUsed.mul(receipt.effectiveGasPrice);
        const newBalance = await Owner.getBalance();
        const net = newBalance.sub(initialBalance).add(gas);
        assert(net.eq(BigNum), `${net} != ${BigNum}`);
    });

    it("Should transfer remaining LINK owner on deactivate", async() => {
        const initialBalance = await Link.balanceOf(Owner.address);
        await NonOwner.sendTransaction({ to: Raffle.address, value: BigNum });
        await Raffle.renounceOwnership();
        const newBalance = await Link.balanceOf(Owner.address);
        const net = newBalance.sub(initialBalance);
        assert(net.eq(BigNum), `${net} != ${BigNum}`);
    });

    it("Should be able to top up LINK subscription with a multiple of 0.25 LINK", async() => {
        const rafflesBefore = await Raffle.numberOfRafflesRemaining();
        await Link.approve(Raffle.address, BigNum);
        await Raffle.topUPSubscription(BigNum);
        const rafflesAfter = await Raffle.numberOfRafflesRemaining();
        const raffles = rafflesAfter.sub(rafflesBefore);
        assert(raffles.eq(4), `${raffles} != ${4}`);
    });

    it("Should not be able to top up LINK subscription if not approved for spending LINK", async() => {
        assert.rejects(async() => {
            await Raffle.topUPSubscription(BigNum);
        });
        await Link.approve(Raffle.address, BigNum.div(2));
        assert.rejects(async() => {
            await Raffle.topUPSubscription(BigNum);
        });
    });

    it("Should not be able to top up LINK subscription with an amount of 0", async() => {
        await Link.approve(Raffle.address, BigNum);
        assert.rejects(async() => {
            await Raffle.topUPSubscription(0);
        });
    });

    it("Non-owners should not be able to top up LINK", async() => {
        const link = new ethers.Contract(linkAddress, ERC20.abi, NonOwner);
        await link.approve(Raffle.address, BigNum);
        assert.rejects(async() => {
            await Raffle.connect(NonOwner).topUPSubscription(BigNum);
        });
    });

    it("Should payout to owner when a position is added", async() => {
        const initialBalance = await Owner.getBalance();
        await NonOwner.sendTransaction({ to: Raffle.address, value: BigNum });
        const newBalance = await Owner.getBalance();
        const payout = newBalance.sub(initialBalance);
        assert(payout.eq(BigNum.div(100)), `${payout} != ${BigNum.div(100)}`);
    });

    it("Contract balance should be equal to positions added", async() => {
        await NonOwner.sendTransaction({ to: Raffle.address, value: 1 });
        const balance = await Owner.getBalance(Raffle.address);
        assert(balance.eq(1), `${balance} != ${1}`);
    });
});