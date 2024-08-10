// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FyToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Free", "FY") {
        _mint(msg.sender, initialSupply);
    }
}
