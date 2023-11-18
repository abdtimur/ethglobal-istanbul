import { ethers } from "hardhat";

export const fallbackFinalProof = {
  signed_content: {
    prove_utc_seconds: 1700316662,
    verify_utc_seconds: 1700316693,
    provider: "twitter",
    fact: '{"id":"VXNlcjoyMzM0NzIzNTg5","rest_id":"2334723589","legacy":{"created_at":"Sun Feb 09 07:35:13 +0000 2014","default_profile":true,"followers_count":67,"needs_phone_verification":false,"followed_by":null,"following":null}}',
  },
  signature:
    "0x1CDB0C226C048F38EAA8AF0CE23C981ED6C7EC913423C0434696617C6997C205A42A73EC56237FA061112F18F9DE76FC3C280305B13947EE83710DEF8365857844",
};

async function main() {
  const Tlsn = await ethers.getContractFactory("TlsnVerificator");
  const tlsnVerificator = await (
    await Tlsn.deploy(ethers.ZeroAddress)
  ).waitForDeployment();

  console.log("Tlsn deployed to:", tlsnVerificator.target);

  const serializedContent = JSON.stringify(fallbackFinalProof.signed_content);
  // Convert string to a hexadecimal string
  const hexContent = ethers.toUtf8Bytes(serializedContent);
  // Hash the content
  const hashed = ethers.keccak256(hexContent);

  const signature = fallbackFinalProof.signature;

  console.log("Hash:", hashed);
  console.log("Signature:", signature);

  tlsnVerificator
    .recoverSigner(hashed, ethers.getBytes(signature))
    .then((signer) => {
      console.log("Signer:", signer);
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
