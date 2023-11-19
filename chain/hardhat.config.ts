import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",

  networks: {
    hardhat: {},
    localhost: {
      url: "http://localhost:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL ?? "https://rpc.sepolia.org/",
      accounts: [process.env.KEY_TESTIK!],
    },
    mumbai: {
      url: `https://rpc-mumbai.maticvigil.com`,
      accounts: [process.env.KEY_TESTIK!],
    },
    scrollSepolia: {
      url: "https://sepolia-rpc.scroll.io/" || "",
      accounts: [process.env.KEY_TESTIK!],
    },
    baseGoerli: {
      url: process.env.BASE_GOERLI_RPC_URL ?? "",
      accounts: [process.env.KEY_TESTIK!],
    },
    gnosisChiado: {
      url: "https://rpc.chiadochain.net",
      accounts: [process.env.KEY_TESTIK!],
      gasPrice: 1000000000,
    },
    zkEvmTestnet: {
      url: "https://rpc.public.zkevm-test.net",
      accounts: [process.env.KEY_TESTIK!],
    },
  },
};

export default config;
