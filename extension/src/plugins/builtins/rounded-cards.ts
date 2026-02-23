import { definePlugin } from '../api';

export const roundedCardsPlugin = definePlugin({
  name: 'rounded-cards',
  displayName: 'Rounded Cards',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Wrap each search result in a subtle card with rounded corners',
  defaultEnabled: false,

  css: `
    .center-content-box .search-result {
      background: color-mix(in srgb, var(--app-bg, var(--primary-50, #f8f8f8)) 60%, var(--modal-bg, #fff));
      border: 1px solid color-mix(in srgb, currentColor 6%, transparent);
      border-radius: 12px;
      padding: 16px 20px;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .center-content-box .search-result:hover {
      box-shadow: 0 2px 12px color-mix(in srgb, var(--box-shadow, rgba(0,0,0,0.08)) 80%, transparent);
      border-color: color-mix(in srgb, currentColor 12%, transparent);
    }

    .center-content-box .sri-group {
      background: color-mix(in srgb, var(--app-bg, var(--primary-50, #f8f8f8)) 60%, var(--modal-bg, #fff));
      border: 1px solid color-mix(in srgb, currentColor 6%, transparent);
      border-radius: 12px;
      padding: 16px 20px;
    }

    .center-content-box .sri-group .search-result {
      background: none;
      border: none;
      border-radius: 0;
      padding: 0;
      box-shadow: none;
    }

    .center-content-box .sri-group .search-result:hover {
      box-shadow: none;
      border-color: transparent;
    }
  `,
});
