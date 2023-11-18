import { PublicClient, WalletClient, getContract, zeroAddress } from "viem";
import {
  mentorsTimeABI,
  mindShareABI,
  tlsnVerificatorABI,
  worldIdVerificatorABI,
} from "../artifacts/abi";

const MINDSHARE_ADDRESS = "0xEBB0057E6045132ed1Bad6844Eea19825d17a454";

export async function getMindShare({
  publicClient,
  address = MINDSHARE_ADDRESS,
  walletClient,
}: {
  publicClient: PublicClient;
  address?: `0x${string}`;
  walletClient?: WalletClient;
}) {
  return getContract({
    publicClient,
    walletClient,
    address,
    abi: mindShareABI,
  });
}

export async function getMentorsTime({
  publicClient,
  address,
  walletClient,
}: {
  publicClient: PublicClient;
  address: `0x${string}`;
  walletClient?: WalletClient;
}) {
  return getContract({
    publicClient,
    walletClient,
    address,
    abi: mentorsTimeABI,
  });
}

export async function getWorldIdVerificator<WC extends WalletClient>({
  publicClient,
  walletClient,
}: {
  publicClient: PublicClient;
  walletClient?: WC;
}) {
  return getContract({
    publicClient,
    walletClient,
    address: "0xdFB93e30DB6A3970b939ab4a007631dc045f6FDf",
    abi: worldIdVerificatorABI,
  });
}

export async function getTlsnVerificator<WC extends WalletClient>({
  publicClient,
  walletClient,
}: {
  publicClient: PublicClient;
  walletClient?: WC;
}) {
  return getContract({
    publicClient,
    walletClient,
    address: "0xe01D33a984850028bd00799DcD36fD628F997445",
    abi: tlsnVerificatorABI,
  });
}

export async function getMentorsTimeAddr({
  publicClient,
  mindShare = MINDSHARE_ADDRESS,
  mentor,
}: {
  publicClient: PublicClient;
  mindShare?: `0x${string}`;
  mentor: `0x${string}`;
}) {
  const mindShareContract = await getMindShare({
    publicClient,
    address: mindShare,
  });
  console.log(mindShareContract);
  const mentorsTimeAddress = await mindShareContract.read.getMentorCollection([
    mentor,
  ]);
  console.log("mentorsTimeAddress", mentorsTimeAddress);
  console.log(mentorsTimeAddress === zeroAddress);
  return mentorsTimeAddress;
}

export async function getMentorsTimeForMentor({
  publicClient,
  mindShare = MINDSHARE_ADDRESS,
  mentor,
  walletClient,
}: {
  publicClient: PublicClient;
  mindShare?: `0x${string}`;
  mentor: `0x${string}`;
  walletClient?: WalletClient;
}) {
  const address = (await getMentorsTimeAddr({
    publicClient,
    mindShare,
    mentor,
  })) as `0x${string}`;

  return getMentorsTime({ publicClient, address, walletClient });
}
