import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-svelte"],
  svelte: {
    vite: {
      compilerOptions: {
        runes: true,
      },
    },
  },
  manifest: {
    name: "Corgi",
    description: "Theming engine and plugin API for Kagi",
    browser_specific_settings: {
      gecko: {
        id: "corgi@aluminyoom",
        strict_min_version: "140.0",
        // @ts-expect-error WXT types don't yet include data_collection_permissions (Firefox 140+)
        data_collection_permissions: {
          required: ["none"],
        },
      },
    },
    permissions: ["storage", "declarativeNetRequest"],
    icons: {
      16: "/icon-16.png",
      32: "/icon-32.png",
      48: "/icon-48.png",
      128: "/icon-128.png",
    },
    action: {},
    host_permissions: ["*://*.kagi.com/*"],
    web_accessible_resources: [
      {
        resources: ["corgi-main.js", "sprites/*"],
        matches: ["*://*.kagi.com/*"],
      },
    ],
    declarative_net_request: {
      rule_resources: [
        {
          id: "corgi_rules",
          enabled: true,
          path: "rules.json",
        },
      ],
    },
  },
  webExt: {
    startUrls: ["https://kagi.com/search?q=test"],
  },
});
