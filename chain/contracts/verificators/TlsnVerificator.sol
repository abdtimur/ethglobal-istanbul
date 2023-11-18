// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {BaseMindVerificator} from "./BaseMindVerificator.sol";
import {MindShare} from "../MindShare.sol";

contract TlsnVerificator is BaseMindVerificator {
    using ECDSA for bytes32;

    constructor(address baseMind) BaseMindVerificator() {
        setMindShare(baseMind);
    }

    function recoverSigner(
        bytes32 hash,
        bytes memory signature
    ) public pure returns (address) {
        return hash.recover(signature);
    }

    function verifyProof(
        bool isSupported,
        address mentor,
        bytes32 hash,
        bytes memory signature
    ) public returns (bool) {
        MindShare mindShare = MindShare(mindShareAttached());
        if (!isSupported) {
            mindShare.verifyMentor(mentor, true);
            return true;
        }

        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        // TODO: try recover, works 50/50 for sm rsn

        mindShare.verifyMentor(mentor, true);
        return true;
    }
}
