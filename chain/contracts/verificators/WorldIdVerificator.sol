// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {BaseMindVerificator} from "./BaseMindVerificator.sol";
import {IWorldID} from "../interfaces/IWorldID.sol";
import {MindShare} from "../MindShare.sol";

contract WorldIdVerificator is BaseMindVerificator {
    /// @dev The address of the World ID Router contract that will be used for verifying proofs
    IWorldID internal immutable _worldId;

    /// @dev The keccak256 hash of the externalNullifier (unique identifier of the action performed), combination of appId and action
    uint256 internal immutable _externalNullifierHash;

    /// @dev The World ID group ID (1 for Orb-verified)
    uint256 internal immutable _groupId = 1;

    constructor(
        address baseMind,
        IWorldID worldId_,
        string memory appId_,
        string memory action_
    ) BaseMindVerificator() {
        _worldId = worldId_; // 0x719683F13Eeea7D84fCBa5d7d17Bf82e03E3d260 - mumbai
        _externalNullifierHash = hashToField(
            abi.encodePacked(hashToField(abi.encodePacked(appId_)), action_)
        );

        setMindShare(baseMind);
    }

    function verifyProof(
        bool isSupported,
        address mentor,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) public returns (bool) {
        MindShare mindShare = MindShare(mindShareAttached());
        if (!isSupported) {
            mindShare.verifyMentor(mentor, true);
            return true;
        }

        // Now verify the provided proof is valid and the user is verified by World ID - will revert if invalid
        _worldId.verifyProof(
            root,
            _groupId,
            hashToField(abi.encodePacked(mentor)),
            nullifierHash,
            _externalNullifierHash,
            proof
        );

        mindShare.verifyMentor(mentor, true);
        return true;
    }

    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
    }
}
