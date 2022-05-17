// SPDX-License-Identifier: OTHER
pragma solidity ^0.8.0;

interface IToken {
    function payout(address, uint256) external;
    function requestRandomWords(uint32) external returns (uint256);
}