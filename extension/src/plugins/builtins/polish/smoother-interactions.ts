import { definePlugin } from '../../api';

export const smootherInteractionsPlugin = definePlugin({
  name: 'corgi-polish/smoother-interactions',
  displayName: 'Smoother Interactions',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Subtle transitions on hover states, focus rings, and interactive elements',
  group: 'corgi-polish',
  css: `
    a:not(.ranked-box-overlay a) {
      transition: color 0.15s ease, opacity 0.15s ease;
    }

    .__sri_title_link:hover {
      opacity: 0.8;
    }

    button:not(.ranked-box-overlay button),
    [role="button"]:not(.ranked-box-overlay [role="button"]) {
      transition: background-color 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;
    }

    :focus-visible {
      outline: 2px solid var(--yellow);
      outline-offset: 2px;
      border-radius: 4px;
    }
  `,
});
