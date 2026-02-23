import { definePlugin } from '../api';

const BTN_CLASS = 'corgi-copy-btn';
const COPIED_CLASS = 'corgi-copy-btn--copied';
const STYLE_ID = 'corgi-quick-copy-style';
const PROCESSED_ATTR = 'data-corgi-copy';

const COPY_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

const STYLE = `
  .${BTN_CLASS} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    background: transparent;
    color: var(--primary-400, #999);
    cursor: pointer;
    border-radius: 4px;
    padding: 0;
    margin-left: 4px;
    opacity: 0;
    transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;
    vertical-align: middle;
    flex-shrink: 0;
  }

  .search-result:hover .${BTN_CLASS} {
    opacity: 0.6;
  }

  .${BTN_CLASS}:hover {
    opacity: 1 !important;
    color: var(--primary);
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  .${BTN_CLASS}.${COPIED_CLASS} {
    opacity: 1 !important;
    color: var(--green, #22c55e);
  }
`;

function getResultUrl(result: HTMLElement): string | null {
  const link = result.querySelector<HTMLAnchorElement>('.__sri-url');
  return link?.href ?? null;
}

function addCopyButtons(): void {
  const results = document.querySelectorAll<HTMLElement>('.search-result');
  for (const result of results) {
    if (result.hasAttribute(PROCESSED_ATTR)) continue;
    result.setAttribute(PROCESSED_ATTR, '');

    const urlBox = result.querySelector('.__sri-url-box');
    if (!urlBox) continue;

    const btn = document.createElement('button');
    btn.className = BTN_CLASS;
    btn.type = 'button';
    btn.title = 'Copy URL';
    btn.innerHTML = COPY_ICON;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = getResultUrl(result);
      if (!url) return;

      try {
        await navigator.clipboard.writeText(url);
        btn.innerHTML = CHECK_ICON;
        btn.classList.add(COPIED_CLASS);
        setTimeout(() => {
          btn.innerHTML = COPY_ICON;
          btn.classList.remove(COPIED_CLASS);
        }, 1500);
      } catch {
        /* clipboard API blocked, silently fail */
      }
    });

    urlBox.appendChild(btn);
  }
}

function removeCopyButtons(): void {
  for (const btn of document.querySelectorAll(`.${BTN_CLASS}`)) {
    btn.remove();
  }
  for (const el of document.querySelectorAll(`[${PROCESSED_ATTR}]`)) {
    el.removeAttribute(PROCESSED_ATTR);
  }
}

export const quickCopyPlugin = definePlugin({
  name: 'quick-copy',
  displayName: 'Quick Copy URL',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Adds a copy button next to each search result URL',
  defaultEnabled: false,

  onStart(api) {
    const pagePath = document.documentElement.getAttribute('data-path');
    if (pagePath !== '/search') return;

    const styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    styleEl.textContent = STYLE;
    (document.head ?? document.documentElement).appendChild(styleEl);

    addCopyButtons();

    const cleanup = api.observeElement('.center-content-box', () => {
      addCopyButtons();
    }, { childList: true, subtree: true });

    return () => {
      cleanup();
      removeCopyButtons();
      styleEl.remove();
    };
  },
});
