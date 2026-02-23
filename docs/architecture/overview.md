# Architecture Overview

Corgi runs as a browser extension that injects code into kagi.com pages, providing two capabilities: a theming engine for visual customization and a plugin API for behavioral modification.

## Design Principles

**Intercept, do not replace.** Corgi hooks into Kagi's existing JavaScript and CSS rather than reimplementing page functionality, which keeps the extension lightweight and resilient to upstream changes.

**Two worlds, one bridge.** Chrome MV3 content scripts run in an isolated world by default and cannot access page JavaScript globals. Corgi uses a dual-script architecture with a MAIN world script for hooking and an ISOLATED world script for extension API access, and communication between them flows through `window.postMessage`.

**Styles before content.** The MAIN world script runs at `document_start`, before any Kagi code executes, which lets Corgi intercept CSS loading, override CSS variables, and inject custom styles before the first paint.

## Runtime Architecture

```
Browser Tab (kagi.com)
 |
 |-- MAIN world content script (document_start)
 |    |-- Patches: monkey-patch Kagi globals before page JS runs
 |    |-- Hooks: intercept SSE events, fetch, DOM mutations
 |    |-- CSS: inject <corgi-styles> before Kagi stylesheets
 |    |-- Plugins: load and execute plugin start/stop lifecycle
 |    |-- Bridge: postMessage to ISOLATED world for storage/API
 |
 |-- ISOLATED world content script
 |    |-- Bridge: relay postMessage requests to background
 |    |-- Storage: chrome.storage.local read/write
 |    |-- Runtime: chrome.runtime.sendMessage for background tasks
 |
 |-- Background service worker
 |    |-- Storage: theme/plugin persistence
 |    |-- Network: declarativeNetRequest for CSP bypass
 |    |-- Messaging: handle requests from content scripts
 |
 |-- Popup (Svelte)
      |-- Theme management UI
      |-- Plugin toggle UI
      |-- Settings
```

## Transport Layer

Kagi streams search results to the browser using one of two transports, controlled by the `fetch_stream` user setting. **fetchStream** is a custom streaming fetch that uses the `application/vnd.kagi.stream` content type with NUL-delimited (`\0\n`) messages in `tag:data` format. **EventSource** is standard Server-Sent Events via `/socket/search?...` paths.

Both transports converge at `Client.prototype.onSocketMessage`, which parses messages and dispatches `CustomEvent`s on `window` following the `provider:{tag}` naming pattern. This convergence point is the primary interception target for modifying search results.

## Extension Packaging

Corgi is built with [WXT](https://wxt.dev/) targeting Manifest V3. The build produces separate outputs for Chrome, Firefox, and Safari from a single codebase. WXT handles manifest generation, content script registration, and cross-browser API polyfilling.
