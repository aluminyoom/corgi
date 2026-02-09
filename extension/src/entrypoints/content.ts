import { injectScript } from 'wxt/utils/inject-script';
import { startBridge, pushReady } from '@/bridge/isolated-side';
import { initSettingsIntegration } from '@/settings/inject';

export default defineContentScript({
  matches: ['*://*.kagi.com/*'],
  runAt: 'document_start',

  async main() {
    startBridge();
    await injectScript('/corgi-main.js', { keepInDom: true });
    pushReady();
    initSettingsIntegration();
  },
});
