# Content Scripts

Corgi uses two content scripts running in different execution contexts. This dual-world pattern is necessary because Chrome MV3 isolates content scripts from page JavaScript by default.

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

The two worlds communicate through `window.postMessage` with a structured message format. The `BRIDGE_SOURCE` constant (`'corgi-bridge'`) prevents Corgi from processing its own messages or unrelated postMessage traffic.

```typescript
interface BridgeRequest {
  source: 'corgi-bridge'
  direction: 'main-to-isolated'
  id: string        // correlation ID for request/response pairing
  action: BridgeAction
  payload?: unknown
}

interface BridgeResponse {
  source: 'corgi-bridge'
  direction: 'isolated-to-main'
  id: string
  ok: boolean
  data?: unknown
  error?: string
}
```

**Bridge actions:**
| Action | Direction | Purpose |
|--------|-----------|---------|
| `storage:get` | Main → Isolated | Read from `chrome.storage.local` |
| `storage:set` | Main → Isolated | Write to `chrome.storage.local` |
| `storage:watch` | Main → Isolated | Watch storage key for changes |
| `storage:unwatch` | Main → Isolated | Stop watching storage key |
| `runtime:send` | Main → Isolated | Send message to background service worker |
| `runtime:getURL` | Main → Isolated | Resolve `chrome.runtime.getURL()` for bundled assets (bypasses CSP) |
| `theme:apply` | Main → Isolated | Apply a theme |
| `theme:clear` | Main → Isolated | Clear active theme |
| `plugin:list` | Main → Isolated | List available plugins |
| `plugin:state` | Main → Isolated | Get plugin enabled/disabled states |
| `plugin:settings:get` | Main → Isolated | Read per-plugin settings |
| `plugin:settings:set` | Main → Isolated | Write per-plugin settings |
| `ready` | Isolated → Main (push) | Signal that bridge is ready, triggers plugin startup |

The MAIN world exposes a promise-based API (`bridgeRequest()`) wrapping this protocol with a 5-second timeout, so plugin code never deals with raw postMessage. The ISOLATED world can also push messages to MAIN world via `pushToMain()` with queue/replay semantics.

## Execution Order

```
1. Browser navigates to kagi.com
2. MAIN world script executes (document_start, before <head>)
   - Install Object.defineProperty traps for window.client, window.sseCache
   - Wrap window.fetch, window.addEventListener
   - Create <corgi-styles> container element
3. ISOLATED world script executes (document_start)
   - Set up postMessage bridge listener
   - Send stored theme/plugin data to MAIN world
4. Kagi's <head> loads (stylesheets, meta tags)
   - MutationObserver catches <link> and <style> elements
   - Corgi can block, modify, or reorder stylesheets
5. Kagi's scripts execute
   - window.sseCache = new SSECache() triggers defineProperty trap
   - window.client = new Client() triggers defineProperty trap
   - Corgi wraps Client.prototype.onSocketMessage
6. DOMContentLoaded fires
   - Kagi calls setupSettings(), initPage(), setupResults()
   - Corgi plugin DOMContentLoaded hooks fire
7. SSE connection opens, search results stream in
   - Each provider:* event passes through Corgi's event interceptor
   - Plugins can modify, suppress, or inject result HTML
```

## DOM Safety: waitForBody

Because the MAIN world script runs at `document_start`, `document.body` is `null` when plugins first execute. Plugins that need to append elements to the body must wait for it to exist.

The established pattern is `waitForBody()`:

```typescript
function waitForBody(): Promise<HTMLElement> {
  return new Promise((resolve) => {
    if (document.body) return resolve(document.body);
    const observer = new MutationObserver(() => {
      if (document.body) {
        observer.disconnect();
        resolve(document.body);
      }
    });
    observer.observe(document.documentElement, { childList: true });
  });
}
```

This avoids the `Cannot read properties of null (reading 'appendChild')` crash that occurs when plugins try to use `document.body` before it exists.

## CSP and Bundled Assets

Kagi's SERP pages enforce a Content Security Policy that restricts `img-src` to `'self'`, `https://*.kagi.com/`, `data:`, `blob:`, and `chrome-extension://` URLs. External image URLs will be blocked.

Plugins that need to load images (like sprite sheets) must:

1. Bundle the asset in `extension/public/` (e.g., `public/sprites/oneko.gif`)
2. Declare the path in `web_accessible_resources` in `wxt.config.ts`
3. Resolve the URL at runtime via the `runtime:getURL` bridge action

`chrome-extension://` URLs bypass page CSP entirely, so bundled assets load without restrictions.
