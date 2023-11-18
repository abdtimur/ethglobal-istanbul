// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import {IEAS, AttestationRequest, AttestationRequestData} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {NO_EXPIRATION_TIME, EMPTY_UID} from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";
import {IAttester} from "../interfaces/IAttester.sol";

/// @title ExampleAttester
/// @notice Ethereum Attestation Service - Example
contract MindShareEASAttester is IAttester {
    bytes32 private immutable _schemaUID;

    // The address of the global EAS contract.
    IEAS private immutable _eas;

    /// @notice Creates a new ExampleAttester instance.
    /// @param eas The address of the global EAS contract.
    constructor(IEAS eas, bytes32 schema) {
        _eas = eas;
        _schemaUID = schema;
    }

    function schemaUID() external view override returns (bytes32) {
        return _schemaUID;
    }

    function supportsEAS() external view override returns (bool) {
        if (address(_eas) == address(0)) {
            return false;
        }
        return true;
    }

    /// @notice Attests to a schema that receives a uint32 and boolean parameters.
    /// @param schema The schema UID to attest to.
    /// @param isMentor The boolean parameter to attest to.
    /// @return The UID of the new attestation.
    function attest(
        bytes32 schema,
        bool isMentor,
        address recipient
    ) external returns (bytes32) {
        require(
            recipient != address(0),
            "MindShareEASAttester: recipient is the zero address"
        );
        require(
            address(_eas) != address(0),
            "MindShareEASAttester: EAS not supported"
        );

        return
            _eas.attest(
                AttestationRequest({
                    schema: schema,
                    data: AttestationRequestData({
                        recipient: recipient,
                        expirationTime: NO_EXPIRATION_TIME, // No expiration time
                        revocable: true,
                        refUID: EMPTY_UID, // No references UI
                        data: abi.encode(isMentor), // Encode a single uint256 as a parameter to the schema
                        value: 0 // No value/ETH
                    })
                })
            );
    }
}
