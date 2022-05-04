// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Raffle is Ownable {
    uint256 private _target;

    constructor(uint256 target) {
        _target = target;
    }

}