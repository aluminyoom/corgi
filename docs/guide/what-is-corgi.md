# What is Corgi?

Corgi is a browser extension that provides a theming engine and API for [Kagi search](https://kagi.com). Think [Vencord](https://vencord.dev/) for Discord, but for Kagi.

## Why?

Kagi has a built-in Custom CSS feature, but it comes with limitations:

- **40,000 character limit.** Complex themes hit this ceiling fast.
- **Settings pages can't be styled.** The built-in CSS only applies to search pages.
- **No live preview.** You have to edit, save, and refresh every time.
- **No theme management.** One theme at a time, manual copy-paste to switch.
- **No composability.** You can't layer a color scheme on top of a layout mod.

Corgi removes all of these limitations.

## What Can It Do?

- **Unlimited CSS.** No character limits, ever.
- **Full page coverage.** Style *every* Kagi page, including settings.
- **Live preview.** See changes as you type.
- **Theme layering.** Combine multiple themes (e.g., Catppuccin colors + compact layout).
- **Plugin system.** Extend Kagi with 25+ built-in plugins through a Vencord-style plugin API.
- **Plugin groups.** Bundle related plugins under a single toggle with individual overrides.
- **CSS variable API.** Programmatically override Kagi's design tokens.
- **DOM hooks.** Target specific UI elements with stable selectors.
- **Per-plugin settings.** Configure plugin behavior without touching code.
- **Cross-browser.** Chrome, Firefox, and Safari from a single codebase.

## How It Works

Corgi runs as a content script on `kagi.com`. When you load any Kagi page, the theming engine:

1. Detects which page you're on (search, settings, etc.)
2. Loads your active themes from extension storage
3. Injects CSS overrides into the page
4. Watches for DOM changes (Kagi loads some content dynamically)
5. Re-applies styles as needed

Themes are just JSON files that declare CSS variable overrides and custom CSS rules. The format is designed to be easy to write by hand and easy to share.

## Inspired By

- [Vencord](https://vencord.dev/), for the approach of providing an API and framework over a web app
- [awesome-kagi-css](https://github.com/kawaiier/awesome-kagi-css), the existing Kagi theming community
- [kage-css](https://github.com/pdanzma/kage-css), the most comprehensive existing Kagi theme (hitting the 40k limit)
