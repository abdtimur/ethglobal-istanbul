// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IEAS} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {IAttester} from "../interfaces/IAttester.sol";

contract MockAttester is IAttester {
    bytes32 private immutable _schemaUID;

    IEAS private immutable _eas;

    constructor(IEAS eas, bytes32 schema) {
        _eas = eas;
        _schemaUID = schema;
    }

    function supportsEAS() external view override returns (bool) {
        return true;
    }

    function schemaUID() external view override returns (bytes32) {
        return _schemaUID;
    }

    function attest(
        bytes32 schema,
        bool isMentor,
        address recipient
    ) external returns (bytes32) {
        return
            0xacaa0b83df28b046b7763a16632540eef547611f29d6da5b0cce6494a5c884d2;
    }
}
