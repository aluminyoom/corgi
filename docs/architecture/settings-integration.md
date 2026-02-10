# Settings Integration

Corgi embeds its management UI directly into Kagi's settings page rather than using a traditional extension popup. When you navigate to `/settings/corgi`, the extension intercepts the page and renders its own content inside Kagi's native layout.

## Why Not a Popup?

Extension popups feel like a separate application. They close when you click away, they have their own styling that never quite matches the host page, and they create a mental context switch. By injecting into the settings page, Corgi feels like a feature Kagi shipped themselves.

There is no popup at all. Clicking the extension icon opens `/settings/corgi` directly through the `browser.action.onClicked` handler.

## Route Detection

When Kagi loads `/settings/corgi`, the server does not recognize the slug and falls back to the General settings content. Corgi detects this route and replaces the page content before the user sees it.

The detection runs from the ISOLATED world content script since it needs access to `chrome.storage` for reading theme and plugin state.

```
content.ts
  -> initSettingsIntegration()
    -> isSettingsPage()          Check if URL starts with /settings
    -> injectNavLink()           Add "Corgi" to the sidebar
    -> isCorgiRoute()         Check if URL is /settings/corgi
    -> mountSettingsPage()       Replace <main> with Corgi UI
```

## Nav Link Injection

The settings sidebar uses `nav#settings-menu` with a `div.cth_settings_nav_menu` container. Each link follows a consistent pattern:

```html
<a href="/settings/slug" class="nav-link ws-nowrap py-8 px-10 mx-n10 flex align-center rounded-full ws-normal">
  <i class="mr-8 flex icon-sm align-self-start mt-2">
    <svg>...</svg>
  </i>
  <span>Link Text</span>
</a>
```

Corgi inserts its link before the `<hr>` separator (which sits above "Sign Out") to position it at the bottom of the main settings list.

When the Corgi route is active, all other nav links are deactivated and the Corgi link gets the `--active` class and `aria-current="page"` attribute. Kagi uses a double-dash prefix convention for its active state class.

## Page Content

The settings page replaces Kagi's `<main>` element content with Corgi's own UI. The page is built with vanilla DOM manipulation (no framework) to keep the content script lightweight and avoid framework conflicts with Kagi's page.

The page renders:
- **Header** with the Corgi title and version
- **Enable/disable toggle** for the entire extension
- **Plugin groups section** with batch toggles and expandable member lists
- **Plugins section** listing individual plugins with per-plugin enable/disable toggles
- **Themes section** listing installed themes with per-theme enable/disable
- **Import button** for loading theme JSON files

All elements use Kagi's own CSS classes and markup patterns (`settings-row-box`, `k_ui_toggle_switch`, native spacing utilities) so they are visually indistinguishable from Kagi's own settings. No custom CSS is needed.

## Control Center Shortcut

Kagi's Control Center is the quick-settings sidebar that opens when you press `c` or click the gear icon. Corgi injects a link at the bottom of the Control Center nav that navigates to `/settings/corgi`.

The panel (`#quickSettings`) is lazily loaded. It does not exist in the DOM until the user opens it for the first time. Corgi handles this with three detection strategies:

1. **Direct check**: On injection, try to find the panel immediately
2. **Event listener**: Listen for Kagi's `quick-settings-opened` custom event
3. **MutationObserver**: Watch `document.body` for child additions in case the panel is created without the custom event

The link uses the same `.nav-item-link` class as other Control Center items and navigates with a full page load (not `pushState`) since the Control Center is often opened from non-settings pages.

## History Management

Clicking the Corgi nav link uses `history.pushState()` instead of a full navigation to avoid reloading the page. A `popstate` listener handles browser back/forward navigation between Corgi and other settings tabs.

When navigating away from `/settings/corgi`, the Corgi content is removed and Kagi's native content reappears on the next full page load.

## DOM Resilience

The settings integration watches for DOM changes using a `MutationObserver`. If Kagi's page navigation removes the nav link (for example, during a soft navigation between settings pages), the observer re-injects it.

The observer runs on `document.body` with `childList: true` and `subtree: true`, checking for the presence of the Corgi nav link element by its ID. When the nav link is re-injected, the click handler is re-wired to prevent duplicate navigations.

When navigating between Kagi's settings tabs and the Corgi tab, the extension hides Kagi's native content instead of destroying it. This avoids breaking Kagi's own page state and prevents the duplication issues that come from clearing `innerHTML`.
