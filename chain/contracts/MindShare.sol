// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {MentorsTime} from "./MentorsTime.sol";

contract MindShare is Ownable {
    enum Verificator {
        None,
        WorldId,
        Tlsn,
        PolygonId
    }

    uint256 private constant DEFAULT_SLOT_PRICE = 1000000000000000; //  0.001

    mapping(address => address) private _mentorCollections; // mapping mentor_address => mentor_collection_address

    mapping(address verificator => Verificator) private _verificators; // mapping verificator_address => verificator_type

    struct SlotRequest {
        address buyer;
        string externalId;
        string jsonURI;
    }

    modifier onlyVerificator() {
        require(
            _verificators[msg.sender] != Verificator.None ||
                msg.sender == owner(),
            "MindShare: caller is not verificator"
        );
        _;
    }

    constructor() Ownable(msg.sender) {}

    function registerVerificator(
        address verificator,
        uint256 type_
    ) public onlyOwner {
        _verificators[verificator] = Verificator(type_);
    }

    function buySlot(address mentor, SlotRequest memory slotRequest) public {
        // verify that slot is available
        // verify that slot is not expired
        // verify that value is correct
        // lock value as escrow
        // transfer NFT to buyer
    }

    function _registerMentor(address mentor) public returns (address) {
        // create new collection
        MentorsTime newCollection = new MentorsTime(
            mentor,
            this, // mindShare
            "MentorName",
            DEFAULT_SLOT_PRICE
        );

        // store collection address in mapping
        _mentorCollections[mentor] = address(newCollection);
        return address(newCollection);
    }

    function verifyMentor(address mentor, bool status) public onlyVerificator {
        address collectionAddress = _mentorCollections[mentor];
        if (collectionAddress == address(0)) {
            collectionAddress = _registerMentor(mentor);
            // emit collection created event
        }
        MentorsTime collection = MentorsTime(collectionAddress);

        // process verification proof - get result
        Verificator verificator = _verificators[msg.sender];
        require(
            verificator != Verificator.None,
            "MindShare: verificator not registered"
        );

        // TODO: change to call for method byt selector
        if (verificator == Verificator.WorldId) {
            collection.setVerifyHuman(status);
        }
        if (verificator == Verificator.Tlsn) {
            collection.setVerifyTLSN(status);
        }
        if (verificator == Verificator.PolygonId) {
            collection.setVerifyPoligonID(status);
        }
    }

    function getMentorCollection(address mentor) public view returns (address) {
        return _mentorCollections[mentor];
    }

    // describe mentor config structure
}
