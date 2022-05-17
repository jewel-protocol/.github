// SPDX-License-Identifier: OTHER
pragma solidity ^0.8.0;

interface IGame {
    function fulfillRandomWords(uint256, uint256[] memory) external;
}