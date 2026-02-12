import { definePlugin } from '../../api';

export const centeredHeaderPlugin = definePlugin({
  name: 'corgi-polish/centered-header',
  displayName: 'Centered Header',
  version: '0.4.0',
  authors: ['aluminyoom'],
  description: 'Vertically centers the logo, apps, and control center buttons with the search bar in the SERP header',
  css: `
    header.app-header > .flex .center-content-box .app-logo.--kagi {
      top: 28px !important;
    }

    header.app-header > .flex .center-content-box .app-logo:not(.--kagi) {
      top: 25px !important;
    }

    header.app-header > .flex #accountContainer {
      top: 27px !important;
    }

    @media screen and (max-width: 1023.98px) {
      header.app-header > .flex #accountContainer {
        top: auto !important;
      }
    }

    @media screen and (max-width: 768px) {
      header.app-header > .flex .center-content-box .app-logo {
        top: 24px !important;
      }
    }
  `,
});
