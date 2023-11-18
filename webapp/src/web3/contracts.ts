import { PublicClient, WalletClient, getContract, zeroAddress } from "viem";
import {
  mentorsTimeABI,
  mindShareABI,
  worldIdVerificatorABI,
} from "../artifacts/abi";

const MINDSHARE_ADDRESS = "0x6215AAFD447d8ba4F15A807fc27b3F2CbfA11160";

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
    address: "0x0Dcb3222990b2e383e45f68d1448590eABB38B18",
    abi: worldIdVerificatorABI,
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
  const mentorsTimeAddress = await (
    mindShareContract as any
  ).read.getMentorCollection([mentor]);
  console.log("mentorsTimeAddress", mentorsTimeAddress);
  console.log(mentorsTimeAddress === zeroAddress)
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
  const address = await getMentorsTimeAddr({ publicClient, mindShare, mentor });

  return getMentorsTime({ publicClient, address, walletClient });
}
