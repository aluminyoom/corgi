# Creating Plugins

Plugins are TypeScript modules that use `definePlugin()` to declare their behavior. The plugin runtime handles lifecycle, dependency resolution, and cleanup automatically.

::: warning Hook API coverage
The plugin hook API (`onProviderEvent`, `addEventInterceptor`, `observeElement`, etc.) is fully implemented and works, but most built-in plugins still hardcode their DOM manipulation directly in `onStart` rather than going through these hooks. This will be refactored over time so that more plugins use the proper API surface. When writing new plugins, prefer the hook API where possible.
:::

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

`definePlugin()` is a type-safe identity function that returns the definition unchanged but provides full IntelliSense for the plugin shape.

## Registration

Drop your file anywhere inside `extension/src/plugins/builtins/` (or `builtins/polish/` for polish group plugins). The auto-discovery system in `discover.ts` uses `import.meta.glob` to eagerly import every `.ts` file in that tree, so placing the file there is all that's needed.

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

The CSS is injected as a `<style>` element tagged with `data-corgi-plugin="my-theme-tweak"` and is automatically removed when the plugin stops.

### Theme-Agnostic CSS

Plugins must work in both light and dark mode, so never hardcode colors. Use:

- `currentColor` for text-relative colors
- `color-mix(in srgb, currentColor N%, transparent)` for semi-transparent borders and backgrounds
- `var(--primary)` and `var(--secondary)` for foreground/background
- `var(--yellow)` for accent

These variables are always available in both light and dark Kagi themes.

## Plugin API

The `api` object passed to `onStart` provides tracked access to every hook system. "Tracked" means that every listener or interceptor registered through the API is automatically cleaned up when the plugin stops, even if you forget to return a cleanup function.

### DOM Observation

```typescript
onStart(api) {
  const cleanup = api.observeElement('.search-result', (mutations) => {
    console.log('Results changed:', mutations.length);
  }, { childList: true, subtree: true });

  return cleanup;
}
```

### Provider Events

Kagi emits internal events through its provider system, and you can listen for specific event tags:

```typescript
onStart(api) {
  api.onProviderEvent('search', (data) => {
    console.log('Search results arrived:', data);
  });
}
```

### Event Interception

You can modify or suppress provider events before they reach Kagi's own handlers:

```typescript
onStart(api) {
  api.addEventInterceptor((tag, data) => {
    if (tag === 'search') {
      return { tag, data: { ...data, modified: true } };
    }
    return { tag, data };
  });
}
```

### Fetch Interception

Intercept outgoing fetch requests or transform responses:

```typescript
onStart(api) {
  api.addFetchRequestInterceptor((url, init) => {
    return { url, init };
  });

  api.addFetchResponseInterceptor(async (url, response) => {
    return response;
  });
}
```

### Global Traps

Watch for assignments to global variables, which is useful for capturing Kagi's runtime objects:

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
    },
    after(result) {
      console.log('Returned:', result);
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

For styles that depend on runtime state, inject CSS programmatically:

```typescript
onStart(api) {
  const style = api.injectCSS(`
    .my-widget { color: var(--primary); }
  `);
  // style is the <style> element; auto-removed on stop
}
```

### Settings

Plugins can declare user-facing settings and read/write them at runtime:

```typescript
onStart(api) {
  const settings = await api.getSettings<{ color: string }>();
  await api.setSettings({ color: '#ff0000' });
}
```

## Declarative Patches

For simple method wrapping that does not need runtime logic, you can declare patches directly in the definition:

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

Plugins move through a defined set of states:

```
registered -> started -> stopped
                 |
                 v
               error
```

1. **Register**: The plugin is added to the registry without starting.
2. **Start**: Dependencies resolve, patches apply, hooks register, CSS injects, and `onStart` runs.
3. **Stop**: `onStop` runs, then all tracked cleanups fire in reverse order.
4. **Error**: If `onStart` throws or a dependency is missing, the plugin enters error state and all partial cleanups run.

Plugin errors never crash other plugins or the core extension. Each plugin runs in a try/catch boundary, so if one fails, the rest continue.

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
| `getSettings()` | Read the plugin's persisted settings |
| `setSettings(values)` | Write to the plugin's persisted settings |
