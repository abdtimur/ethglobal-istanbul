// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IAttester {
    function supportsEAS() external view returns (bool);

    function schemaUID() external view returns (bytes32);

    function attest(
        bytes32 schema,
        bool isMentor,
        address recipient
    ) external returns (bytes32);
}
