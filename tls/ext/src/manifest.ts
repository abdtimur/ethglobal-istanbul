import type { Manifest } from "webextension-polyfill";
import pkg from "../package.json";

const manifest: Manifest.WebExtensionManifest = {
  manifest_version: 3,
  minimum_chrome_version: "116",
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "icon-34.png",
  },
  icons: {
    "128": "icon-128.png",
  },
  host_permissions: ["https://*/*"],
  permissions: [
    "background",
    "webRequest",
    "declarativeNetRequest",
    "tabs",
    "scripting",
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
    sandbox:
      "sandbox allow-scripts allow-forms allow-popups allow-modals; " +
      "script-src 'self' 'wasm-unsafe-eval'; " +
      "worker-src 'self' 'wasm-unsafe-eval' data: blob:; " +
      "child-src 'self' 'wasm-unsafe-eval';",
  },
  web_accessible_resources: [
    {
      resources: ["contentStyle.css", "icon-128.png", "icon-34.png"],
      matches: [],
    },
  ],
};

export default manifest;
