// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {BaseMindVerificator} from "./BaseMindVerificator.sol";
import {MindShare} from "../MindShare.sol";

contract PolygonIdVerificator is BaseMindVerificator {
    constructor(address baseMind) BaseMindVerificator() {
        setMindShare(baseMind);
    }

    function verifyProof(
        bool isSupported,
        address mentor
    )
        public
        returns (
            // uint256[8] calldata proof
            bool
        )
    {
        MindShare mindShare = MindShare(mindShareAttached());
        if (!isSupported) {
            mindShare.verifyMentor(mentor, true);
            return true;
        }

        // TODO: verify proof here

        mindShare.verifyMentor(mentor, true);
        return true;
    }
}
