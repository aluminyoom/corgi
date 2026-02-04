import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'Kagistry',
    description: 'A theming engine for Kagi search',
    permissions: ['storage'],
    host_permissions: ['*://*.kagi.com/*'],
  },
  webExt: {
    startUrls: ['https://kagi.com/search?q=test'],
  },
});
