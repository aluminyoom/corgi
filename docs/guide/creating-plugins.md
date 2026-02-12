# Creating Plugins

Plugins are TypeScript modules that use `definePlugin()` to declare their behavior. The plugin runtime handles lifecycle, dependency resolution, and cleanup.

## Minimal Plugin

```typescript
import { definePlugin } from '@/plugins/api';

export const myPlugin = definePlugin({
  name: 'my-plugin',
  displayName: 'My Plugin',
  version: '1.0.0',
  authors: ['your-name'],
  description: 'What this plugin does',

  onStart(api) {
    // Called when the plugin activates.
    // Return a cleanup function or nothing.
  },

  onStop() {
    // Called when the plugin deactivates.
  },
});
```

`definePlugin()` is a type-safe identity function. It returns the definition unchanged but gives full IntelliSense for the plugin shape.

## CSS-Only Plugin

The simplest plugin type injects CSS without any JavaScript logic. Declare the `css` field and the runtime handles injection and removal:

```typescript
export const myThemePlugin = definePlugin({
  name: 'my-theme-tweak',
  displayName: 'My Theme Tweak',
  version: '0.1.0',
  authors: ['your-name'],
  description: 'Rounds all search result cards',
  css: `
    .search-result {
      border-radius: 12px;
      padding: 16px;
    }
  `,
});
```

The CSS is injected as a `<style>` element tagged with `data-corgi-plugin="my-theme-tweak"`. It is automatically removed when the plugin stops.

### Theme-Agnostic CSS

Plugins must work in both light and dark mode. Never hardcode colors. Instead use:

- `currentColor` for text-relative colors
- `color-mix(in srgb, currentColor N%, transparent)` for semi-transparent borders and backgrounds
- `var(--primary)` and `var(--secondary)` for foreground/background
- `var(--yellow)` for accent

These variables are always defined in both light and dark Kagi themes.

## Plugin API

The `api` object passed to `onStart` provides tracked access to every hook system. "Tracked" means every listener or interceptor registered through the API is automatically cleaned up when the plugin stops, even if you forget to return a cleanup function.

### DOM Observation

Watch for DOM changes on specific elements:

```typescript
onStart(api) {
  const cleanup = api.observeElement('.search-result', (mutations) => {
    console.log('Results changed:', mutations.length);
  }, { childList: true, subtree: true });

  return cleanup;
}
```

### Provider Events

Kagi emits internal events through its provider system. Listen for specific event tags:

```typescript
onStart(api) {
  api.onProviderEvent('search', (data) => {
    console.log('Search results arrived:', data);
  });

  api.onProviderEvent('free_search_remaining', (remaining) => {
    console.log('Searches left:', remaining);
  });
}
```

### Event Interception

Modify or suppress provider events before they reach Kagi's own handlers:

```typescript
onStart(api) {
  api.addEventInterceptor((tag, data) => {
    if (tag === 'search') {
      // Modify data before Kagi processes it
      return { tag, data: { ...data, modified: true } };
    }
    // Return unchanged to pass through
    return { tag, data };
  });
}
```

### Fetch Interception

Intercept outgoing fetch requests or transform responses:

```typescript
onStart(api) {
  // Modify requests before they fire
  api.addFetchRequestInterceptor((url, init) => {
    return { url, init };
  });

  // Transform responses after they arrive
  api.addFetchResponseInterceptor(async (url, response) => {
    return response;
  });
}
```

### Global Traps

Watch for assignments to global variables (useful for capturing Kagi's runtime objects):

```typescript
onStart(api) {
  api.trapGlobal('kagiSettings', (settings) => {
    console.log('Kagi settings object:', settings);
  });
}
```

### Function Wrapping

Patch methods on existing objects with before/after/replace hooks:

```typescript
onStart(api) {
  api.wrapFunction(someObject, 'methodName', {
    before(...args) {
      console.log('Called with:', args);
      // Return modified args array, or void to pass through
    },
    after(result) {
      console.log('Returned:', result);
      // Return modified result, or void to pass through
    },
  });
}
```

### CSS Variables

Read and write CSS custom properties on `:root`:

```typescript
onStart(api) {
  const original = api.getComputedVariable('--app-bg');
  api.setVariable('--app-bg', '#1a1a2e');

  return () => {
    api.removeVariable('--app-bg');
  };
}
```

### Dynamic CSS Injection

Inject CSS programmatically (for styles that depend on runtime state):

```typescript
onStart(api) {
  const style = api.injectCSS(`
    .my-widget { color: var(--primary); }
  `);
  // style is the <style> element; auto-removed on stop
}
```

## Declarative Patches

For simple method wrapping that does not need runtime logic, declare patches in the definition:

```typescript
definePlugin({
  name: 'my-plugin',
  patches: [
    {
      target: 'Client.prototype',
      method: 'onSocketMessage',
      before(...args) {
        console.log('Message received:', args);
      },
    },
  ],
});
```

The `target` is a dot-separated path resolved from `window`. Patches are applied at start and reverted at stop.

## Dependencies

Plugins can depend on other plugins:

```typescript
definePlugin({
  name: 'my-plugin',
  dependencies: ['base-plugin'],
  onStart(api) {
    // base-plugin is guaranteed to be running
  },
});
```

The registry uses topological sorting to start plugins in dependency order. If a dependency is missing or in an error state, the dependent plugin fails with a descriptive error.

## Lifecycle

Plugins go through a defined set of states:

```
registered -> started -> stopped
                 |
                 v
               error
```

1. **Register**: `registerPlugin(definition)` adds the plugin to the registry without starting it.
2. **Start**: `startPlugin(name)` resolves dependencies, applies patches, registers hooks, injects CSS, and calls `onStart`.
3. **Stop**: `stopPlugin(name)` calls `onStop`, then runs all tracked cleanups in reverse order.
4. **Error**: If `onStart` throws or a dependency is missing, the plugin moves to error state and all partial cleanups run.

## Error Isolation

Plugin errors never crash other plugins or the core extension. Each plugin runs in a try/catch boundary. If `onStart` throws, the plugin enters error state and any hooks registered up to that point are cleaned up. Other plugins continue running.

## Registration

Built-in plugins are registered in `corgi-main.ts` during the bridge `ready` handshake. To add a new built-in:

1. Create your plugin file in `plugins/builtins/` (or `plugins/builtins/polish/` for polish plugins)
2. Export from `plugins/builtins/index.ts`
3. Import and call `registerPlugin()` in `corgi-main.ts`
4. Add the plugin metadata to `BUILTIN_PLUGINS` in `utils/storage.ts`
5. If it belongs to a group, add its name to the group's `plugins` array in `BUILTIN_GROUPS`

## Full API Reference

| Method | Purpose |
|--------|---------|
| `trapGlobal(property, callback)` | Watch for global variable assignments |
| `wrapFunction(target, method, options)` | Patch object methods with before/after/replace |
| `onProviderEvent(tag, listener)` | Listen to Kagi provider events |
| `addEventInterceptor(interceptor)` | Modify or suppress provider events |
| `addFetchRequestInterceptor(interceptor)` | Modify outgoing fetch requests |
| `addFetchResponseInterceptor(interceptor)` | Transform fetch responses |
| `observeElement(selector, handler, options)` | Watch DOM elements for changes |
| `setVariable(name, value)` | Set a CSS variable on `:root` |
| `removeVariable(name)` | Remove a CSS variable |
| `getComputedVariable(name)` | Read the computed value of a CSS variable |
| `injectCSS(css)` | Inject a `<style>` element (auto-removed on stop) |
