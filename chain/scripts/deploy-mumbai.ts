import { ethers } from "hardhat";
import { EAS_MUMBAI, EAS_SCHEMA_MUMBAI, WORLD_ID } from "./consts";

async function main() {
  console.log("Deploying contracts...");

  const Attester = await ethers.getContractFactory("MindShareEASAttester");
  const attester = await (
    await Attester.deploy(EAS_MUMBAI, EAS_SCHEMA_MUMBAI)
  ).waitForDeployment();

  console.log("Attester deployed to:", attester.target);

  const MindShare = await ethers.getContractFactory("MindShare");
  const mindShareContract = await (
    await MindShare.deploy(attester.target)
  ).waitForDeployment();

  console.log("MindShare deployed to:", mindShareContract.target);

  // deploy verificators and set them to MindShare
  const WorldID = await ethers.getContractFactory("WorldIdVerificator");
  const worldIdVerificator = await (
    await WorldID.deploy(mindShareContract.target, WORLD_ID)
  ).waitForDeployment();

  console.log("WorldID deployed to:", worldIdVerificator.target);

  const Tlsn = await ethers.getContractFactory("TlsnVerificator");
  const tlsnVerificator = await (
    await Tlsn.deploy(mindShareContract.target)
  ).waitForDeployment();

  console.log("Tlsn deployed to:", tlsnVerificator.target);

  const PolygonId = await ethers.getContractFactory("PolygonIdVerificator");
  const polygonIdVerificator = await (
    await PolygonId.deploy(mindShareContract.target)
  ).waitForDeployment();

  console.log("PolygonId deployed to:", polygonIdVerificator.target);

  console.log("Registering verificators...");
  await mindShareContract.registerVerificator(worldIdVerificator.target, 1);

  await mindShareContract.registerVerificator(tlsnVerificator.target, 2);

  await mindShareContract.registerVerificator(polygonIdVerificator.target, 3);

  console.log(`Done!`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
