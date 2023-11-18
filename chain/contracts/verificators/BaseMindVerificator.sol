// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BaseVerificator} from "../interfaces/BaseVerificator.sol";
import {MindShare} from "../MindShare.sol";

contract BaseMindVerificator is Ownable, BaseVerificator {
    MindShare private _mindShare;

    constructor() Ownable(msg.sender) {}

    function mindShareAttached() public view override returns (address) {
        return address(_mindShare);
    }

    function setMindShare(address mindShare_) public onlyOwner {
        _mindShare = MindShare(mindShare_);
    }
}
