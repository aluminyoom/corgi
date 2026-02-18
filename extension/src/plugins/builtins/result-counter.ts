import { definePlugin } from '../api';

export const resultCounterPlugin = definePlugin({
  name: 'result-counter',
  displayName: 'Search Result Counter',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Show position numbers (1, 2, 3…) next to each search result',
  defaultEnabled: false,

  css: `
    .right-content-box {
      counter-reset: corgi-result;
    }

    .right-content-box > .search-result::before {
      counter-increment: corgi-result;
      content: counter(corgi-result);
      position: absolute;
      left: -28px;
      top: 0;
      font-size: 12px;
      font-weight: 600;
      color: var(--color-primary_light, var(--primary-400, #999));
      line-height: 1.6;
      font-variant-numeric: tabular-nums;
    }

    .right-content-box > .search-result {
      position: relative;
    }
  `,
});
