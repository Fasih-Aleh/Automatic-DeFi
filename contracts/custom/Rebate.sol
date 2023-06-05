// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../access/Governable.sol";

contract Rebate is Governable {

    uint256 MAX_REBATE = 10000 * 1e18;
    uint256 MIN_REBATE_TIME = 90 days;

    struct record {
        uint256 usdgAmount;
        uint256 timestamp;
    }

    mapping(address => mapping (uint256 => record)) records;

    mapping(address => uint256) liquidityAmount;

    mapping(address => uint256) liquidityCount;

    mapping(address => uint256) liquidityIndex;

    mapping (address => bool) public isHandler;

    modifier onlyHandler() {
        require(isHandler[msg.sender], "GmxFloor: forbidden");
        _;
    }

    constructor () public {}

    function setHandler(address _handler, bool _isHandler) public onlyGov {
        isHandler[_handler] = _isHandler;
    }

    function addLiquidity(address _account, uint256 _usdgAmount) external onlyHandler {
        uint256 _liquidityCount = liquidityCount[_account];
        records[_account][_liquidityCount] = record(_usdgAmount, block.timestamp);
        liquidityCount[_account] += 1;
        liquidityAmount[_account] += _usdgAmount;
    }

    function removeLiquidty(address _account, uint256 _usdgAmount) external onlyHandler {
        require(_usdgAmount <= liquidityAmount[_account], "not enough liquidity");
        uint256 removedLiquidity = 0;
        uint256 rebateableLiquidity = 0;
        uint256 _liquidityIndex = liquidityIndex[_account];
        while(removedLiquidity < _usdgAmount) {
            if (_usdgAmount - removedLiquidity < records[_account][_liquidityIndex].usdgAmount) {
                uint256 liquidityToRemove = _usdgAmount - removedLiquidity;
                records[_account][_liquidityIndex].usdgAmount -= liquidityToRemove;
                removedLiquidity += liquidityToRemove;
                if (records[_account][_liquidityIndex].timestamp + MIN_REBATE_TIME < block.timestamp) {
                    rebateableLiquidity += liquidityToRemove;
                }
            }
            else {
                uint256 liquidityToRemove = records[_account][_liquidityIndex].usdgAmount;
                records[_account][_liquidityIndex].usdgAmount = 0;
                liquidityIndex[_account] += 1;
                if (records[_account][_liquidityIndex].timestamp + MIN_REBATE_TIME < block.timestamp) {
                    rebateableLiquidity += liquidityToRemove;
                }
            }
        }
        if (rebateableLiquidity > 0) {
            if (rebateableLiquidity > MAX_REBATE)
                rebateableLiquidity = MAX_REBATE;
        }        
    }

    function giveRebate(address _account, uint256 _amount) {
        
    }
}