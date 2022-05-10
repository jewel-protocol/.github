// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Game.sol";

contract DoubleOrNothing is Game {

    function _validateInput(uint256 input, address) internal pure override {
        require(input <= 10 ** 21, "Double: maximum input is 1000 ETH");
    }

    function _payoutAmount(uint256 input, uint256[] memory randomWords) internal pure override returns (uint256) {
        uint256 mod = randomWords[0] % 100;
        return mod > 55 ? input * 2 : 0;
    }

    function _maxOutput(uint256 input) internal pure override returns (uint256) {
        return input * 2;
    }

}