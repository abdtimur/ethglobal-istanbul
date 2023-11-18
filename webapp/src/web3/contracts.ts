import { PublicClient, WalletClient, getContract, zeroAddress } from "viem";
import {
  mentorsTimeABI,
  mindShareABI,
  tlsnVerificatorABI,
  worldIdVerificatorABI,
} from "../artifacts/abi";

const MINDSHARE_ADDRESS = "0x88FE8846A6a408F5477f68cACe9f50f911E3BfD7";

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
    address: "0x557C8C32FFACaaB85050f8575929Dafb0F3dB8bA",
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
    address: "0xd86855cB14B0262395F9B63aD7a1e60929308aA3",
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
