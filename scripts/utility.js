module.exports = {
    link: (address, text = null) => {
        const etherscan = network.name == "rinkeby" ? "https://rinkeby.etherscan.io/address/" : "https://etherscan.io/address/";
        const link = etherscan + address.toString();
        const content = text == null ? address.toString() : text.toString();
        return "\u001b]8;;" + link  + "\u0007" + content + "\u001b]8;;\u0007";
    },
    mainnet: {
        linkToken: "",
        linkCoordinator: "",
        linkKeyHash: ""
    },
    rinkeby: {
        linkToken: "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
        linkCoordinator: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
        linkKeyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"
    }
};