// SPDX-License-Identifier: OTHER
pragma solidity ^0.8.0;

interface ILinkCoordinator {
    function createSubscription() external returns (uint64);
    function addConsumer(uint64, address) external;
    function requestRandomWords(bytes32, uint64, uint16, uint32, uint32) external returns (uint256);
}