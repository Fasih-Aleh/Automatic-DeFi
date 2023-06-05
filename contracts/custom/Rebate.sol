// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../access/Governable.sol";

contract Rebate is Governable {
    constructor() public {
    }

    struct record {
        uint256 usdgAmount;
        uint256 timestamp;
    }

    mapping(address => mapping (uint256 => record)) records;

    mapping(address => uint256) liquidityAmount;

    mapping(address => uint256) liquidityCount;

    mapping(address => uint256) liquidityIndex;

    function addLiquidity(address _account, uint256 _usdgAmount) external {
        uint256 _liquidityCount = liquidityCount[_account];
        records[_account][_liquidityCount] = record(_usdgAmount, block.timestamp);
        liquidityCount[_account] += 1;
        liquidityAmount[_account] += _usdgAmount;
    }

    function removeLiquidty(address _account, uint256 _usdgAmount) external {
        require(_usdgAmount <= liquidityAmount[_account], "not enough liquidity");
        uint256 removedLiquidity = 0;
        uint256 _liquidityIndex = liquidityIndex[_account];
        while(removedLiquidity < _usdgAmount) {
            if (_usdgAmount - removedLiquidity < records[_account][_liquidityIndex].usdgAmount) {
                uint256 liquidityToRemove = _usdgAmount - removedLiquidity;
                records[_account][_liquidityIndex].usdgAmount -= liquidityToRemove;
                removedLiquidity += liquidityToRemove;
            }
            else {
                uint256 liquidityToRemove = records[_account][_liquidityIndex].usdgAmount;
                records[_account][_liquidityIndex].usdgAmount = 0;
                liquidityIndex[_account] += 1;
            }
        }        
    }
}