import { PublicClient, WalletClient, getContract, zeroAddress } from "viem";
import {
  mentorsTimeABI,
  mindShareABI,
  tlsnVerificatorABI,
  worldIdVerificatorABI,
} from "../artifacts/abi";
import { CHAINS_CONFIGS_LIST, ChainConfig } from "./consts";

export async function getMindShare({
  publicClient,
  chainId,
  walletClient,
}: {
  publicClient: PublicClient;
  chainId: number;
  walletClient?: WalletClient;
}) {
  const chain: ChainConfig | undefined = CHAINS_CONFIGS_LIST.find(
    (c) => c.chainId === chainId
  );
  return getContract({
    publicClient,
    walletClient,
    address: chain!.mindshare,
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
  chainId,
  walletClient,
}: {
  publicClient: PublicClient;
  chainId: number;
  walletClient?: WC;
}) {
  const chain: ChainConfig | undefined = CHAINS_CONFIGS_LIST.find(
    (c) => c.chainId === chainId
  );
  return getContract({
    publicClient,
    walletClient,
    address: chain!.worldId,
    abi: worldIdVerificatorABI,
  });
}

export async function getTlsnVerificator<WC extends WalletClient>({
  publicClient,
  chainId,
  walletClient,
}: {
  publicClient: PublicClient;
  chainId: number;
  walletClient?: WC;
}) {
  const chain: ChainConfig | undefined = CHAINS_CONFIGS_LIST.find(
    (c) => c.chainId === chainId
  );
  return getContract({
    publicClient,
    walletClient,
    address: chain!.tlsn,
    abi: tlsnVerificatorABI,
  });
}

export async function getMentorsTimeAddr({
  publicClient,
  chainId,
  mentor,
}: {
  publicClient: PublicClient;
  chainId: number;
  mentor: `0x${string}`;
}) {
  const mindShareContract = await getMindShare({
    publicClient,
    chainId,
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
  chainId,
  mentor,
  walletClient,
}: {
  publicClient: PublicClient;
  chainId: number;
  mentor: `0x${string}`;
  walletClient?: WalletClient;
}) {
  const address = (await getMentorsTimeAddr({
    publicClient,
    chainId,
    mentor,
  })) as `0x${string}`;

  return getMentorsTime({ publicClient, address, walletClient });
}
