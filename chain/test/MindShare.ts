import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EAS_SEPOLIA } from "../scripts/consts";
const fallbackFinalProof = {
  signed_content: {
    prove_utc_seconds: 1700316662,
    verify_utc_seconds: 1700316693,
    provider: "twitter",
    fact: '{"id":"VXNlcjoyMzM0NzIzNTg5","rest_id":"2334723589","legacy":{"created_at":"Sun Feb 09 07:35:13 +0000 2014","default_profile":true,"followers_count":67,"needs_phone_verification":false,"followed_by":null,"following":null}}',
  },
  signature:
    "0x1CDB0C226C048F38EAA8AF0CE23C981ED6C7EC913423C0434696617C6997C205A42A73EC56237FA061112F18F9DE76FC3C280305B13947EE83710DEF8365857844",
};

describe("Fellow Deal Tests", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMindShare() {
    // Contracts are deployed using the first signer/account by default
    const [owner, mentor, buyer, server] = await ethers.getSigners();

    // deploy mock attester first
    const MockAttester = await ethers.getContractFactory("MockAttester");
    const mockAttester = await (
      await MockAttester.connect(owner).deploy(
        EAS_SEPOLIA,
        "0xacaa0b83df28b046b7763a16632540eef547611f29d6da5b0cce6494a5c884d2"
      )
    ).waitForDeployment();

    const MindShare = await ethers.getContractFactory("MindShare");
    const mindShareContract = await (
      await MindShare.connect(owner).deploy(mockAttester.target)
    ).waitForDeployment();

    // deploy verificators and set them to MindShare
    const WorldID = await ethers.getContractFactory("WorldIdVerificator");
    const worldIdVerificator = await (
      await WorldID.connect(owner).deploy(
        mindShareContract.target,
        "0x719683F13Eeea7D84fCBa5d7d17Bf82e03E3d260"
      )
    ).waitForDeployment();

    const Tlsn = await ethers.getContractFactory("TlsnVerificator");
    const tlsnVerificator = await (
      await Tlsn.connect(owner).deploy(mindShareContract.target)
    ).waitForDeployment();

    const PolygonId = await ethers.getContractFactory("PolygonIdVerificator");
    const polygonIdVerificator = await (
      await PolygonId.connect(owner).deploy(mindShareContract.target)
    ).waitForDeployment();

    await mindShareContract.connect(mentor).registerMentor("lolchto");
    const getCollectionAddr = await mindShareContract.getMentorCollection(
      mentor.address
    );
    const mentorsTimeFirst = await ethers.getContractAt(
      "MentorsTime",
      getCollectionAddr
    );
    const name = await mentorsTimeFirst.name();
    expect(name).to.equal("lolchto");

    // check that minting is possible
    // const mintingPossible = await mentorsTimeFirst.allowedToMint();
    // expect(mintingPossible).to.equal(true);

    await mindShareContract
      .connect(owner)
      .registerVerificator(worldIdVerificator.target, 1);
    await mindShareContract
      .connect(owner)
      .registerVerificator(tlsnVerificator.target, 2);
    await mindShareContract
      .connect(owner)
      .registerVerificator(polygonIdVerificator.target, 3);

    await worldIdVerificator
      .connect(mentor)
      .verifyProof(false, mentor.address, 1234, 1234, [1, 2, 3, 4, 5, 6, 7, 8]);

    return {
      mindShareContract,
      mentorsTimeFirst,
      worldIdVerificator,
      tlsnVerificator,
      polygonIdVerificator,
      owner,
      mentor,
      buyer,
      server,
    };
  }

  describe("Deployment", function () {
    it("Should deploy correctly", async function () {
      const { mindShareContract, mentorsTimeFirst, owner, mentor } =
        await loadFixture(deployMindShare);

      const getCollectionAddr = await mindShareContract.getMentorCollection(
        mentor.address
      );

      expect(getCollectionAddr).to.equal(mentorsTimeFirst.target);

      const realOwner = await mindShareContract.owner();
      expect(realOwner).to.equal(owner.address);

      const humanVerified = await mentorsTimeFirst.verifyHuman();
      expect(humanVerified).to.equal(true); // world id passed on minting
    });
  });

  describe("Golden Path", function () {
    //
    it("Should path the golden path", async function () {
      const {
        mindShareContract,
        mentorsTimeFirst,
        tlsnVerificator,
        polygonIdVerificator,
        owner,
        mentor,
        buyer,
      } = await loadFixture(deployMindShare);
      // collection already created and worldId verified

      // verify tlsn
      const serializedContent = JSON.stringify(
        fallbackFinalProof.signed_content
      );
      // Convert string to a hexadecimal string
      const hexContent = ethers.toUtf8Bytes(serializedContent);
      // Hash the content
      const hashed = ethers.keccak256(hexContent);
      await tlsnVerificator
        .connect(mentor)
        .verifyProof(
          true,
          mentor.address,
          hashed,
          ethers.getBytes(fallbackFinalProof.signature)
        );
      const tlsnVerified = await mentorsTimeFirst.verifyTLSN();
      expect(tlsnVerified).to.equal(true);

      const attestationAvailable = await mindShareContract.supportsEAS();
      expect(attestationAvailable).to.equal(true);
      const attestationUID = await mentorsTimeFirst.getAttestationUID();
      expect(attestationUID).to.equal(
        "0xacaa0b83df28b046b7763a16632540eef547611f29d6da5b0cce6494a5c884d2"
      );

      // verify polygon
      await polygonIdVerificator
        .connect(mentor)
        .verifyProof(false, mentor.address);
      const polygonVerified = await mentorsTimeFirst.verifyPoligonID();
      expect(polygonVerified).to.equal(true);

      // check that minting is possible
      const mintingPossible = await mentorsTimeFirst.allowedToMint();
      expect(mintingPossible).to.equal(true);

      // now, we can alllow buyer to book a slot
      await mentorsTimeFirst
        .connect(buyer)
        .bookSlot("uuid-1", "ipfs:json", { value: ethers.parseEther("0.001") });
      const checkOwner = await mentorsTimeFirst.ownerOf(1); // mentor should be owner of the first slot
      expect(checkOwner).to.equal(mentor.address);
      const tokenURI = await mentorsTimeFirst.tokenURI(1);
      expect(tokenURI).to.equal("mindshare:ipfs:json");
      // check balance changed
      const balance = await ethers.provider.getBalance(mentorsTimeFirst.target);
      expect(balance).to.equal(ethers.parseEther("0.001"));
      const mentorBalance = await ethers.provider.getBalance(mentor.address);

      // now we can finish the zoom meeting and complete the slot
      await mentorsTimeFirst.connect(buyer).registerMeetingEnd("uuid-1", 10); // 10 minutes
      const checkOwner1 = await mentorsTimeFirst.ownerOf(1); // buyer should become the owner of the first slot
      expect(checkOwner1).to.equal(buyer.address);
      // check balance changed
      const balance1 = await ethers.provider.getBalance(
        mentorsTimeFirst.target
      );
      expect(balance1).to.equal(ethers.parseEther("0.000"));
      // check balance changed
      const balance2 = await ethers.provider.getBalance(mentor.address);
      expect(balance2 - mentorBalance).to.equal(ethers.parseEther("0.001"));
    });
  });
});
