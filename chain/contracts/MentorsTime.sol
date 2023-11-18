// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

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

    uint256 private _nextSlotId = 0; // tracking the mint process

    constructor(
        address mentor_,
        string memory mentorName_,
        uint256 slotPrice_
    ) ERC721(mentorName_, "MTIME") {
        mentor = mentor_;
        slotPrice = slotPrice_;

        verifyHuman = false;
        verifyTLSN = false;
        verifyPoligonID = false;
        _nextSlotId = 0;
    }

    // add only mindShare
    function setVerifyHuman(bool verifyHuman_) public {
        verifyHuman = verifyHuman_;
        _chechFullyVerified();
    }

    // add only mindShare
    function setVerifyTLSN(bool verifyTLSN_) public {
        verifyTLSN = verifyTLSN_;
        _chechFullyVerified();
    }

    // add only mindShare
    function setVerifyPoligonID(bool verifyPoligonID_) public {
        verifyPoligonID = verifyPoligonID_;
        _chechFullyVerified();
    }

    function _chechFullyVerified() internal {
        allowedToMint = verifyHuman && verifyTLSN && verifyPoligonID;
    }

    function bookSlot(
        string memory slotExternalId_,
        string memory tokenURI
    ) public payable {
        // verify that slot is available (not taken before)
        require(slotIds[slotExternalId_] == 0, "Slot already taken");
        // TODO: verify the slot is not expired (in the future)

        // verify that value is correct (equal to slot price) -> lock value as escrow
        require(msg.value == slotPrice, "Incorrect value sent");
        deposited[msg.sender] += msg.value; // lock value as escrow

        // mint NFT to mentor
        _mint(mentor, _nextSlotId);
        _setTokenURI(_nextSlotId, tokenURI);
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
        return ""; // add IPFS json storage
    }

    function _setTokenURI(uint256 tokenId_, string memory tokenURI_) internal {
        tokenURIs[tokenId_] = tokenURI_;
    }
}
