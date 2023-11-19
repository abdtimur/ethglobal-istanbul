import { ethers } from 'ethers';
import { mentorsTimeABI, mindShareABI } from '../artifacts/abi';
import { OptimisticMeetingAbi } from '../artifacts/umaAbi';

const rpcUrls = {
  80001: 'https://rpc-mumbai.maticvigil.com',
  5: 'https://eth-goerli.g.alchemy.com/v2/qzdLAg2Bk2ymTTQr7oxEvie2OynEwWLi',
  11155111:
    'https://eth-sepolia.g.alchemy.com/v2/qzdLAg2Bk2ymTTQr7oxEvie2OynEwWLi',
  84531:
    'https://base-goerli.g.alchemy.com/v2/qzdLAg2Bk2ymTTQr7oxEvie2OynEwWLi',
  534351: 'https://sepolia-rpc.scroll.io/',
  1442: 'https://rpc.public.zkevm-test.net',
  10200: 'https://rpc.chiadochain.net',
};

export const MINDSHARES = {
  80001: '0x5B2FE8A69573321e858C0601e5443B36f4F0f1D7',
  11155111: '0xeb1984603713C6df4E391738C89371bfCa860797',
  84531: '0x52B1279634F08F4a9c2F79bf355F48952d9D711F',
  534351: '0xa9c715e2b231b5f2E3dA5463240F1f9C1E549c38',
  1442: '0xEEF90A540E05c6531E2247B1b8a04faf7c1183aB',
  10200: '0xa9c715e2b231b5f2E3dA5463240F1f9C1E549c38',
};

export const CURRENCIES = {
  80001: 'MATIC',
  11155111: 'ETH',
  84531: 'ETH',
  534351: 'ETH',
  1442: 'ETH',
  10200: 'XDAI',
}

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
