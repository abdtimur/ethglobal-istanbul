// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {MentorsTime} from "./MentorsTime.sol";

contract MindShare is Ownable {

    uint256 private constant DEFAULT_SLOT_PRICE = 1000000000000000;  //  0.001
    
    mapping(address => address) private _mentorCollections; // mapping mentor_address => mentor_collection_address

    constructor() Ownable(msg.sender) {
    }

    struct SlotRequest {
        address buyer;
        string externalId;
        string jsonURI;
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
        MentorsTime newCollection = new MentorsTime(mentor, "MentorName", DEFAULT_SLOT_PRICE);

        // store collection address in mapping
        _mentorCollections[mentor] = address(newCollection);
        return address(newCollection);
    }

    function verifyMentor(address mentor, bytes32 proof) public {
        address collectionAddress = _mentorCollections[mentor];
        if (collectionAddress == address(0)) {
            collectionAddress = _registerMentor(mentor);
            // emit collection created event
        }
        MentorsTime collection = MentorsTime(collectionAddress);
        // process verification proof - get result

        collection.setVerifyHuman(true); // TODO: selective verification
    }

    function getMentorCollection(address mentor) public view returns (address) {
        return _mentorCollections[mentor];
    }
    
    // describe mentor config structure

    // mapping of verification_type -> verificator contract address 
}