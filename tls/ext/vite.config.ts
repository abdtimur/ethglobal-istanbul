import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { defineConfig } from "vite";
import makeManifest from "./utils/plugins/make-manifest";
import buildContentScript from "./utils/plugins/build-content-script";
import { outputFolderName } from "./utils/constants";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import omt from "@surma/rollup-plugin-off-main-thread";

const root = resolve(__dirname, "src");
const pagesDir = resolve(root, "pages");
const assetsDir = resolve(root, "assets");
const outDir = resolve(__dirname, outputFolderName);
const publicDir = resolve(__dirname, "public");

export default defineConfig({
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir,
    },
  },
  plugins: [
    react(),
    makeManifest(),
    buildContentScript(),
    wasm(),
    topLevelAwait(),
    omt(),
  ],
  publicDir,
  build: {
    outDir,
    sourcemap: process.env.__DEV__ === "true",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        background: resolve(pagesDir, "background", "index.ts"),
        msg: resolve(pagesDir, "msg", "msg.ts"),
        popup: resolve(pagesDir, "popup", "index.html"),
      },
      output: {
        entryFileNames: (chunk) => `src/pages/${chunk.name}/index.js`,
        format: "esm",
      },
    },
  },
});
