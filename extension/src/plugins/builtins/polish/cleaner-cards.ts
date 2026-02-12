import { definePlugin } from '../../api';

export const cleanerCardsPlugin = definePlugin({
  name: 'corgi-polish/cleaner-cards',
  displayName: 'Cleaner Cards',
  version: '0.1.0',
  authors: ['aluminyoom'],
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

    .inline-content {
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 8px;
    }

    .settings-row-box {
      border-radius: 8px;
    }
  `,
});
