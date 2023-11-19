export interface ChainConfig {
  chainId: number;
  mindshare: `0x${string}`;
  worldId: `0x${string}`;
  tlsn: `0x${string}`;
}

export const CHAINS_CONFIGS_LIST: ChainConfig[] = [
  {
    chainId: 11155111,
    mindshare: "0xeb1984603713C6df4E391738C89371bfCa860797",
    worldId: "0x914aF56e7bE74d6b51b438c90090B20c90FA7fBA",
    tlsn: "0x5A36AA738be4573223d7E95D5ee079E9964187c3",
  },
  {
    chainId: 80001,
    mindshare: "0x5B2FE8A69573321e858C0601e5443B36f4F0f1D7",
    worldId: "0xAbeadA01FDE4cb69B62d10636f124950Bcdf81D8",
    tlsn: "0x5a918c9961Db19Ea98Bb30EDD4e34A047db2d9e7",
  },
  {
    chainId: 534351,
    mindshare: "0xa9c715e2b231b5f2E3dA5463240F1f9C1E549c38",
    worldId: "0x7525eD8c9fEC2556353B495ce0320A91efef42F8",
    tlsn: "0x5Bf62bEd8fcEe466060C3C294C05A91e57f9F5Ca",
  },
  {
    chainId: 84531,
    mindshare: "0x52B1279634F08F4a9c2F79bf355F48952d9D711F",
    worldId: "0xc3E29Ee6429a08A907A29a445A36f14C5Fd71D82",
    tlsn: "0x3047E46d68c8507F35c81131f4Db5aCfae396E1d",
  },
  {
    chainId: 1442,
    mindshare: "0xEEF90A540E05c6531E2247B1b8a04faf7c1183aB",
    worldId: "0xc60022B6C71eB3e52DEbdBDd9F5f7798e5f26Dae",
    tlsn: "0x722F7a61d1a58d22bcEA95184a4FAadEe955F689",
  },
  {
    chainId: 10200,
    mindshare: "0xa9c715e2b231b5f2E3dA5463240F1f9C1E549c38",
    worldId: "0xEEF90A540E05c6531E2247B1b8a04faf7c1183aB",
    tlsn: "0xc60022B6C71eB3e52DEbdBDd9F5f7798e5f26Dae",
  },
];
