import { definePlugin } from '../../api';

export const cleanerCardsPlugin = definePlugin({
  name: 'corgi-polish/cleaner-cards',
  version: '0.1.0',
  author: 'corgi',
  description: 'Softer shadows, consistent border-radius, and improved spacing on cards and boxes',
  css: `
    .search-result {
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 8px;
    }

    .discussions .search-result {
      border-radius: 8px;
      padding: 16px;
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
