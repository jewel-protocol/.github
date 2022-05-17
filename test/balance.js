const assert = require("assert");
const captureLog = require("../utility/log").captureLog;

describe("Balance", () => {
    const acc = "0x869ec00fa1dc112917c781942cc01c68521c415e";
    const usdc = "0xeb8f08a975ab53e34d8a0330e0d34de942c95926";

    beforeEach(async () => {
        if (hre.network.name !== "hardhat") { throw Error("Should only run tests on local hardhat network."); }
    });

    it("Should return token balance for a given account address", async () => {
        const log = captureLog();
        await hre.run("balance", { account: acc, token: usdc, precision: "3" });
        log.unhook();
        const actual = log.captured().split(" ");
        assert(actual[1].includes(acc), `${acc} not in ${actual[1]}`);
        assert(actual[3] === "418690.110", `${actual[3]} !== ${"418690.110"}`);
        assert(actual[4].includes(usdc), `${usdc} not in ${actual[4]}`);
        assert(actual[4].includes("USDC"), `${"USDC"} not in ${actual[4]}`);
    });

    it("Should return ETH balance if no token address is specified", async () => {
        const log = captureLog();
        await hre.run("balance", { account: acc, precision: "3" });
        log.unhook();
        const actual = log.captured().split(" ");
        assert(actual[1].includes(acc), `${acc} not in ${actual[1]}`);
        assert(actual[3] === "43.117", `${actual[3]} !== ${"43.117"}`);
        assert(actual[4].includes("ETH"), `${"ETH"} not in ${actual[4]}`);
    });

    it("Should return own balance if no account address is specified", async () => {
        const signer = await hre.ethers.getSigner(0);
        const address = signer.address.toLowerCase();
        const log = captureLog();
        await hre.run("balance", { token: usdc, precision: "3" });
        log.unhook();
        const actual = log.captured().split(" ");
        assert(actual[1].includes(address), `${address} not in ${actual[1]}`);
        assert(actual[3] === "3018301506249.757", `${actual[3]} !== ${"3018301506249.757"}`);
        assert(actual[4].includes(usdc), `${usdc} not in ${actual[4]}`);
        assert(actual[4].includes("USDC"), `${"USDC"} not in ${actual[4]}`);
    });

    it("Should print the amount with two precision of no precision is specified", async () => {
        const log = captureLog();
        await hre.run("balance", { account: acc, token: usdc });
        log.unhook();
        const actual = log.captured().split(" ");
        assert(actual[1].includes(acc), `${acc} not in ${actual[1]}`);
        assert(actual[3] === "418690.11", `${actual[3]} !== ${"418690.11"}`);
        assert(actual[4].includes(usdc), `${usdc} not in ${actual[4]}`);
        assert(actual[4].includes("USDC"), `${"USDC"} not in ${actual[4]}`);
    });
});