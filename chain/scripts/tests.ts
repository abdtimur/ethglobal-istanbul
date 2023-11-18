import { ethers } from "hardhat";
import { EAS_SCHEMA_SEPOLIA, EAS_SEPOLIA, WORLD_ID_MUMBAI } from "./consts";

async function onlyMindShare() {

  const MindShare = await ethers.getContractAt("MindShare", "0xF15F2CD96Ba76dA6e6997a609A59993f4E3CFE91");
 
  const address = await MindShare.getMentorCollection("0x76e7DB3Ee732c3C668b4B78B7D0643339C63493e");

  console.log(address);
}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
onlyMindShare().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
