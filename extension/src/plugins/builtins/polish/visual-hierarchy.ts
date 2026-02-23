import { definePlugin } from '../../api';

export const visualHierarchyPlugin = definePlugin({
  name: 'corgi-polish/visual-hierarchy',
  displayName: 'Visual Hierarchy',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Muted secondary text, stronger title contrast, clearer result group separation',
  group: 'corgi-polish',
  css: `
    :not(.ranked-box-overlay) > .__sri-url {
      opacity: 0.7;
    }

    :not(.ranked-box-overlay) > .__sri-time {
      opacity: 0.6;
    }

    .sri-group {
      border-bottom: 1px solid color-mix(in srgb, currentColor 8%, transparent);
      padding-bottom: 20px;
      margin-bottom: 28px;
    }

    :not(.ranked-box-overlay) > .__sri_more_menu_box {
      opacity: 0.5;
      transition: opacity 0.15s ease;
    }

    :not(.ranked-box-overlay) > .__sri_more_menu_box:hover {
      opacity: 0.8;
    }

    footer {
      border-top: 1px solid color-mix(in srgb, currentColor 8%, transparent);
    }
  `,
});
