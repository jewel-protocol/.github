// SPDX-License-Identifier: OTHER
pragma solidity ^0.8.0;

abstract contract Whitelisted {
    mapping(address => bool) public isWhitelisted;

    constructor() {
        isWhitelisted[msg.sender] = true;
    }

    function addToWhitelist(address approvedAddress) external onlyWhitelisted {
        isWhitelisted[approvedAddress] = true;
    }

    function _addToWhitelist(address approvedAddress) internal {
        isWhitelisted[approvedAddress] = true;
    }

    function removeFromWhitelist(address revokedAddress) external onlyWhitelisted {
        isWhitelisted[revokedAddress] = false;
    }

    function _removeFromWhitelist(address revokedAddress) internal {
        isWhitelisted[revokedAddress] = false;
    }

    modifier onlyWhitelisted() {
        require(isWhitelisted[msg.sender], "Whitelistable: address is not whitelisted to perform this action");
        _;
    }
}