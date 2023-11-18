import { ethers } from 'ethers';
import { mentorsTimeABI, mindShareABI } from '../artifacts/abi';
import { OptimisticMeetingAbi } from '../artifacts/umaAbi';

const rpcUrls = {
  80001: 'https://rpc-mumbai.maticvigil.com',
  5: 'https://eth-goerli.g.alchemy.com/v2/qzdLAg2Bk2ymTTQr7oxEvie2OynEwWLi',
};

export function getProvider(chainId: number) {
  const chainRpc = rpcUrls[chainId];

  return new ethers.JsonRpcProvider(chainRpc);
}

export async function getAdjustedGasPrice(chainId: number) {
  const chainRpc = rpcUrls[chainId];

  // Request gas price from the chain via JSON RPC
  const request = {
    method: 'eth_gasPrice',
    params: [],
    id: 1,
    jsonrpc: '2.0',
  };
  const response = await fetch(chainRpc, {
    body: JSON.stringify(request),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const responseData = await response.json();
  const gasPrice = responseData.result;

  // The gas price (in wei)...
  const adjustedGasPrice = (BigInt(gasPrice) * 110n) / 100n; // 10% higher than the current gas price
  console.log(
    `Gas now is : ${ethers.formatUnits(
      gasPrice,
      'gwei',
    )} gwei. Adding 10% to ensure transaction goes through`,
  );
  return adjustedGasPrice;
}

export function getSignerWallet(chainId: number) {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error(`Web3ProviderService: Private key not found`);
    throw new Error(`Private key not found`);
  }

  return new ethers.Wallet(privateKey, getProvider(chainId));
}

export function getMentorsTime(
  address: string,
  chainId: number,
  runner?: ethers.Signer | ethers.Provider,
): ethers.Contract {
  return new ethers.Contract(
    address,
    mentorsTimeABI,
    runner ?? getProvider(chainId),
  );
}

export async function getMentorsTimeByMentorAddress(
  address: string,
  mentor: string,
  chainId: number,
  runner?: ethers.Signer | ethers.Provider,
): Promise<ethers.Contract> {
  const mindShare = getMindShare(address, chainId, runner);
  const mentorsTimeAddress = await mindShare.getMentorCollection(mentor);

  return getMentorsTime(mentorsTimeAddress, chainId, runner);
}

export function getUmaOracle(
  address: string,
  chainId: number,
  runner?: ethers.Signer | ethers.Provider,
): ethers.Contract {
  return new ethers.Contract(
    address,
    OptimisticMeetingAbi,
    runner ?? getProvider(chainId),
  );
}

export function getMindShare(
  address: string,
  chainId: number,
  runner?: ethers.Signer | ethers.Provider,
): ethers.Contract {
  return new ethers.Contract(
    address,
    mindShareABI,
    runner ?? getProvider(chainId),
  );
}
