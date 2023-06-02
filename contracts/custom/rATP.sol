// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "../tokens/MintableBaseToken.sol";

interface IATG {
    function mint(address _account, uint256 _amount) external;
}

contract rATP is MintableBaseToken {
    
    address public ATG;
    
    constructor(address _ATG) public MintableBaseToken("rATP", "rATP", 0) {
        require (_ATG != address(0), "zero address");
        ATG = _ATG;
    }
    
    function burn(address _account, uint256 _amount) external override {
        require(msg.sender == _account, "self burn only");
        _burn(_account, _amount);
        IATG(ATG).mint(_account, _amount);
    }

    function id() external pure returns (string memory _name) {
        return "rATP";
    }
}
