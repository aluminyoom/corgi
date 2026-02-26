# Plugin System

Corgi's plugin system lets developers extend Kagi with new features by hooking into the page's JavaScript, DOM, network requests, and styles. Each plugin declares what it needs, and the runtime handles lifecycle, dependency resolution, and cleanup.

## Defining a Plugin

```typescript
import { definePlugin } from "@/plugins/api";

export const myPlugin = definePlugin({
  name: "my-plugin",
  displayName: "My Plugin",
  version: "1.0.0",
  authors: ["your-name"],
  description: "What this plugin does",

  onStart(api) {
    // Called when the plugin activates.
    // Return a cleanup function or nothing.
    const cleanup = api.onProviderEvent("search", (tag, data) => {
      console.log("Search results arrived:", data);
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

The `api` object passed to `onStart` provides tracked access to all hook systems, meaning every listener or interceptor registered through the API is automatically cleaned up when the plugin stops, even if you forget to call the cleanup function.

| Method                                       | Purpose                                           |
| -------------------------------------------- | ------------------------------------------------- |
| `trapGlobal(property, callback)`             | Watch for global variable assignments             |
| `wrapFunction(target, method, options)`      | Patch object methods with before/after/replace    |
| `onProviderEvent(tag, listener)`             | Listen to Kagi provider events                    |
| `addEventInterceptor(interceptor)`           | Modify or suppress provider events                |
| `addFetchRequestInterceptor(interceptor)`    | Modify outgoing fetch requests                    |
| `addFetchResponseInterceptor(interceptor)`   | Transform fetch responses                         |
| `observeElement(selector, handler, options)` | Watch DOM elements for changes                    |
| `setVariable(name, value)`                   | Set a CSS variable on `:root`                     |
| `removeVariable(name)`                       | Remove a CSS variable                             |
| `getComputedVariable(name)`                  | Read the computed value of a CSS variable         |
| `injectCSS(css)`                             | Inject a `<style>` element (auto-removed on stop) |

## Lifecycle

Plugins go through a defined set of states:

```
registered -> started -> stopped
                 |
                 v
               error
