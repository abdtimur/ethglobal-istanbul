import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./polyfills.ts";
import { BrowserRouter } from "react-router-dom";
import { WagmiConfig } from "wagmi";
import { chains, wagmiConfig } from "./web3configs.ts";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        modalSize="compact"
        appInfo={{
          appName: "MindShare",
        }}
        theme={darkTheme({
          accentColor: "oklch(var(--s))",
          accentColorForeground: "oklch(var(--ac))",
        })}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
