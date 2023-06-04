// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

contract Rebate {
    constructor() public {
    }

    struct record {
        uint256 usdgAmount;
        uint256 timestamp;
    }

    mapping(address => mapping (uint => record)) records;

    mapping(address => uint256) liquidityCount;

    mapping(address => uint256) liquidityIndex;

    function addLiquidity(address _account, uint256 _usdgAmount) external {
    }

    function removeLiquidty(address _account, uint256 _usdgAmount) external {
        
    }
}