// SPDX-License-Identifier: OTHER
pragma solidity ^0.8.0;

import "./interfaces/IToken.sol";

abstract contract JewelGame {
    address private _jewel;
    mapping(address => uint256) private _addressToRequest;
    mapping(uint256 => address) private _requestToAddress;
    mapping(uint256 => uint256) private _requestToInput;

    event Request(address indexed sender, uint256 amount);
    event Result(address indexed sender, uint256 amount);

    constructor(address jewelAddress) {
        _jewel = jewelAddress;
    }

    receive() external payable {
        if (msg.sender == _jewel) { return; }
        require(msg.value > 0, "Game: cannot play with zero input");
        require(_addressToRequest[msg.sender] == 0, "Game: this account is already waiting for random words");
        _validateInput(msg.value, msg.sender);
        uint256 reservedAmount = _maxOutput(msg.value);
        IToken(_jewel).payout(payable(address(this)), reservedAmount);
        uint32 numberOfWords = _numberOfRandomWords();
        uint256 requestId = IToken(_jewel).requestRandomWords(numberOfWords);
        _addressToRequest[msg.sender] = requestId;
        _requestToAddress[requestId] = msg.sender;
        _requestToInput[requestId] = msg.value;
        emit Request(msg.sender, msg.value);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        require(msg.sender == _jewel, "Game: random words can only be fulfilled from the jewel address");
        uint256 input =  _requestToInput[requestId];
        address recipient = _requestToAddress[requestId];
        uint256 payout = _payoutAmount(input, randomWords);
        payable(recipient).transfer(payout);
        uint256 refund = input + _maxOutput(input) - payout;
        payable(_jewel).transfer(refund);
        _addressToRequest[recipient] = 0;
        _requestToAddress[requestId] = address(0);
        _requestToInput[requestId] = 0;
        emit Result(msg.sender, payout);
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