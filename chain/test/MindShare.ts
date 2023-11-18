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

    await mindShareContract
      .connect(mentor)
      .verifyMentor(mentor.address, ethers.encodeBytes32String("Myproof"));
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
    });
  });
});
