// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../access/Governable.sol";
import "../libraries/math/SafeMath.sol";

interface IGlpManager {
    function getPrice(bool _maximise) external view returns (uint256);
}

interface IesrATP {
    function mint(address _account, uint256 _amount) external;
}

contract Rebate is Governable {

    using SafeMath for uint256;

    uint256 public constant PRICE_PRECISION = 10 ** 30;
    uint256 public constant USDG_DECIMALS = 18;

    uint256 public MAX_REBATE = 10000 * 1e18;
    uint256 public MIN_REBATE_TIME = 90 days;

    address public glpManager;
    address public esrATP;

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

    constructor (address _glpManager, address _esrATP) public {
        glpManager = _glpManager;
        esrATP = _esrATP;
    }

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
        giveRebate(_account, rebateableLiquidity);        
    }

    function giveRebate(address _account, uint256 _amount) internal {
        uint256 glpPrice = IGlpManager(glpManager).getPrice(true);
        uint256 glpAmount = _amount.mul(glpPrice).div(PRICE_PRECISION);
        IesrATP(esrATP).mint(_account, glpAmount);
    }
}