// SPDX-License-Identifier: OTHER
pragma solidity ^0.8.0;

interface ILinkToken {
    function transferAndCall(address, uint256, bytes calldata) external returns (bool);
}