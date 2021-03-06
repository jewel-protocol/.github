const constants = require("./constants");

const link = (link, text) => {
    return `\u001b]8;;${constants[hre.network.name].etherscan}${link.toString()}\u0007${text.toString()}\u001b]8;;\u0007`;
};

const linkAddress = (address, text = null) => {
    const content = text == null ? address : text;
    return link(`address/${address}`, content);
};

const linkToken = (token, text = null) => {
    const content = text == null ? token : text;
    return link(`token/${token}`, content);
};

const linkTransaction = (hash, text = null) => {
    const content = text == null ? hash : text;
    return link(`tx/${hash}`, content);
};

const linkBlock = (block, text = null) => {
    const content = text == null ? block : text;
    return link(`block/${block}`, content);
};

module.exports = {
    captureLog: () => {
        const oldWrite = process.stdout.write;
        let buffer = "";
        process.stdout.write = (chunk) => {
            buffer += chunk.toString();
        };
        return {
            unhook: () => { process.stdout.write = oldWrite; },
            captured: () => { return buffer; }
        };
    },
    linkTransaction: linkTransaction,
    linkToken: linkToken,
    linkAddress: linkAddress,
    linkBlock: linkBlock,
    formatAmount: (amount, symbol, token, decimals, precision) => {
        const base = hre.ethers.BigNumber.from(10);
        const rounding = Math.max(Math.min(amount.toString().length, decimals) - precision, 0);
        const left = rounding - decimals;
        const rounded = amount.div(base.pow(rounding)).toNumber();
        const formatted = rounded * 10 ** left;
        const formattedSymbol = token == null ? symbol : linkToken(token, symbol);
        return `${formatted.toFixed(-left)} ${formattedSymbol}`;
    }
};