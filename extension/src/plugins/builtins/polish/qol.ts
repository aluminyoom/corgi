import { definePlugin } from '../../api';

export const qolPlugin = definePlugin({
  name: 'corgi-polish/qol',
  version: '0.1.0',
  author: 'corgi',
  description: 'Small quality-of-life fixes: centered sidebar icons, aligned inline elements',
  css: `
    .cth_settings_nav_menu .nav-link > i {
      align-self: center;
      margin-top: 0;
    }

    .cth_settings_nav_menu .nav-link {
      align-items: center;
    }

    #quickSettings .nav-item-link {
      align-items: center;
    }

    #quickSettings .nav-item-link > i,
    #quickSettings .nav-item-link > svg {
      align-self: center;
    }

    .search-filter-bar .filter-item {
      align-items: center;
    }

    .settings-row .c-left label {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  `,
});
