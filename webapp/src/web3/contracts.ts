import { PublicClient, WalletClient, getContract, zeroAddress } from "viem";
import {
  mentorsTimeABI,
  mindShareABI,
  tlsnVerificatorABI,
  worldIdVerificatorABI,
} from "../artifacts/abi";
import { MINDSHARE_ADDR, TLSN_ADDR, WORLDID_ADDR } from "./consts";

export async function getMindShare({
  publicClient,
  address = MINDSHARE_ADDR,
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
    address: WORLDID_ADDR,
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
    address: TLSN_ADDR,
    abi: tlsnVerificatorABI,
  });
}

export async function getMentorsTimeAddr({
  publicClient,
  mindShare = MINDSHARE_ADDR,
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
  mindShare = MINDSHARE_ADDR,
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
