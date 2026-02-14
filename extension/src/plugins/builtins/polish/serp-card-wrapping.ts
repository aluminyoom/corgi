import { definePlugin } from '../../api';

export const serpCardWrappingPlugin = definePlugin({
  name: 'corgi-polish/serp-card-wrapping',
  displayName: 'SERP Card Wrapping',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Wraps the right sidebar content in a card for better visual distinction from search results',
  group: 'corgi-polish',
  css: `
    .right-content-box ._0_right_sidebar {
      background: var(--background-color, var(--bg-2, #fff));
      border: 1px solid color-mix(in srgb, currentColor 10%, transparent);
      border-radius: 12px;
      padding: 16px;
    }
  `,
});
