import { definePlugin } from '../../api';

export const cleanerCardsPlugin = definePlugin({
  name: 'corgi-polish/cleaner-cards',
  version: '0.1.0',
  author: 'corgi',
  description: 'Softer shadows, consistent border-radius, and improved spacing on cards and boxes',
  css: `
    .search-result {
      background: color-mix(in srgb, currentColor 3%, transparent);
      border-radius: 8px;
      padding: 16px;
      border: 1px solid color-mix(in srgb, currentColor 6%, transparent);
      margin-bottom: 8px;
    }

    .discussions .search-result {
      background: color-mix(in srgb, currentColor 3%, transparent);
      border-radius: 8px;
      padding: 16px;
      border: 1px solid color-mix(in srgb, currentColor 6%, transparent);
    }

    .settings-row-box {
      border-radius: 8px;
    }

    ._0_k_ui_dropdown {
      border-radius: 8px;
      overflow: hidden;
    }
  `,
});
