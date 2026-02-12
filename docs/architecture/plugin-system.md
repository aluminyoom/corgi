# Plugin System

Corgi's plugin system lets developers extend Kagi with new features by hooking into the page's JavaScript, DOM, network requests, and styles. The design is inspired by Vencord's plugin architecture: each plugin declares what it needs, and the runtime handles lifecycle, dependency resolution, and cleanup.

## Defining a Plugin

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
    const cleanup = api.onProviderEvent('search', (tag, data) => {
      console.log('Search results arrived:', data);
    });

    return () => {
      cleanup();
    };
  },

  onStop() {
    // Called when the plugin deactivates.
  },
});
```

`definePlugin()` is a type-safe identity function. It returns the definition unchanged but provides full IntelliSense for the plugin shape.

## Plugin API

The `api` object passed to `onStart` provides tracked access to all hook systems. "Tracked" means every listener or interceptor registered through the API is automatically cleaned up when the plugin stops, even if you forget to call the cleanup function.

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

## Lifecycle

Plugins go through a defined set of states:

```
registered -> started -> stopped
                 |
                 v
               error
```

1. **Register**: `registerPlugin(definition)` adds the plugin to the registry without starting it
2. **Start**: `startPlugin(name)` resolves dependencies, applies patches, registers hooks, calls `onStart`
3. **Stop**: `stopPlugin(name)` calls `onStop`, runs all tracked cleanups in reverse order
4. **Error**: If `onStart` throws or a dependency is missing, the plugin moves to error state and all partial cleanups run

## Dependencies

Plugins can declare dependencies on other plugins:

```typescript
definePlugin({
  name: 'my-plugin',
  dependencies: ['base-plugin'],
  // ...
});
```

The registry uses topological sorting to start plugins in dependency order. If a dependency is missing or in an error state, the dependent plugin fails with a clear error message.

## Declarative Patches

For simple method wrapping, plugins can declare patches without writing imperative code:

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

## Built-in Plugins

Corgi ships with built-in plugins in `plugins/builtins/`:

- **search-counter**: Observes the DOM and shows a live count of search results in a floating badge. Demonstrates `observeElement`, `onProviderEvent`, and `injectCSS`.
- **usage-counter**: Fetches account usage data from the billing page and displays a progress bar of remaining searches below the filter panel. Uses `sessionStorage` caching to avoid redundant requests.

Both are enabled by default and registered in `corgi-main.ts`.

### Corgi Polish

Corgi also ships with a group of four CSS-only plugins under `plugins/builtins/polish/`. These provide subtle visual refinements that make Kagi feel more polished without changing its core identity. All four are disabled by default and bundled under the "Corgi Polish" plugin group.

- **corgi-polish/refined-typography**: Tighter line heights, improved font weights on headings, better letter spacing on URLs and dates.
- **corgi-polish/smoother-interactions**: Subtle transitions on hover states, focus rings using `var(--yellow)`, scale transforms on interactive elements.
- **corgi-polish/cleaner-cards**: Soft backgrounds using `color-mix`, consistent border-radius, and improved padding on search result cards and settings rows.
- **corgi-polish/visual-hierarchy**: Muted secondary text through opacity, stronger result group separation with borders, and hover reveal on more-menus.

All four plugins use theme-agnostic CSS exclusively. They rely on `currentColor`, `color-mix()`, and Kagi's own CSS variables (`--primary`, `--secondary`, `--yellow`) so they work in both light and dark mode without any color hardcoding.

## Plugin Groups

Plugin groups bundle related plugins under a single toggle. Enabling a group enables all of its member plugins. Disabling a group disables all members. Users can also expand the group in settings and override individual plugins.

Groups are defined in `storage.ts` as `BUILTIN_GROUPS`:

```typescript
export interface PluginGroupMeta {
  name: string;
  displayName: string;
  version: string;
  authors: string[];
  description: string;
  plugins: string[];  // Plugin name references
}
```

The group toggle writes to the same `pluginStates.disabled` array as individual toggles. When a group is toggled on, all its plugin names are removed from the disabled list. When toggled off, all are added.

Groups are a UI and storage concept only. The plugin runtime has no awareness of groups. It reads the flat disabled list and starts or skips plugins accordingly.

### Plugin State Persistence

Plugin enabled/disabled state is stored in `pluginStates` (extension local storage). The settings page reads and writes this storage directly from the ISOLATED world. When plugins start in the MAIN world, they request the disabled list through a `plugin:state` bridge message and skip any plugins the user has turned off.

Changes to plugin toggles take effect on the next page load because plugins initialize once during the bridge `ready` handshake.

## Error Isolation

Plugin errors never crash other plugins or the core extension. Each plugin runs in a try/catch boundary. If `onStart` throws, the plugin enters an error state and any hooks it registered up to that point are cleaned up. Other plugins continue running normally.
