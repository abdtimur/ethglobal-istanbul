pragma solidity 0.8.21;

import { IEAS, AttestationRequest, AttestationRequestData } from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import { NO_EXPIRATION_TIME, EMPTY_UID } from "@ethereum-attestation-service/eas-contracts/contracts/Common.sol";

/// @title ExampleAttester
/// @notice Ethereum Attestation Service - Example
contract MindShareEASAttester {
    error InvalidEAS();

    // The address of the global EAS contract.
    IEAS private immutable _eas;

    /// @notice Creates a new ExampleAttester instance.
    /// @param eas The address of the global EAS contract.
    constructor(IEAS eas) {
        if (address(eas) == address(0)) {
            revert InvalidEAS();
        }

        _eas = eas;
    }

    /// @notice Attests to a schema that receives a uint32 and boolean parameters.
    /// @param schema The schema UID to attest to.
    /// @param twitterFollowersCount The uint32 value to indicate the number of followers.
    /// @param ownsTwitterAccount The boolean value indicating ownership of Twitter account
    /// @return The UID of the new attestation.
    function attestUint(bytes32 schema, uint32 twitterFollowersCount, bool ownsTwitterAccount, address recipient ) external returns (bytes32) {
        return
            _eas.attest(
            AttestationRequest({
                schema: schema,
                data: AttestationRequestData({
                recipient: recipient, 
                expirationTime: NO_EXPIRATION_TIME, // No expiration time
                revocable: true,
                refUID: EMPTY_UID, // No references UI
                data: abi.encode(twitterFollowersCount,ownsTwitterAccount ), // Encode a single uint256 as a parameter to the schema
                value: 0 // No value/ETH
            })
            })
        );
    }
}