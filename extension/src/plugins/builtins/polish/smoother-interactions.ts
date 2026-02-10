import { definePlugin } from '../../api';

export const smootherInteractionsPlugin = definePlugin({
  name: 'corgi-polish/smoother-interactions',
  version: '0.1.0',
  author: 'corgi',
  description: 'Subtle transitions on hover states, focus rings, and interactive elements',
  css: `
    a {
      transition: color 0.15s ease, opacity 0.15s ease;
    }

    .__sri_title_link:hover {
      opacity: 0.8;
    }

    button,
    [role="button"] {
      transition: all 0.15s ease;
    }

    button:hover,
    [role="button"]:hover {
      transform: scale(1.02);
    }

    :focus-visible {
      outline: 2px solid var(--yellow);
      outline-offset: 2px;
      border-radius: 4px;
    }

    ._0_k_ui_dropdown {
      transition: opacity 0.15s ease;
    }
  `,
});
