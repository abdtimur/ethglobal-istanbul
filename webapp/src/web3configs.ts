import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  braveWallet,
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
  CHAIN_NAMESPACES,
  LoginMethodConfig,
  WALLET_ADAPTERS,
} from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
// import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Chain, configureChains, createConfig, sepolia } from "wagmi";
import {
  polygonMumbai,
  baseGoerli,
  scrollSepolia,
} from "wagmi/chains";
import LOGO from "./assets/google.png";

import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";

const NAME = "MindShare";

const WC_PROJECT_ID = "69b67f11efec451f5be58fe541681209";
const WEB3ATUH_CLIENT_ID =
  "BKbSNUgwHxX8OST2UavN8SGzBptWk670aeHLZMdbyC2A1mHQH4Gsm8eu6Kv_IN_en5j68RhAomSXUbs-4nHMPBk";


const { chains, publicClient } = configureChains(
  [sepolia, polygonMumbai, baseGoerli, scrollSepolia], // arbitrum?, polygonZkEvmTestnet, gnosisChiado,
  [
    alchemyProvider({ apiKey: '9lUw-xFV6s1Z1pX7NVEyQ1JlY2aYhp9o' }),
    publicProvider(),
  ]
);

function newWeb3AuthInstance({
  chains,
  loginMethodsOrder,
}: {
  chains: Chain[];
  loginMethodsOrder: string[];
}) {
  const auth = new Web3Auth({
    clientId: WEB3ATUH_CLIENT_ID,
    web3AuthNetwork: "sapphire_devnet",
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: `0x${chains[0].id.toString(16)}`,
      displayName: chains[0].name,
      tickerName: chains[0].nativeCurrency.name,
      ticker: chains[0].nativeCurrency.symbol,
      blockExplorer: chains[0].blockExplorers?.default.url,
    },
    uiConfig: {
      loginMethodsOrder,
      defaultLanguage: "en",
      modalZIndex: "2147483647",
      appName: NAME,
    },
  });
  // const openLoginAdapter = new OpenloginAdapter({
  //   adapterSettings: {
  //     uxMode: 'redirect',
  //   },
  // });
  // auth.configureAdapter(openLoginAdapter);
  return auth;
}

const defaultModalConfig = {
  [WALLET_ADAPTERS.WALLET_CONNECT_V2]: {
    label: "WalletConnect v2",
    showOnModal: false,
  },
  [WALLET_ADAPTERS.TORUS_EVM]: {
    label: "Torus",
    showOnModal: false,
  },
  [WALLET_ADAPTERS.METAMASK]: {
    label: "Metamask",
    showOnModal: false,
  },
  [WALLET_ADAPTERS.COINBASE]: {
    label: "Coinbase",
    showOnModal: false,
  },
};

const WEB3AUTH_LOGIN_METHODS = ["google", "apple", "email_passwordless"];

const web3AuthWallet = {
  id: "web3auth-email-or-phone",
  name: "Email",
  iconUrl: LOGO,
  iconBackground: "#fff",
  createConnector: () => ({
    connector: new Web3AuthConnector({
      chains,
      options: {
        web3AuthInstance: newWeb3AuthInstance({
          chains,
          loginMethodsOrder: WEB3AUTH_LOGIN_METHODS,
        }),
        modalConfig: {
          ...defaultModalConfig,
          [WALLET_ADAPTERS.OPENLOGIN]: {
            label: "Social",
            loginMethods: WEB3AUTH_LOGIN_METHODS.reduce(
              (acc: LoginMethodConfig, method) => {
                acc[method] = {
                  name: method.toUpperCase(),
                  mainOption: true,
                  showOnModal: true,
                };
                return acc;
              },
              {}
            ),
          },
        },
      },
    }),
  }),
};

const connectors = connectorsForWallets([
  { groupName: "web3Auth", wallets: [web3AuthWallet] },
  {
    groupName: "Connect Wallet",
    wallets: [
      braveWallet({ chains }),
      metaMaskWallet({ chains, projectId: WC_PROJECT_ID }),
      coinbaseWallet({ appName: "Wingman", chains }),
      walletConnectWallet({ chains, projectId: WC_PROJECT_ID }),
      rainbowWallet({ chains, projectId: WC_PROJECT_ID }),
      safeWallet({ chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export { wagmiConfig, chains };
