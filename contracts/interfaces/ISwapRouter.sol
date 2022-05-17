// SPDX-License-Identifier: OTHER
pragma solidity ^0.8.0;

interface ISwapRouter {
    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }
    
    function exactOutputSingle(ExactOutputSingleParams calldata) external payable returns (uint256);
}

