import { defineConfig } from "vitepress";

const kagiHelpLink = {
  text: "Kagi Help Docs",
  link: "https://help.kagi.com/kagi/",
};

export default defineConfig({
  title: "Corgi",
  description: "A theming engine and plugin API for Kagi search",

  head: [["link", { rel: "icon", type: "image/png", href: "/favicon.png" }]],

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/what-is-corgi" },
      { text: "Architecture", link: "/architecture/overview" },
      { text: "API Reference", link: "/api/theme-format" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "What is Corgi?", link: "/guide/what-is-corgi" },
            { text: "Getting Started", link: "/guide/getting-started" },
          ],
        },
        {
          text: "Themes",
          items: [
            { text: "Using Themes", link: "/guide/using-themes" },
            { text: "Creating Themes", link: "/guide/creating-themes" },
          ],
        },
        {
          text: "Plugins",
          items: [
            { text: "Using Plugins", link: "/guide/using-plugins" },
            { text: "Creating Plugins", link: "/guide/creating-plugins" },
          ],
        },
        { text: "―", items: [kagiHelpLink] },
      ],
      "/architecture/": [
        {
          text: "Architecture",
          items: [
            { text: "Overview", link: "/architecture/overview" },
            { text: "Content Scripts", link: "/architecture/content-scripts" },
            {
              text: "Hooks and Patches",
              link: "/architecture/hooks-and-patches",
            },
            { text: "Theming Engine", link: "/architecture/theming-engine" },
            { text: "Plugin System", link: "/architecture/plugin-system" },
            {
              text: "Settings Integration",
              link: "/architecture/settings-integration",
            },
            {
              text: "Extension Structure",
              link: "/architecture/extension-structure",
            },
          ],
        },
        { text: "―", items: [kagiHelpLink] },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [
            { text: "Theme Format", link: "/api/theme-format" },
            { text: "CSS Variables", link: "/api/css-variables" },
            { text: "DOM Selectors", link: "/api/dom-selectors" },
          ],
        },
        { text: "―", items: [kagiHelpLink] },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/aluminyoom/corgi" },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: "Not affiliated with Kagi Inc.",
    },
  },
});