```

1. **Register**: `registerPlugin(definition)` adds the plugin to the registry without starting it.
2. **Start**: `startPlugin(name)` resolves dependencies, applies patches, registers hooks, and calls `onStart`.
3. **Stop**: `stopPlugin(name)` calls `onStop` and then runs all tracked cleanups in reverse order.
4. **Error**: If `onStart` throws or a dependency is missing, the plugin moves to error state and all partial cleanups run.

## Dependencies

Plugins can declare dependencies on other plugins:

```typescript
definePlugin({
  name: "my-plugin",
  dependencies: ["base-plugin"],
  // ...
});
```

The registry uses topological sorting to start plugins in dependency order, and if a dependency is missing or in an error state, the dependent plugin fails with a clear error message.

## Declarative Patches

For simple method wrapping, plugins can declare patches without writing imperative code:

```typescript
definePlugin({
  name: "my-plugin",
  patches: [
    {
      target: "Client.prototype",
      method: "onSocketMessage",
      before(...args) {
        console.log("Message received:", args);
      },
    },
  ],
});
```

The `target` is a dot-separated path resolved from `window`. Patches are applied at start and reverted at stop.

## Built-in Plugins

Corgi ships with built-in plugins in `plugins/builtins/`. Plugins are auto-discovered via `discover.ts`, which uses `import.meta.glob` to eagerly import all `.ts` files under `builtins/` (excluding `index.ts`, `groups.ts`, and `discover.ts`). Placing a file there with an exported `definePlugin({...})` object registers it automatically.

### Root-Level Plugins

| Plugin                 | Type     | Description                                                                                                                                            |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **usage-counter**      | JS       | Fetches account usage data from the billing page and displays a progress bar of remaining searches. Uses `sessionStorage` caching.                     |
| **support-redirect**   | JS       | Redirects support page links.                                                                                                                          |
| **custom-background**  | JS + CSS | Custom background image for the landing page via CSS injection. Uses `file` setting for image upload.                                                  |
| **custom-font**        | JS       | Google Fonts injection with configurable font family and weight.                                                                                       |
| **custom-logo**        | JS       | Replaces the landing page doggo with a custom logo. Supports fit modes (contain/cover/fill/scale-down/none).                                           |
| **custom-placeholder** | JS       | Custom search bar placeholder text.                                                                                                                    |
| **hide-favicons**      | CSS-only | Hides favicons from search results.                                                                                                                    |
| **result-counter**     | CSS-only | Adds result numbers using CSS counters.                                                                                                                |
| **highlight-terms**    | JS + CSS | Highlights search terms in results with a configurable color.                                                                                          |
| **oneko**              | JS       | Interactive cat sprite that chases the cursor. Bundled sprite, position persisted via localStorage across pages.                                       |
| **fatass-horse**       | JS       | Interactive horse sprite that chases the cursor. Bundled sprite sheet, position persisted via localStorage.                                            |
| **infinite-scroll**    | JS + CSS | Auto-loads more SERP results on scroll. Hides the native load-more button and clicks it programmatically. Uses MutationObserver to detect new content. |
| **feeling-lucky**      | JS + CSS | Adds an "I'm Feeling Lucky" pill button on the landing page. Navigates to the first search result using a `corgi_lucky` URL parameter.                 |

### Corgi Polish

Corgi ships with a group of twelve CSS-only plugins under `plugins/builtins/polish/` that provide visual refinements making Kagi feel more polished without changing its core identity. All are disabled by default and bundled under the "Corgi Polish" plugin group; you can toggle the entire group at once or expand it and pick individually.

| Plugin                    | Description                                                                     |
| ------------------------- | ------------------------------------------------------------------------------- |
| **refined-typography**    | Tighter line heights, improved font weights on headings, better letter spacing. |
| **smoother-interactions** | Subtle transitions on hover states, focus rings, scale transforms.              |
| **cleaner-cards**         | Soft backgrounds using `color-mix`, consistent border-radius and padding.       |
| **visual-hierarchy**      | Muted secondary text through opacity, stronger result group separation.         |
| **centered-header**       | Centers the SERP header.                                                        |
| **edge-to-edge-nav**      | Full-width navigation bar.                                                      |
| **modern-landing-tabs**   | Modernized landing page tab bar.                                                |
| **pill-filters**          | Pill-shaped search filter buttons.                                              |
| **qol**                   | Quality-of-life CSS tweaks.                                                     |
| **serp-card-wrapping**    | Card wrapping for search results.                                               |
| **sidebar-categories**    | Styled sidebar categories.                                                      |
| **sticky-sidebar**        | Sticky right sidebar on SERP.                                                   |

All polish plugins use theme-agnostic CSS exclusively, relying on `currentColor`, `color-mix()`, and Kagi's own CSS variables (`--primary`, `--secondary`, `--yellow`) so they work in both light and dark mode without any color hardcoding.

## Plugin Patterns

### CSS-Only Plugins

The simplest plugins just provide a `css` property. The runtime injects this as a `<style>` element when the plugin starts and removes it on stop.

```typescript
export const hideFaviconsPlugin = definePlugin({
  name: "hide-favicons",
  displayName: "Hide Favicons",
  version: "0.1.0",
  authors: ["aluminyoom"],
  description: "Hides favicons from search results",
  defaultEnabled: false,
  css: `.sri-url .favicon { display: none !important; }`,
});
```

### JS Plugins

Plugins that need runtime behavior provide `onStart(api)`, which can return an optional cleanup function. Async `onStart` is supported since the registry detects Promise returns and handles `.then()` and `.catch()` for cleanup registration.

```typescript
onStart(api) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return () => el.remove();
},
```

### Plugin Settings

Plugins can declare per-plugin settings with the `settings` array, supporting types `'boolean'`, `'string'`, `'number'`, `'select'`, and `'file'` (the select type uses `options: { label, value }[]`).

```typescript
settings: [
  { key: 'color', label: 'Highlight Color', type: 'string', default: '#ffeb3b' },
  { key: 'fitMode', label: 'Image Fit', type: 'select', default: 'contain',
    options: [
      { label: 'Contain', value: 'contain' },
      { label: 'Cover', value: 'cover' },
    ] },
],
```

Settings are read and written through bridge actions `plugin:settings:get` and `plugin:settings:set`, accessed via `api.getSettings<T>()` and `api.setSettings(values)`.

## Plugin Groups

Plugin groups bundle related plugins under a single toggle. Enabling a group enables all of its member plugins, disabling it disables all members, and users can also expand the group in settings to override individual plugins.

Groups are defined in `groups.ts` as `BUILTIN_GROUP_DEFS`. The `GroupDef` interface lives in `groups.ts`, while `PluginGroupMeta` (used by the settings UI) is in `discover.ts`:

```typescript
// groups.ts
export interface GroupDef {
  name: string;
  displayName: string;
  version: string;
  authors: string[];
  description: string;
  defaultEnabled: boolean;
}

// discover.ts
export interface PluginGroupMeta {
  name: string;
  displayName: string;
  version: string;
  authors: string[];
  description: string;
  plugins: string[]; // Computed from plugins with matching group field
}
```

Plugins declare group membership via their `group` field, and the `discover.ts` module computes group membership at build time by scanning all plugins for matching values.

The group toggle writes to the same `pluginStates.disabled` array as individual toggles: when a group is toggled on all its plugin names are removed from the disabled list, and when toggled off all are added.

Groups are a UI and storage concept only. The plugin runtime has no awareness of groups and simply reads the flat disabled list, starting or skipping plugins accordingly.

### Plugin State Persistence

Plugin enabled/disabled state is stored in `pluginStates` (extension local storage), and the settings page reads and writes this storage directly from the ISOLATED world. When plugins start in the MAIN world, they request the disabled list through a `plugin:state` bridge message and skip any plugins the user has turned off.

Changes to plugin toggles take effect on the next page load because plugins initialize once during the bridge `ready` handshake.

## Error Isolation

Plugin errors never crash other plugins or the core extension. Each plugin runs in a try/catch boundary, so if `onStart` throws the plugin enters an error state, any hooks it registered up to that point are cleaned up, and other plugins continue running normally.
