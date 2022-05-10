// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Jewel.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Game is Ownable {
    mapping(address => uint256) private _addressToRequest;
    mapping(uint256 => address) private _requestToAddress;
    mapping(uint256 => uint256) private _requestToInput;

    receive() external payable {
        if (msg.sender == owner()) { return; }
        require(msg.value > 0, "Game: cannot play with zero input");
        require(_addressToRequest[msg.sender] == 0, "Game: this account is already waiting for random words");
        _validateInput(msg.value, msg.sender);
        Jewel jewel = Jewel(payable(owner()));
        uint256 reservedAmount = _maxOutput(msg.value);
        jewel.payout(reservedAmount, payable(address(this)));
        uint32 numberOfWords = _numberOfRandomWords();
        uint256 requestId = jewel.requestRandomWords(numberOfWords);
        _addressToRequest[msg.sender] = requestId;
        _requestToAddress[requestId] = msg.sender;
        _requestToInput[requestId] = msg.value;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external onlyOwner {
        uint256 input =  _requestToInput[requestId];
        address recipient = _requestToAddress[requestId];
        uint256 shouldPayout = _payoutAmount(input, randomWords);
        payable(recipient).transfer(shouldPayout);
        uint256 refund = input + _maxOutput(input) - shouldPayout;
        payable(owner()).transfer(refund);
        _addressToRequest[recipient] = 0;
        _requestToAddress[requestId] = address(0);
        _requestToInput[requestId] = 0;
    }

    function _validateInput(uint256, address) internal pure virtual {

    }

    function _numberOfRandomWords() internal pure virtual returns (uint32) {
        return 1;
    }

    function _payoutAmount(uint256, uint256[] memory) internal pure virtual returns (uint256) {
        return 0;
    }

    function _maxOutput(uint256) internal pure virtual returns (uint256) {
        return 0;
    }
}