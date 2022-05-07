// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "hardhat/console.sol";

struct RaffleData {
    address player;
    uint256 position;
}

struct Link {
    uint256 fee;
    VRFCoordinatorV2Interface coordinator;
    LinkTokenInterface token;
    bytes32 keyHash;
    uint64 subscriptionId;
}

contract Raffle is VRFConsumerBaseV2, Ownable {
    uint256 private _target;
    Link private _link;
    address[] private _players;
    mapping(address => uint256) private _positions;
    mapping(uint256 => RaffleData[][]) private _queuedRaffles;

    //TODO: optimize integer types?

    constructor(uint256 contractTarget, address linkAddress, address linkCoordinator, bytes32 linkKeyHash) VRFConsumerBaseV2(linkCoordinator) {
        require(contractTarget >= 10 ** 18, "Target should be greater than or equal to 1 ETH");
        _target = contractTarget;
        _link.fee = 0.25 * 10 ** 18;
        _link.coordinator = VRFCoordinatorV2Interface(linkCoordinator);
        _link.token = LinkTokenInterface(linkAddress);
        _link.keyHash = linkKeyHash;
        _link.subscriptionId = _link.coordinator.createSubscription();
        _link.coordinator.addConsumer(_link.subscriptionId, address(this));
    }

    function position(address id) external view returns (uint256) {
        return _positions[id];
    }

    function target() external view returns (uint256) {
        return _target;
    }

    receive() external payable {
        require(owner() != address(0), "Raffle contract no longer active.");
        uint256 previous = address(this).balance - msg.value;
        uint256 fee = msg.value / 100;
        payable(owner()).transfer(fee);

        uint256 linkRequests = address(this).balance / _target - previous / _target;
        uint256 partialLinkRequests = address(this).balance % _target > 0 ? 1 : 0;
        require(numberOfRafflesRemaining() >= linkRequests + partialLinkRequests, "Not enough LINK in subscription to fulfill this request.");

        uint256 requestId;
        if (linkRequests > 0) {
            requestId = _link.coordinator.requestRandomWords(_link.keyHash, _link.subscriptionId, 3, 100000, uint32(linkRequests));
        }

        uint256 remaining = msg.value - fee;

        while (remaining > 0) {
            uint256 maximum = _target - previous;   
            uint256 current = Math.min(remaining, maximum);

            if (_positions[msg.sender] == 0) {
                _players.push(msg.sender);
            }

            _positions[msg.sender] = _positions[msg.sender] + current;
            remaining -= current;

            if (previous + current == _target) {
                uint256 index = _queuedRaffles[requestId].length;
                _queuedRaffles[requestId].push();

                for (uint256 i = 0; i < _players.length; i++) {
                    address player = _players[i];
                    _queuedRaffles[requestId][index].push(RaffleData({player: player, position: _positions[player]}));
                    delete _positions[player];
                }

                delete _players;
                previous = 0;
            }
        }
    }

    function numberOfRafflesRemaining() public view returns (uint256) {
        (uint256 balance, , ,) = _link.coordinator.getSubscription(_link.subscriptionId);
        return balance / _link.fee;
    }

    function topUPSubscription(uint256 amount) payable external onlyOwner {
        uint256 deposit = (amount / _link.fee) * _link.fee;
        require(deposit > 0, "Amount should be greater than 0.25 LINK");
        uint256 allowance = _link.token.allowance(msg.sender, address(this));
        require(allowance >= deposit, "Please approve this contract for spending LINK");
        _link.token.transferFrom(msg.sender, address(this), deposit);
        _link.token.transferAndCall(address(_link.coordinator), deposit, abi.encode(_link.subscriptionId));
    }

    function renounceOwnership() public override onlyOwner {
        _link.coordinator.cancelSubscription(_link.subscriptionId, owner());
        payable(owner()).transfer(address(this).balance);
        super.renounceOwnership();
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        console.log(requestId);
        for (uint i = 0; i < randomWords.length; i++) {
            uint256 current = 0;
            for (uint j = 0; j < _queuedRaffles[requestId].length; j++) {
                address player = _queuedRaffles[requestId][i][j].player;
                current += _queuedRaffles[requestId][i][j].position;

                if (current > randomWords[i]) {
                    payable(player).transfer(_target);
                    break;
                }
            }
            delete _queuedRaffles[requestId][i];
        }

        delete _queuedRaffles[requestId];        
    }
}