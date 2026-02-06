# Extension Structure

This page documents the file layout, build system, and workspace organization of the Kagistry monorepo.

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
  src/
    entrypoints/
      content.ts          ISOLATED world content script (bridge)
      content-main.ts     MAIN world content script (hooks, CSS)
      background.ts       Service worker (storage, network rules)
      popup/
        index.html        Popup shell
        main.ts           Svelte mount point
        App.svelte        Popup UI root component
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
    styles/
      injector.ts         CSS injection and <kagistry-styles> management
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
- **Manifest overrides**: content script registration, permissions, CSP rules
- **Vite options**: Svelte compiler settings (runes mode)
- **Web extension config**: match patterns (`*://*.kagi.com/*`)

WXT generates `.wxt/tsconfig.json` with path aliases (`@/` and `~/` mapped to `src/`). The extension's `tsconfig.json` extends this generated config.

## Content Script Registration

Two content scripts are registered in the manifest:

1. **MAIN world** (`content-main.ts`): `world: "MAIN"`, `run_at: "document_start"`. Has access to page globals. No access to extension APIs.
2. **ISOLATED world** (`content.ts`): Default world, `run_at: "document_start"`. Has access to `chrome.*` APIs. No access to page globals.

Both are restricted to `*://*.kagi.com/*` match patterns.

## Permissions

| Permission | Reason |
|------------|--------|
| `storage` | Persist themes, plugins, and settings |
| `declarativeNetRequest` | Modify response headers to bypass CSP for style injection |
| `activeTab` | Access current tab for page interaction |

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
