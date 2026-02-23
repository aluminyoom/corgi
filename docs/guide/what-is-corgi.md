# What is Corgi?

> [!WARNING]
> **Corgi is in heavy development.** Features may break, APIs will change, and some things documented here may not be fully implemented yet. If you find bugs, please [open an issue](https://github.com/aluminyoom/corgi/issues).

Corgi is a browser extension that adds a plugin system and theming engine to [Kagi Search](https://kagi.com). It works like [Vencord](https://vencord.dev/) does for Discord: it hooks into the existing page, gives you an API to extend it, and stays out of your way.

## Why Corgi?

Kagi's built-in Custom CSS has a 40,000 character limit, only applies to search pages, and offers no way to manage or compose multiple themes. Corgi lifts those restrictions and adds a full plugin system on top.

With Corgi you get:

- **A plugin API** with 29 built-in plugins, auto-discovery, per-plugin settings, and a clean lifecycle system
- **Theme layering** so you can stack a color scheme on top of a layout mod
- **Full page coverage** including settings pages, not just search
- **No character limits** on CSS
- **A native settings tab** at `/settings/corgi` that looks and feels like part of Kagi itself

## Built-in Plugins

Corgi ships with **29 plugins** in three categories:

- **Corgi Polish** (12): Visual refinements like typography, transitions, card styling, spacing, sticky sidebar, and more
- **Customization** (4): Custom backgrounds, fonts, logos, and placeholder text
- **Utilities** (13): Feeling Lucky button, infinite scroll, result counter, quick copy, raw URLs, highlight terms, a cursor-following cat, and a vibing horse

See [Using Plugins](./using-plugins.md) for the full list.

## How It Works

Corgi injects a MAIN world script at `document_start`, before any of Kagi's code runs. This lets it patch globals, intercept events, and inject styles before the first paint. A bridge connects the main world to the extension's isolated world for storage and API access.

Plugins register through `definePlugin()` and get a tracked API that handles cleanup automatically. Drop a `.ts` file in `builtins/` and the auto-discovery system picks it up.

The settings UI embeds directly into Kagi's settings page. No popup, no separate window.

## Inspired By

- [Vencord](https://vencord.dev/) for the approach of building an API layer over a web app
- [awesome-kagi-css](https://github.com/kawaiier/awesome-kagi-css), the existing Kagi theming community
- [kage-css](https://github.com/pdanzma/kage-css), the most comprehensive existing Kagi theme
