# Hooks and Patches

Corgi intercepts Kagi's runtime behavior through monkey-patching and event interception. This page documents the hooking layer that enables plugins to modify search results, settings, network requests, and UI behavior.

## Hooking Strategy

Kagi assigns all its core objects and functions to `window` as plain globals. There is no module system, no bundler, and no framework. This makes hooking straightforward compared to systems like Discord (which requires Webpack module factory interception).

Corgi's MAIN world script runs at `document_start`, before Kagi's scripts execute. This gives it two techniques:

1. **Pre-assignment traps**: Use `Object.defineProperty` to intercept globals that Kagi assigns during initialization (like `window.client` and `window.sseCache`).
2. **Post-assignment patches**: Wrap functions on prototypes and globals that already exist or will exist after the trap fires.

## Object.defineProperty Traps

Some globals are assigned by Kagi's scripts during execution. Corgi intercepts these assignments:

```typescript
let _client: Client | undefined

Object.defineProperty(window, 'client', {
  configurable: true,
  get() { return _client },
  set(value) {
    _client = value
    // Wrap Client prototype methods now that the instance exists
    patchClientPrototype(value)
  }
})
```

**Trapped globals:**
| Global | Kagi Assignment | Corgi Action |
|--------|----------------|-----------------|
| `window.client` | `new Client()` at script load | Wrap `.connect()`, `.onSocketMessage()`, `.reload()` |
| `window.sseCache` | `new SSECache()` at script load | Wrap `.replayEvents()`, `.storeEvents()` |
| `window.metric` | `new Metric()` at script load | Optional: intercept telemetry events |
| `window.kagiSettings` | Set from cookie data | Intercept reads/writes to override settings |

## Function Wrapping

For functions that exist on `window` or on prototypes, Corgi wraps them with before/after hooks:

```typescript
function wrapFunction<T extends (...args: any[]) => any>(
  obj: any,
  key: string,
  wrapper: (original: T, ...args: Parameters<T>) => ReturnType<T>
) {
  const original = obj[key] as T
  obj[key] = function(this: any, ...args: Parameters<T>) {
    return wrapper.call(this, original.bind(this), ...args)
  }
  // Preserve function name for debugging
  Object.defineProperty(obj[key], 'name', { value: key })
}
```

**Primary wrap targets:**

| Target | Purpose |
|--------|---------|
| `Client.prototype.onSocketMessage` | Intercept all SSE messages before dispatch. Plugins can modify, suppress, or inject provider events. |
| `Client.prototype.connect` | Intercept search connections. Plugins can modify query parameters or add connection hooks. |
| `SSECache.prototype.replayEvents` | Intercept cached result replay with the same hooks as live results. |
| `window.getKagiSetting` | Override or extend Kagi settings. Return custom values for settings Kagi does not know about. |
| `window.setKagiSetting` | Intercept setting changes. Trigger plugin reactions to preference changes. |
| `window.updateTheme` | Hook theme application. Corgi can suppress or redirect theme changes. |
| `window.initPage` | Hook page initialization. Plugins can run setup before search begins. |

## Event Interception

Kagi dispatches search results and UI state through `CustomEvent`s on `window`. Corgi wraps `window.addEventListener` to intercept event registration for `provider:*` events:

```typescript
const originalAddEventListener = window.addEventListener.bind(window)

window.addEventListener = function(type: string, listener: EventListener, options?: any) {
  if (type.startsWith('provider:')) {
    // Wrap the listener to pass events through plugin pipeline
    const wrappedListener = (event: CustomEvent) => {
      const result = pluginPipeline.processEvent(type, event)
      if (result !== false) {
        listener(result.modifiedEvent ?? event)
      }
    }
    return originalAddEventListener(type, wrappedListener, options)
  }
  return originalAddEventListener(type, listener, options)
}
```

**Provider events available for interception:**
| Event | Content | Hookable |
|-------|---------|----------|
| `provider:search` | Main search results HTML | Modify result HTML before render |
| `provider:wikipedia` | Wikipedia card HTML | Modify or suppress |
| `provider:right-sidebar` | Right sidebar content | Inject or modify |
| `provider:related_searches` | Related searches | Modify suggestions |
| `provider:widget_*` | Widgets (weather, stocks, etc.) | Modify or suppress |
| `provider:search.info` | Pagination, share URLs | Access metadata |
| `provider:domain_info` | Domain ranking data (JSON) | Modify ranking display |
| `provider:error` | Error messages | Custom error handling |
| `client:search_initiated` | Search started | Pre-search hooks |
| `client:socket_open` | Connection opened | Connection hooks |
| `client:socket-closed` | Connection closed | Post-search hooks |

## Fetch Interception

Corgi wraps `window.fetch` to intercept API requests:

```typescript
const originalFetch = window.fetch.bind(window)

window.fetch = async function(input: RequestInfo, init?: RequestInit) {
  const url = typeof input === 'string' ? input : input.url
  
  // Let plugins modify request before sending
  const modified = pluginPipeline.processRequest(url, init)
  
  const response = await originalFetch(modified.input, modified.init)
  
  // Let plugins modify response
  return pluginPipeline.processResponse(url, response)
}
```

**Key fetch targets:**
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/esr/user_rules` | POST | Domain ranking (block/lower/higher/pin) |
| `/autosuggest?q=...` | GET | Search suggestions |
| `/api/wikipedia?q=...` | GET | Wikipedia data |
| `/settings` | POST | Save user settings |
| `/bangs` | POST | Custom bang management |
| `/mother/context?...` | POST | Quick Answer streaming |

## DOM Mutation Observer

A `MutationObserver` on `document.documentElement` watches for DOM changes. This catches:

- Stylesheet additions (`<link>`, `<style>` elements)
- Theme class changes on `<html>` (Kagi adds `theme_*` classes)
- Dynamic content injection (search results, modals, widgets)

Plugins can register mutation handlers to react to specific DOM changes without polling.

## Plugin Patch Format

Plugins define patches as declarative objects. The patching system applies them during the hooking phase:

```typescript
{
  patches: [
    {
      target: 'Client.prototype.onSocketMessage',
      type: 'after',
      handler(original, event) {
        // Runs after the original method
        console.log('SSE message received:', event)
      }
    },
    {
      target: 'window.getKagiSetting',
      type: 'replace',
      handler(original, key) {
        if (key === 'theme') return 'theme_dark'
        return original(key)
      }
    }
  ]
}
```

Patch types:
- **before**: Run handler before the original function. Can modify arguments.
- **after**: Run handler after the original function. Receives the return value.
- **replace**: Replace the original entirely. Receives original as first argument for delegation.
