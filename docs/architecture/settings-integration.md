# Settings Integration

Kagistry embeds its management UI directly into Kagi's settings page rather than using a traditional extension popup. When you navigate to `/settings/kagistry`, the extension intercepts the page and renders its own content inside Kagi's native layout.

## Why Not a Popup?

Extension popups feel like a separate application. They close when you click away, they have their own styling that never quite matches the host page, and they create a mental context switch. By injecting into the settings page, Kagistry feels like a feature Kagi shipped themselves.

The popup still exists, but only as a one-button launcher that opens `/settings/kagistry` in a new tab.

## Route Detection

When Kagi loads `/settings/kagistry`, the server does not recognize the slug and falls back to the General settings content. Kagistry detects this route and replaces the page content before the user sees it.

The detection runs from the ISOLATED world content script since it needs access to `chrome.storage` for reading theme and plugin state.

```
content.ts
  -> initSettingsIntegration()
    -> isSettingsPage()          Check if URL starts with /settings
    -> injectNavLink()           Add "Kagistry" to the sidebar
    -> isKagistryRoute()         Check if URL is /settings/kagistry
    -> mountSettingsPage()       Replace <main> with Kagistry UI
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

Kagistry inserts its link before the `<hr>` separator (which sits above "Sign Out") to position it at the bottom of the main settings list.

When the Kagistry route is active, all other nav links are deactivated and the Kagistry link gets the `active` class and `aria-current="page"` attribute.

## Page Content

The settings page replaces Kagi's `<main>` element content with Kagistry's own UI. The page is built with vanilla DOM manipulation (no framework) to keep the content script lightweight and avoid framework conflicts with Kagi's page.

The page renders:
- **Header** with the Kagistry title and version
- **Enable/disable toggle** for the entire extension
- **Themes section** listing installed themes with per-theme enable/disable
- **Import button** for loading theme JSON files
- **Plugins section** listing active plugins

All elements use Kagi's own CSS utility classes (`heading-2`, `text-sm`, `color-muted`, `rounded-lg`, `flex`, `align-center`) so they match the native look without custom styles. The only custom CSS is for toggle switches and buttons, scoped under `#kagistry-settings-page`.

## History Management

Clicking the Kagistry nav link uses `history.pushState()` instead of a full navigation to avoid reloading the page. A `popstate` listener handles browser back/forward navigation between Kagistry and other settings tabs.

When navigating away from `/settings/kagistry`, the Kagistry content is removed and Kagi's native content reappears on the next full page load.

## DOM Resilience

The settings integration watches for DOM changes using a `MutationObserver`. If Kagi's page navigation removes the nav link (for example, during a soft navigation between settings pages), the observer re-injects it.

The observer runs on `document.body` with `childList: true` and `subtree: true`, checking for the presence of the Kagistry nav link element by its ID.
