const link = require("./utility").link;
const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");

task("balance", "Prints an account's balance")
    .addOptionalParam("address", "The wallet's address to look up the balance for")
    .addOptionalParam("token", "The token's address to look up the balance for")
    .addOptionalParam("precision", "The precision for printing the balance")
    .setAction(async (args) => {
        const signer = await ethers.getSigner(0);
        const account = args.address == null ? signer.address : args.address;
        const precision = args.precision == null ? 2 : args.precision; 
        let symbol = "ETH"
        let decimals = 18;
        let balance = ethers.BigNumber.from(0);
        if (args.token == null) {
            balance = await ethers.provider.getBalance(account);            
        } else {
            const contract = new ethers.Contract(args.token, ERC20.abi, signer);
            balance = await contract.balanceOf(account);
            symbol = await contract.symbol();
            decimals = await contract.decimals();
        }

        const base = ethers.BigNumber.from(10);
        const rounding = Math.max(Math.min(balance.toString().length, decimals) - precision, 0);
        const left = rounding - decimals;
        const rounded = balance.div(base.pow(rounding)).toNumber();
        const formatted = rounded * 10 ** left;
        const formattedSymbol = args.token == null ? symbol : link(args.token, symbol);
        const formattedAmount = formatted.toFixed(-left) + " " + formattedSymbol;

        console.log("Account " + link(account.toLowerCase()) + " has " + formattedAmount);
    });