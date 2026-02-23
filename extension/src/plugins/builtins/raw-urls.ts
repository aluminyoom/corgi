import { definePlugin } from '../api';

const PROCESSED_ATTR = 'data-corgi-raw-url';

function rewriteUrls(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('.__sri-url');
  for (const link of links) {
    if (link.hasAttribute(PROCESSED_ATTR)) continue;
    link.setAttribute(PROCESSED_ATTR, '');

    const pathBox = link.querySelector<HTMLElement>('.__sri_url_path_box');
    if (!pathBox || !link.href) continue;

    try {
      const url = new URL(link.href);
      const display = url.hostname + decodeURIComponent(url.pathname).replace(/\/$/, '');
      pathBox.textContent = display;
    } catch {
      /* malformed URL, leave as-is */
    }
  }
}

function restoreUrls(): void {
  for (const el of document.querySelectorAll<HTMLElement>(`[${PROCESSED_ATTR}]`)) {
    el.removeAttribute(PROCESSED_ATTR);
  }
}

export const rawUrlsPlugin = definePlugin({
  name: 'raw-urls',
  displayName: 'Raw URLs',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Show clean full URLs instead of the breadcrumb site › path › path format',
  defaultEnabled: false,

  onStart(api) {
    const pagePath = document.documentElement.getAttribute('data-path');
    if (pagePath !== '/search') return;

    rewriteUrls();

    const cleanup = api.observeElement('.center-content-box', () => {
      rewriteUrls();
    }, { childList: true, subtree: true });

    return () => {
      cleanup();
      restoreUrls();
    };
  },
});
