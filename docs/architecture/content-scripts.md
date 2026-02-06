# Content Scripts

Kagistry uses two content scripts running in different execution contexts. This dual-world pattern is necessary because Chrome MV3 isolates content scripts from page JavaScript by default.

## MAIN World Script

The MAIN world script runs in the same JavaScript context as Kagi's page code. It executes at `document_start`, before any of Kagi's scripts load.

**Responsibilities:**
- Monkey-patch global functions (`window.client`, `getKagiSetting`, `fetchStream`)
- Set `Object.defineProperty` traps for globals that Kagi assigns later during page init
- Intercept SSE provider events before they reach page handlers
- Inject CSS custom elements before Kagi's stylesheets load
- Run plugin `start()` and `stop()` lifecycle methods
- Send messages to the ISOLATED world via `window.postMessage`

**Timing matters.** Because this script runs at `document_start`, it executes before `<head>` content is parsed. The DOM is essentially empty at this point. The script must:
1. Set up all interception traps immediately
2. Use `MutationObserver` or `document.addEventListener("DOMContentLoaded")` for DOM-dependent work
3. Never assume any DOM element exists during initial execution

**Registration in WXT:**
```typescript
// wxt.config.ts
export default defineConfig({
  manifest: {
    content_scripts: [{
      matches: ['*://*.kagi.com/*'],
      js: ['content-scripts/main.js'],
      run_at: 'document_start',
      world: 'MAIN'
    }]
  }
})
```

## ISOLATED World Script

The ISOLATED world script runs in Chrome's default sandboxed context. It has access to `chrome.*` extension APIs but cannot see page JavaScript globals.

**Responsibilities:**
- Listen for `window.postMessage` from the MAIN world
- Read and write `chrome.storage.local` (themes, plugins, settings)
- Relay messages to the background service worker via `chrome.runtime.sendMessage`
- Forward storage data back to the MAIN world via `window.postMessage`

**Registration in WXT:**
```typescript
// src/entrypoints/content.ts (default WXT content script)
export default defineContentScript({
  matches: ['*://*.kagi.com/*'],
  runAt: 'document_start',
  main() {
    // Set up postMessage listener for MAIN world bridge
  }
})
```

## Bridge Protocol

The two worlds communicate through `window.postMessage` with a structured message format. A `source` field prevents Kagistry from processing its own messages or unrelated postMessage traffic.

```typescript
interface BridgeMessage {
  source: 'kagistry'
  direction: 'to-isolated' | 'to-main'
  id: string        // correlation ID for request/response pairing
  type: string      // 'storage-get' | 'storage-set' | 'theme-data' | ...
  payload: unknown
}
```

**Flow example (MAIN world requests theme data):**
1. MAIN world posts `{ source: 'kagistry', direction: 'to-isolated', type: 'storage-get', id: 'abc', payload: { key: 'themes' } }`
2. ISOLATED world receives it, calls `chrome.storage.local.get('themes')`
3. ISOLATED world posts back `{ source: 'kagistry', direction: 'to-main', type: 'storage-get', id: 'abc', payload: { themes: [...] } }`
4. MAIN world resolves the pending promise matched by `id: 'abc'`

The MAIN world exposes a promise-based API wrapping this protocol, so plugin code never deals with raw postMessage.

## Execution Order

```
1. Browser navigates to kagi.com
2. MAIN world script executes (document_start, before <head>)
   - Install Object.defineProperty traps for window.client, window.sseCache
   - Wrap window.fetch, window.addEventListener
   - Create <kagistry-styles> container element
3. ISOLATED world script executes (document_start)
   - Set up postMessage bridge listener
   - Send stored theme/plugin data to MAIN world
4. Kagi's <head> loads (stylesheets, meta tags)
   - MutationObserver catches <link> and <style> elements
   - Kagistry can block, modify, or reorder stylesheets
5. Kagi's scripts execute
   - window.sseCache = new SSECache() triggers defineProperty trap
   - window.client = new Client() triggers defineProperty trap
   - Kagistry wraps Client.prototype.onSocketMessage
6. DOMContentLoaded fires
   - Kagi calls setupSettings(), initPage(), setupResults()
   - Kagistry plugin DOMContentLoaded hooks fire
7. SSE connection opens, search results stream in
   - Each provider:* event passes through Kagistry's event interceptor
   - Plugins can modify, suppress, or inject result HTML
```
