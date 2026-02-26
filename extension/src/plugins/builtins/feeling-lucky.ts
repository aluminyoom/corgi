import { definePlugin } from '../api';

const LUCKY_PARAM = 'corgi_lucky';
const BUTTON_ID = 'corgi-feeling-lucky';

export const feelingLuckyPlugin = definePlugin({
  name: 'feeling-lucky',
  displayName: "I'm Feeling Lucky",
  version: '0.2.0',
  authors: ['aluminyoom'],
  description: 'Adds an "I\'m Feeling Lucky" button to the landing page that takes you straight to the first result',
  defaultEnabled: false,

  css: `
    #${BUTTON_ID} {
      align-items: center;
      border-radius: 999px;
      background-color: var(--color-search-input);
      border: 1px solid var(--color-search-input-border);
      color: var(--primary);
      cursor: pointer;
      display: inline-flex;
      font-family: var(--font-main, inherit);
      font-size: 0.85rem;
      justify-content: center;
      min-height: 40px;
      padding-left: 32px;
      padding-right: 32px;
      white-space: nowrap;
      transition: border-color 0.15s, color 0.15s;
      box-shadow: 1px 8px 30px 0 var(--box-shadow);
    }
    #${BUTTON_ID}:hover {
      border-color: var(--primary-hover, var(--primary));
      color: var(--primary-hover, var(--primary));
      text-decoration: none;
    }
  `,

  onStart(api) {
    const page = api.getPagePath();

    if (page === '/search') {
      return handleSerp();
    }

    if (page === '/landing') {
      return handleLanding();
    }
  },
});

function handleSerp(): (() => void) | undefined {
  const url = new URL(window.location.href);
  if (url.searchParams.get(LUCKY_PARAM) !== '1') return;

  url.searchParams.delete(LUCKY_PARAM);
  window.history.replaceState(null, '', url.toString());

  const FIRST_LINK = '._0_main-search-results .search-result .__sri_title_link';

  const redirect = (): void => {
    const firstLink = document.querySelector<HTMLAnchorElement>(FIRST_LINK);
    if (firstLink?.href) {
      window.location.href = firstLink.href;
    }
  };

  redirect();

  if (!document.querySelector(FIRST_LINK)) {
    const observer = new MutationObserver(() => {
      const link = document.querySelector<HTMLAnchorElement>(FIRST_LINK);
      if (link?.href) {
        observer.disconnect();
        window.location.href = link.href;
      }
    });
    observer.observe(document.body ?? document.documentElement, {
      childList: true,
      subtree: true,
    });
    setTimeout(() => observer.disconnect(), 10_000);
    return () => observer.disconnect();
  }
}

function handleLanding(): (() => void) | undefined {
  const form = document.querySelector<HTMLFormElement>('#searchForm');
  const input = document.querySelector<HTMLInputElement>('#searchBar');
  if (!form || !input) return;

  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.type = 'button';
  btn.textContent = "I'm Feeling Lucky";

  btn.addEventListener('click', () => {
    const query = input.value.trim();
    if (!query) {
      input.focus();
      return;
    }
    const url = new URL('/search', window.location.origin);
    url.searchParams.set('q', query);
    url.searchParams.set(LUCKY_PARAM, '1');
    window.location.href = url.toString();
  });

  const wrapper =
    form.closest('.search-form-wrapper') ??
    form.closest('.s-f-w') ??
    form.closest('.search-form-container');

  if (wrapper) {
    const container = document.createElement('div');
    container.style.textAlign = 'center';
    container.appendChild(btn);
    wrapper.insertAdjacentElement('afterend', container);
    return () => container.remove();
  }

  form.insertAdjacentElement('afterend', btn);
  return () => btn.remove();
}
