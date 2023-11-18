// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {MindShare} from "./MindShare.sol";

contract MentorsTime is ERC721 {
    address public mentor;
    uint256 public slotPrice;
    mapping(uint256 slotId => string) private tokenURIs; // IPFS json storage
    mapping(uint256 slotId => address) private slotBuyers; // non-zero address when booked
    mapping(string slotExternalId => uint256) private slotIds;
    mapping(address buyer => uint256) private deposited; // for internal accounting

    bool public verifyHuman;
    bool public verifyTLSN;
    bool public verifyPoligonID;
    bool public allowedToMint;

    uint256 private _nextSlotId; // tracking the mint process

    MindShare private _mindShare;

    string private _mentorName;

    modifier onlyMentorOrMindShare() {
        require(
            msg.sender == mentor || msg.sender == address(_mindShare),
            "MindShare: caller is not verificator"
        );
        _;
    }

    constructor(
        address mentor_,
        MindShare mindShare_,
        string memory mentorName_,
        uint256 slotPrice_
    ) ERC721(mentorName_, "MTIME") {
        mentor = mentor_;
        _mindShare = mindShare_;
        slotPrice = slotPrice_;
        _mentorName = mentorName_;

        verifyHuman = false;
        verifyTLSN = false;
        verifyPoligonID = false;
        allowedToMint = true; // workaround for the first demo
        _nextSlotId = 1;
    }

    function changeName(
        string memory mentorName_
    ) public onlyMentorOrMindShare {
        _mentorName = mentorName_;
    }

    function name() public view override returns (string memory) {
        return _mentorName;
    }

    // add only mindShare
    function setVerifyHuman(bool verifyHuman_) public onlyMentorOrMindShare {
        verifyHuman = verifyHuman_;
        _chechFullyVerified();
    }

    // add only mindShare
    function setVerifyTLSN(bool verifyTLSN_) public onlyMentorOrMindShare {
        verifyTLSN = verifyTLSN_;
        _chechFullyVerified();
    }

    // add only mindShare
    function setVerifyPoligonID(
        bool verifyPoligonID_
    ) public onlyMentorOrMindShare {
        verifyPoligonID = verifyPoligonID_;
        _chechFullyVerified();
    }

    function _chechFullyVerified() internal {
        allowedToMint = true;
        // allowedToMint = verifyHuman && verifyTLSN && verifyPoligonID;
    }

    function bookSlot(
        string memory slotExternalId_,
        string memory tokenURI_
    ) public payable {
        // verify that slot is available (not taken before)
        require(slotIds[slotExternalId_] == 0, "Slot already taken");
        // TODO: verify the slot is not expired (in the future)

        // verify that value is correct (equal to slot price) -> lock value as escrow
        require(msg.value == slotPrice, "Incorrect value sent");
        deposited[msg.sender] += msg.value; // lock value as escrow

        // mint NFT to mentor
        _mint(mentor, _nextSlotId);
        _setTokenURI(_nextSlotId, tokenURI_);
        slotIds[slotExternalId_] = _nextSlotId;
        slotBuyers[_nextSlotId] = msg.sender;
        _nextSlotId++;
    }

    function registerMeetingEnd(
        string memory slotExternalId_,
        uint256 duration_
    ) public {
        uint256 slotId = slotIds[slotExternalId_];
        require(slotId != 0, "Slot not found");

        address buyer = slotBuyers[slotId];
        require(buyer != address(0), "Slot not booked");

        require(
            duration_ > 0,
            "Duration must be positive, to register meeting end"
        );

        require(
            address(this).balance >= slotPrice,
            "Not enough funds to pay for slot"
        );
        require(ownerOf(slotId) == mentor, "Slot not owned by mentor");

        _transfer(mentor, buyer, slotId);
        (bool success, ) = mentor.call{value: slotPrice}("");
        require(success, "Transfer to mentor failed.");

        // emit event of meeting end registered
    }

    function _baseURI() internal view override returns (string memory) {
        return "mindshare:"; // add IPFS json storage
    }

    function _setTokenURI(uint256 tokenId_, string memory tokenURI_) internal {
        tokenURIs[tokenId_] = tokenURI_;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory baseURI = _baseURI();
        return
            bytes(baseURI).length > 0
                ? string.concat(baseURI, tokenURIs[tokenId])
                : "";
    }
}
