import { PublicClient, WalletClient, getContract } from "viem";
import {
  mentorsTimeABI,
  mindShareABI,
  worldIdVerificatorABI,
} from "../artifacts/abi";

export async function getMindShare({
  publicClient,
  address,
}: {
  publicClient: PublicClient;
  address: `0x${string}`;
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
}: {
  publicClient: PublicClient;
  address: `0x${string}`;
}) {
  return getContract({
    publicClient,
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
  mindShare,
  mentor,
}: {
  publicClient: PublicClient;
  mindShare: `0x${string}`;
  mentor: `0x${string}`;
}) {
  const mindShareContract = await getMindShare({
    publicClient,
    address: mindShare,
  });
  const mentorsTimeAddress = await (
    mindShareContract as any
  ).read.getMentorCollection([mentor]);
  const mentorsCollectionaddr = mentorsTimeAddress[0];

  return getMentorsTime({ publicClient, address: mentorsCollectionaddr });
}
