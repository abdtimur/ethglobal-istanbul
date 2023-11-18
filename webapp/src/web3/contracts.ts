import { PublicClient, WalletClient, getContract } from "viem";
import {
  mentorsTimeABI,
  mindShareABI,
  worldIdVerificatorABI,
} from "../artifacts/abi";

const MINDSHARE_ADDRESS = "0x964f552Bc7796E8f4e138d6F1585C7f692fF1335";

export async function getMindShare({
  publicClient,
  address= MINDSHARE_ADDRESS,
}: {
  publicClient: PublicClient;
  address?: `0x${string}`;
}) {
  return getContract({
    publicClient,
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

export async function getMentorsTimeForMentor({
  publicClient,
  mindShare= MINDSHARE_ADDRESS,
  mentor,
  walletClient,
}: {
  publicClient: PublicClient;
  mindShare?: `0x${string}`;
  mentor: `0x${string}`;
  walletClient?: WalletClient;
}) {
  const mindShareContract = await getMindShare({
    publicClient,
    address: mindShare,
  });
  const mentorsTimeAddress = await (
    mindShareContract as any
  ).read.getMentorCollection([mentor]);
  console.log("mentorsTimeAddress", mentorsTimeAddress);
  const mentorsCollectionaddr = mentorsTimeAddress[0];

  return getMentorsTime({ publicClient, address: mentorsCollectionaddr, walletClient });
}
