# Extension Structure

This page documents the file layout, build system, and workspace organization of the Corgi monorepo.

## Monorepo Layout

```
kagiplus/
  package.json            Root workspace config (pnpm)
  pnpm-workspace.yaml     Workspace member definitions
  extension/              Browser extension package
  docs/                   VitePress documentation site
```

The root `package.json` defines the pnpm workspace. Each member has its own `package.json` with independent dependencies.

## Extension Package

```
extension/
  wxt.config.ts           WXT configuration (modules, manifest overrides)
  tsconfig.json           Extends .wxt/tsconfig.json
  package.json            Dependencies and scripts
  public/
    sprites/
      oneko.gif            Bundled oneko cat sprite (3.3KB)
      fatass-horse.png     Bundled horse sprite sheet (1.16MB)
  src/
    entrypoints/
      content.ts          ISOLATED world content script (bridge + settings)
      corgi-main.ts    MAIN world unlisted script (hooks, themes, plugins)
      background.ts       Service worker (storage, network rules)
      popup/
        index.html        Popup shell
        main.ts           Svelte mount point
        App.svelte        Minimal launcher that opens /settings/corgi
    settings/
      inject.ts           Settings page orchestrator (detect route, mount UI)
      nav.ts              Nav link injection into Kagi sidebar
      page.ts             Settings page content (themes, plugins, toggles)
      settings.css        Minimal CSS for toggle switches and buttons
    hooks/
      traps.ts            Object.defineProperty traps for globals
      wrap.ts             Function wrapping utilities
      events.ts           Provider event interception
      fetch.ts            Fetch/XHR interception
      observer.ts         MutationObserver for DOM/CSS changes
    plugins/
      types.ts            Plugin type definitions
      registry.ts         Plugin loading and lifecycle
      api.ts              definePlugin() and plugin runtime API
      builtins/
        discover.ts       Auto-discovery via import.meta.glob
        groups.ts         Plugin group definitions (Corgi Polish)
        usage-counter.ts  Account usage widget (scrapes billing page)
        support-redirect.ts  Support page redirect
        custom-background.ts Custom background image (CSS injection)
        custom-font.ts    Google Fonts injection
        custom-logo.ts    Custom landing page logo
        custom-placeholder.ts Custom search bar placeholder
        hide-favicons.ts  Hide favicons (CSS-only)
        result-counter.ts Result numbering (CSS counters)
        highlight-terms.ts Highlight search terms in results
        oneko.ts          Interactive cat sprite (cursor chaser)
        fatass-horse.ts   Interactive horse sprite (cursor chaser)
        infinite-scroll.ts Auto-load more SERP results on scroll
        feeling-lucky.ts  "I'm Feeling Lucky" button on landing
        polish/           Corgi Polish group (12 CSS-only plugins)
          refined-typography.ts
          smoother-interactions.ts
          cleaner-cards.ts
          visual-hierarchy.ts
          centered-header.ts
          edge-to-edge-nav.ts
          modern-landing-tabs.ts
          pill-filters.ts
          qol.ts
          serp-card-wrapping.ts
          sidebar-categories.ts
          sticky-sidebar.ts
    styles/
      injector.ts         CSS injection and <corgi-styles> management
      variables.ts        CSS variable override application
    bridge/
      protocol.ts         Bridge message types and helpers
      main-side.ts        MAIN world bridge client (promise-based)
      isolated-side.ts    ISOLATED world bridge server
    utils/
      types.ts            Shared type definitions (Theme, Settings)
      storage.ts          chrome.storage.local wrappers
      engine.ts           Theme engine (apply/remove themes)
      messaging.ts        Extension messaging protocol
```

## Build System

**WXT** handles the extension build pipeline. It uses Vite internally and produces browser-specific outputs.

Key scripts:
| Command | Action |
|---------|--------|
| `pnpm --filter extension dev` | Development mode with HMR |
| `pnpm --filter extension build` | Production build for Chrome |
| `pnpm --filter extension build --browser firefox` | Firefox build |
| `pnpm --filter extension check` | Run svelte-check for type validation |

**Build output:** `.output/chrome-mv3/` contains the unpacked extension ready for `chrome://extensions` loading.

## WXT Configuration

`wxt.config.ts` configures:
- **Modules**: `@wxt-dev/module-svelte` for Svelte 5 support with runes
- **Manifest overrides**: permissions, CSP bypass rules, web-accessible resources
- **Vite options**: Svelte compiler settings (runes mode)
- **Web extension config**: match patterns (`*://*.kagi.com/*`)

WXT generates `.wxt/tsconfig.json` with path aliases (`@/` and `~/` mapped to `src/`). The extension's `tsconfig.json` extends this generated config.

## Content Script Architecture

A single content script runs in the ISOLATED world at `document_start`. It handles three responsibilities:

1. **Bridge startup**: Opens the communication channel between worlds
2. **MAIN world injection**: Injects `corgi-main.js` as an unlisted script via `injectScript()`
3. **Settings integration**: Detects `/settings/*` routes and injects the Corgi nav link and settings page

The MAIN world script (`corgi-main.ts`) is registered as an unlisted WXT script, not a separate content script. It runs with full access to page globals.

## Settings Page Integration

Corgi embeds its management UI directly into Kagi's settings at `/settings/corgi`. The popup exists only as a launcher that opens this page.

The settings integration:
- Injects a "Corgi" link into `nav#settings-menu` before the `<hr>` separator
- Detects the `/settings/corgi` route and replaces `<main>` content with Corgi's UI
- Uses Kagi's own CSS classes (`nav-link`, `heading-2`, `text-sm`, `rounded-lg`) for a native look
- Handles browser history (`pushState`/`popstate`) for proper back/forward navigation

## Permissions

| Permission | Reason |
|------------|--------|
| `storage` | Persist themes, plugins, and settings |
| `declarativeNetRequest` | Modify response headers to bypass CSP for style injection |

## Documentation Package

```
docs/
  .vitepress/
    config.ts             Site config (nav, sidebar, theme)
  index.md                Landing page
  guide/                  User-facing guides
  architecture/           Developer documentation
  api/                    API reference
```

Built with VitePress. Run `pnpm --filter docs dev` for local preview.
