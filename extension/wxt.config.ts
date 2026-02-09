import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  svelte: {
    vite: {
      compilerOptions: {
        runes: true,
      },
    },
  },
  manifest: {
    name: 'Corgi',
    description: 'Theming engine and plugin API for Kagi',
    permissions: ['storage', 'declarativeNetRequest'],
    host_permissions: ['*://*.kagi.com/*'],
    web_accessible_resources: [
      {
        resources: ['corgi-main.js'],
        matches: ['*://*.kagi.com/*'],
      },
    ],
    declarative_net_request: {
      rule_resources: [
        {
          id: 'corgi_rules',
          enabled: true,
          path: 'rules.json',
        },
      ],
    },
  },
  webExt: {
    startUrls: ['https://kagi.com/search?q=test'],
  },
});
