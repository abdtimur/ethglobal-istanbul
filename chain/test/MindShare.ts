import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Fellow Deal Tests", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMindShare() {
    // Contracts are deployed using the first signer/account by default
    const [owner, mentor, buyer, server] = await ethers.getSigners();

    const MindShare = await ethers.getContractFactory("MindShare");
    const mindShareContract = await (
      await MindShare.connect(owner).deploy()
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

    const getCollectionAddr = await mindShareContract.getMentorCollection(
      mentor.address
    );
    const mentorsTimeFirst = await ethers.getContractAt(
      "MentorsTime",
      getCollectionAddr
    );

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
  });
});
