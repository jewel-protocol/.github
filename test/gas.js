const assert = require("assert");
const captureLog = require("../utility/log").captureLog;

describe("Gas", () => {

    beforeEach(async () => {
        if (hre.network.name !== "hardhat") { throw Error("Should only run tests on local hardhat network."); }
    });

    it("Should return the current gas price", async () => {
        const log = captureLog();
        await hre.run("gas", { });
        log.unhook();
        const actual = log.captured().split(" ");
        assert(actual[5].includes("10639840"), `${"10639840"} not in ${actual[5]}`);
        assert(actual[7] === "5", `${actual[7]} !== ${"5"}`);
        assert(actual[8].includes("GWEI"), `${"GWEI"} not in ${actual[8]}`);
    });
});