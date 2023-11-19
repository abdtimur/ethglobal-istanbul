import { ethers } from "hardhat";
import {
  EAS_SCHEMA_SCROLL_SEPOLIA,
  EAS_SCROLL_SEPOLIA,
  WORLD_ID,
} from "./consts";

async function replace() {
  const mindShareContract = await ethers.getContractAt(
    "MindShare",
    "0xa9c715e2b231b5f2E3dA5463240F1f9C1E549c38"
  );

  console.log("Registering verificators...1");
  await mindShareContract.registerVerificator(
    "0x7525eD8c9fEC2556353B495ce0320A91efef42F8",
    1
  );

  console.log("Registering verificators...2");

  await mindShareContract.registerVerificator(
    "0x5Bf62bEd8fcEe466060C3C294C05A91e57f9F5Ca",
    2
  );

  console.log("Registering verificators...3");

  await mindShareContract.registerVerificator(
    "0x60a92f1a6FB111cB18599965971763CA9189109a",
    3
  );

  console.log(`Done!`);
}

async function main() {
  console.log("Deploying contracts...");

  const Attester = await ethers.getContractFactory("MindShareEASAttester");
  const attester = await (
    await Attester.deploy(EAS_SCROLL_SEPOLIA, EAS_SCHEMA_SCROLL_SEPOLIA)
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
replace().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
