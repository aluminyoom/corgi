# Using Plugins

Plugins extend Kagi with new features by hooking into the page's JavaScript, DOM, network layer, and styles. Unlike themes (which only change how things look), plugins can change how things work.

## Managing Plugins

Open `kagi.com/settings/corgi`. The Plugins section lists every installed plugin with a toggle to enable or disable it. Changes take effect on the next page load.

## Built-in Plugins

Corgi ships with two standalone plugins enabled by default:

- **search-counter** displays a floating badge in the bottom-right corner showing how many results the current search returned.
- **usage-counter** fetches your billing data and shows a progress bar of remaining searches below the filter panel. It caches results in `sessionStorage` for five minutes to avoid redundant requests.

Both can be individually toggled from the settings page.

## Plugin Groups

Some plugins are bundled under a group. Groups provide a single toggle that enables or disables all member plugins at once. You can also expand the group and override individual members.

### Corgi Polish

The **Corgi Polish** group ships with Corgi but is disabled by default. It contains five CSS-only plugins that apply subtle visual refinements without changing Kagi's core identity:

| Plugin | What it does |
|--------|-------------|
| refined-typography | Tighter line heights, bolder headings, adjusted letter spacing |
| smoother-interactions | Hover transitions, focus rings, scale transforms on buttons |
| cleaner-cards | Rounded corners and improved padding on result cards |
| visual-hierarchy | Muted secondary text, clearer section separation |
| qol | Centered sidebar icons, aligned inline elements |

Toggle the group on to enable all five. Expand the group to disable any individual plugin you do not want.

## How Plugins Load

When a Kagi page loads, the extension content script injects `corgi-main.js` into the page. The main script registers all built-in plugins, then asks the content script (through the bridge) which plugins the user has disabled. Any plugin not in the disabled list starts immediately.

Because plugins initialize during page load, toggling a plugin on or off in settings does not affect the current page. Reload the page to see the change.

## Third-Party Plugins

Corgi exposes a runtime API on `window.__corgi` that lets external scripts define and install plugins. A third-party plugin can be loaded from the browser console or from another extension:

```javascript
const { define } = await window.__corgi.plugins.define();
const { install } = await window.__corgi.plugins.install();

const myPlugin = define({
  name: 'my-custom-plugin',
  version: '0.1.0',
  author: 'me',
  description: 'Does something cool',
  onStart(api) {
    api.injectCSS('.search-result { border-left: 3px solid var(--yellow); }');
  },
});

install(myPlugin);
```

Third-party plugins follow the same lifecycle and API as built-in ones. See [Creating Plugins](./creating-plugins.md) for the full guide.
