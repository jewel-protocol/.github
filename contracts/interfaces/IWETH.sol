// SPDX-License-Identifier: OTHER
pragma solidity ^0.8.0;

interface IWETH {
    function approve(address, uint256) external returns (bool);
    function withdraw(uint256) external;
}