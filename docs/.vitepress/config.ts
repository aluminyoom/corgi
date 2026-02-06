import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Kagistry',
  description: 'A theming engine and API for Kagi search',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/what-is-kagistry' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'API Reference', link: '/api/theme-format' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Kagistry?', link: '/guide/what-is-kagistry' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
        {
          text: 'Themes',
          items: [
            { text: 'Using Themes', link: '/guide/using-themes' },
            { text: 'Creating Themes', link: '/guide/creating-themes' },
          ],
        },
      ],
      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/overview' },
            { text: 'Content Scripts', link: '/architecture/content-scripts' },
            { text: 'Hooks and Patches', link: '/architecture/hooks-and-patches' },
            { text: 'Theming Engine', link: '/architecture/theming-engine' },
            { text: 'Extension Structure', link: '/architecture/extension-structure' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Theme Format', link: '/api/theme-format' },
            { text: 'CSS Variables', link: '/api/css-variables' },
            { text: 'DOM Selectors', link: '/api/dom-selectors' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/user/kagistry' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Not affiliated with Kagi Inc.',
    },
  },
})
