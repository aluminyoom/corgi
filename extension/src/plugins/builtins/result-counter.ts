import { definePlugin } from "../api";

export const resultCounterPlugin = definePlugin({
  name: "result-counter",
  displayName: "Search Result Counter",
  version: "0.1.0",
  authors: ["aluminyoom"],
  description: "Show position numbers (1, 2, 3…) next to each search result",
  defaultEnabled: false,

  css: `
    .center-content-box {
      counter-reset: corgi-result;
    }

    .center-content-box .search-result > .__sri-title::before {
      counter-increment: corgi-result;
      content: counter(corgi-result) ".\\00a0";
      font-size: inherit;
      font-weight: 600;
      color: var(--color-primary_light, var(--primary-400, #999));
      font-variant-numeric: tabular-nums;
    }
  `,
});
