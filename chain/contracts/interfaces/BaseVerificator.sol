// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface BaseVerificator {
    struct VerificationResult {
        bool success;
        string message;
    }

    function mindShareAttached() external view returns (address);
}
