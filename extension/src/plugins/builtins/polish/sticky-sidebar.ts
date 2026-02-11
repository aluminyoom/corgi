import { definePlugin } from '../../api';

export const stickySidebarPlugin = definePlugin({
  name: 'corgi-polish/sticky-sidebar',
  version: '0.2.0',
  author: 'corgi',
  description: 'Makes the settings sidebar sticky while the main content scrolls independently',

  css: `
    @media (min-width: 1024px) {
      html[data-path="/settings"] body {
        overflow: hidden;
        height: 100vh;
        position: relative;
      }

      html[data-path="/settings"] body > div.flex.flex-column {
        position: sticky;
        top: 0;
        align-self: flex-start;
        max-height: 100vh;
        overflow-y: auto;
        flex-shrink: 0;
        padding-bottom: 24px;
        min-width: 256px;
      }

      html[data-path="/settings"] body > main.cth_settings_content_box {
        overflow-y: auto;
        max-height: 100vh;
        flex-grow: 1 !important;
        width: 100%;
      }

      html[data-path="/settings"] .cth_settings_close_btn {
        position: fixed;
        top: 16px;
        right: 20px;
        z-index: 100;
      }

      html[data-path="/settings"] body > main.cth_settings_content_box::-webkit-scrollbar {
        width: 6px;
      }

      html[data-path="/settings"] body > main.cth_settings_content_box::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, currentColor 15%, transparent);
        border-radius: 3px;
      }

      html[data-path="/settings"] body > main.cth_settings_content_box::-webkit-scrollbar-track {
        background: transparent;
      }

      html[data-path="/settings"] body > div.flex.flex-column::-webkit-scrollbar {
        width: 4px;
      }

      html[data-path="/settings"] body > div.flex.flex-column::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, currentColor 10%, transparent);
        border-radius: 2px;
      }

      html[data-path="/settings"] body > div.flex.flex-column::-webkit-scrollbar-track {
        background: transparent;
      }
    }
  `,
});
