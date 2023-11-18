import { ethers } from "hardhat";
import { EAS_SCHEMA_SEPOLIA, EAS_SEPOLIA, WORLD_ID_MUMBAI } from "./consts";

async function onlyMindShare() {
  const worldIdVerificator = await ethers.getContractAt(
    "WorldIdVerificator",
    "0x914aF56e7bE74d6b51b438c90090B20c90FA7fBA"
  );
  const tlsnVerificator = await ethers.getContractAt(
    "TlsnVerificator",
    "0x5A36AA738be4573223d7E95D5ee079E9964187c3"
  );
  const polygonIdVerificator = await ethers.getContractAt(
    "PolygonIdVerificator",
    "0x7FBdF00baC751F27F9F255450f691e660fa89A89"
  );

  console.log("Deploying contracts...");

  const Attester = await ethers.getContractFactory("MindShareEASAttester");
  const attester = await (
    await Attester.deploy(EAS_SEPOLIA, EAS_SCHEMA_SEPOLIA)
  ).waitForDeployment();

  console.log("Attester deployed to:", attester.target);

  const MindShare = await ethers.getContractFactory("MindShare");
  const mindShareContract = await (
    await MindShare.deploy(attester.target)
  ).waitForDeployment();

  console.log("MindShare deployed to:", mindShareContract.target);

  console.log("Registering verificators...");
  await mindShareContract.registerVerificator(worldIdVerificator.target, 1);

  await mindShareContract.registerVerificator(tlsnVerificator.target, 2);

  await mindShareContract.registerVerificator(polygonIdVerificator.target, 3);

  console.log(`Done!`);
}

async function replace() {
  const mindShareContract = await ethers.getContractAt(
    "MindShare",
    "0x88FE8846A6a408F5477f68cACe9f50f911E3BfD7"
  );

  const Tlsn = await ethers.getContractFactory("TlsnVerificator");
  const tlsnVerificator = await (
    await Tlsn.deploy(mindShareContract.target)
  ).waitForDeployment();

  console.log("Tlsn deployed to:", tlsnVerificator.target);

  await mindShareContract.registerVerificator(tlsnVerificator.target, 2);

  console.log(`Done!`);
}

async function main() {
  console.log("Deploying contracts...");

  const Attester = await ethers.getContractFactory("MindShareEASAttester");
  const attester = await (
    await Attester.deploy(EAS_SEPOLIA, EAS_SCHEMA_SEPOLIA)
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
    await WorldID.deploy(mindShareContract.target, WORLD_ID_MUMBAI)
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
