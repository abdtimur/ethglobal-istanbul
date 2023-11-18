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
    zkEVM: {
      url: `https://rpc.public.zkevm-test.net`,
      accounts: [process.env.KEY_TESTIK!],
    },
  },
};

export default config;
