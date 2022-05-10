// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Game.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";


interface IWETH9 is IERC20 {
    function withdraw(uint256) external;
}

struct Uniswap {
    address weth;
    address swapRouter;
}

struct Link {
    uint256 fee;
    uint64 subscriptionId;
    bytes32 keyHash;
    address coordinator;
    address token;
}

contract Jewel is IERC20, IERC20Metadata, Ownable {
    string public constant override name = "Jewel Protocol";
    string public constant override symbol = "JEWEL";
    uint256 public constant sypplyCap = 10 ** 24;
    uint8 public constant override decimals = 18;
    uint256 public override totalSupply;

    Link private _link;
    Uniswap private _uniswap;
    mapping(uint256 => address) private _randomRequests;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _pendingYield;
    int256 private _yieldPerUnit;
    mapping(address => int256) private _redeemedYield;

    mapping(address => bool) private _games;

    constructor(address linkAddress, address linkCoordinator, bytes32 linkKeyHash, address wethAddress, address swapRouterAddress) {
        _link.fee = 0.25 * 10 ** 18;
        _link.coordinator = linkCoordinator;
        _link.token = linkAddress;
        _link.keyHash = linkKeyHash;
        _link.subscriptionId = VRFCoordinatorV2Interface(_link.coordinator).createSubscription();
        VRFCoordinatorV2Interface(_link.coordinator).addConsumer(_link.subscriptionId, address(this));
        _uniswap.weth = wethAddress;
        _uniswap.swapRouter = swapRouterAddress;
    }

    receive() external payable {
        if (_games[msg.sender]) {
            uint256 yield = msg.value + _pendingYield;
            unchecked {
                _yieldPerUnit += int256(yield / totalSupply);
                _pendingYield = yield % totalSupply;
            }
        } else {
            require(totalSupply + msg.value <= sypplyCap, "Jewel: supply cap exceeded");
            unchecked {
                totalSupply += msg.value;
                _balances[msg.sender] += msg.value;
                _redeemedYield[msg.sender] += _yieldPerUnit * int256(msg.value);
            }
            emit Transfer(address(0), msg.sender, msg.value);
        }
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function allowance(address holder, address spender) public view override returns (uint256) {
        return _allowances[holder][spender];
    }

    function yieldAllowance(address account) public view returns (int256) {
        int256 allowedYield = _yieldPerUnit * int256(_balances[account]);
        return allowedYield - _redeemedYield[account];
    }

    function withdraw(uint256 amount) external {
        require(_balances[msg.sender] >= amount, "Jewel: withdrawal amount exceeds balance");
        require(yieldAllowance(msg.sender) >= 0, "Jewel: must forfeit negative dividends first");
        unchecked {
            totalSupply -= amount;
            _balances[msg.sender] -= amount;
        }
        payable(msg.sender).transfer(amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    function forfeit(uint256 amount) external {
        require(yieldAllowance(msg.sender) <= -int256(amount), "Jewel: forfeit amount exceeds negative yield");
        unchecked {
            _redeemedYield[msg.sender] -= int256(amount);
            _balances[msg.sender] -= amount;
            totalSupply -= amount;
        }
        emit Transfer(msg.sender, address(0), amount);
    }

    function payout(uint256 amount, address to) public onlyGame {
        require(to != address(0), "Jewel: cannot payout to the zero address");
        if (amount < _pendingYield) {
            unchecked {
                _pendingYield -= amount;
            }
        } else {
            uint256 yield = amount - _pendingYield;
            unchecked {
                _yieldPerUnit -= int256(yield / totalSupply) + 1; //TODO: is this correct?
                _pendingYield = totalSupply - (yield % totalSupply);
            }
        }
        payable(to).transfer(amount);
    }

    function withdrawYield(uint256 amount) external {
        require(yieldAllowance(msg.sender) >= int256(amount), "Jewel: withdrawal amount exceeds yield");
        unchecked {
            _redeemedYield[msg.sender] += int256(amount);
        }
        payable(msg.sender).transfer(amount);
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        require(to != address(0), "Jewel: cannot transfer to the zero address");
        require(_balances[msg.sender] >= amount, "Jewel: transfer amount exceeds balance");
        unchecked {
            _balances[msg.sender] -= amount;
            _balances[to] += amount;
        }
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        require(spender != address(0), "Jewel: cannot approve the zero address");
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        require(from != address(0), "Jewel: cannot transfer from the zero address");
        require(to != address(0), "Jewel: cannot transfer to the zero address");
        require(_allowances[from][msg.sender] >= amount, "Jewel: insufficient allowance");
        require(_balances[from] >= amount, "Jewel: transfer amount exceeds balance");
        unchecked {
            _balances[from] -= amount;
            _balances[to] += amount;
            _allowances[from][msg.sender] -= amount;
        }
        emit Transfer(from, to, amount);
        return true;
    }

    function _topUpSubscription() internal {
        uint256 maximumIn = 10 ** 15; //TODO: is this a good way?
        require(address(this).balance > maximumIn, "Jewel: no ETH balance to swap for LINK");
        payout(maximumIn, payable(_uniswap.weth));
        IWETH9(_uniswap.weth).approve(_uniswap.swapRouter, maximumIn);
        ISwapRouter.ExactOutputSingleParams memory swapParams = ISwapRouter.ExactOutputSingleParams({
            tokenIn: _uniswap.weth, 
            tokenOut: _link.token, 
            fee: 3000, 
            recipient: address(this), 
            deadline: block.timestamp,
            amountOut: _link.fee,
            amountInMaximum: maximumIn,
            sqrtPriceLimitX96: 0
        });
        uint256 amountIn = ISwapRouter(_uniswap.swapRouter).exactOutputSingle(swapParams);
        uint256 refund = maximumIn - amountIn;
        IWETH9(_uniswap.weth).approve(_uniswap.swapRouter, 0);
        IWETH9(_uniswap.weth).withdraw(refund);
    }

    function requestRandomWords(uint32 numberOfWords) external onlyGame returns (uint256) { 
        _topUpSubscription();
        uint256 requestId = VRFCoordinatorV2Interface(_link.coordinator).requestRandomWords(_link.keyHash, _link.subscriptionId, 3, 100000, numberOfWords);
        _randomRequests[requestId] = msg.sender;
        return requestId;
    }

    function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        require(msg.sender == _link.coordinator, "Jewel: only coordinator can fulfill random words request");
        Game(payable(_randomRequests[requestId])).fulfillRandomWords(requestId, randomWords);
    }

    function approveGame(address contractAddress) external onlyOwner {
        _games[contractAddress] = true;
    }

    function revokeGame(address contractAddress) external onlyOwner {
        require(_games[contractAddress], "Jewel: not an approved game");
        _games[contractAddress] = false;
    }

    modifier onlyGame() {
        require(_games[msg.sender], "Jewel: only an approved game can call this function");
        _;
    }
}