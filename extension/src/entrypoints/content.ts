import { injectScript } from 'wxt/utils/inject-script';
import { startBridge } from '@/bridge/isolated-side';
import { initSettingsIntegration } from '@/settings/inject';
import '@/settings/settings.css';

export default defineContentScript({
  matches: ['*://*.kagi.com/*'],
  runAt: 'document_start',

  async main() {
    startBridge();
    await injectScript('/kagistry-main.js', { keepInDom: true });
    initSettingsIntegration();
  },
});
