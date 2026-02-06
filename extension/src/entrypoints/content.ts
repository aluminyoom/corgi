import { injectScript } from 'wxt/utils/inject-script';
import { startBridge } from '@/bridge/isolated-side';

export default defineContentScript({
  matches: ['*://*.kagi.com/*'],
  runAt: 'document_start',

  async main() {
    startBridge();
    await injectScript('/kagistry-main.js', { keepInDom: true });
  },
});
