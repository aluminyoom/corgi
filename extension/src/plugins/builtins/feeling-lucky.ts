import { definePlugin } from '../api';

const LUCKY_PARAM = 'corgi_lucky';
const BUTTON_ID = 'corgi-feeling-lucky';

export const feelingLuckyPlugin = definePlugin({
  name: 'feeling-lucky',
  displayName: "I'm Feeling Lucky",
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Adds an "I\'m Feeling Lucky" button to the landing page that takes you straight to the first result',
  defaultEnabled: false,

  css: `
    #${BUTTON_ID} {
      display: inline-block;
      margin-top: 12px;
      padding: 8px 20px;
      border: 1px solid var(--color-primary_hover, #7b68ee);
      border-radius: 6px;
      background: transparent;
      color: var(--color-primary, #7b68ee);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    #${BUTTON_ID}:hover {
      background: var(--color-primary, #7b68ee);
      color: #fff;
    }
  `,

  onStart() {
    const page = document.documentElement.getAttribute('data-path');

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
