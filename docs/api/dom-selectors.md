# DOM Selectors

Reference for Kagi's DOM structure. Use these selectors in theme CSS and plugin DOM observation.

::: tip
Kagi does not use a frontend framework. All elements are server-rendered HTML with vanilla JS. Class names follow a mix of BEM-like conventions and utility classes. Selectors should be stable across page loads, though they may change with Kagi updates.
:::

## Search Results Page

| Selector | Description |
|----------|-------------|
| `.search-result` | Individual search result container |
| `.__srgi` | Search result group item |
| `.sri-title` | Result title link |
| `.sri-url` | Result URL display |
| `.sri-desc` | Result description/snippet |
| `#search-form` | Main search form |
| `#search-input` | Search text input |
| `.right-sidebar` | Right sidebar container |
| `.related-searches` | Related searches section |

## Settings Page

| Selector | Description |
|----------|-------------|
| `nav#settings-menu` | Settings navigation sidebar |
| `.cth_settings_nav_menu` | Nav menu container inside sidebar |
| `.nav-link` | Individual navigation link |
| `main` | Main content area |
| `.heading-2` | Section heading (h1-level) |

## Layout

| Selector | Description |
|----------|-------------|
| `html[data-path]` | Root element with current page type |
| `.header` | Top navigation bar |
| `.search-form-container` | Search bar wrapper |
| `.main-content` | Primary content column |

## data-path Values

The `data-path` attribute on `<html>` indicates the current page type:

| Value | Page |
|-------|------|
| `search` | Search results |
| `settings` | Settings pages |
| `landing` | Homepage / search landing |
| `images` | Image search results |

Themes can use this attribute to scope styles:

```css
html[data-path="search"] .search-result {
  border-radius: 12px;
}
```

## Widget Selectors

Kagi renders inline widgets for certain queries. These use `provider:widget_*` events and render into specific containers:

| Selector | Description |
|----------|-------------|
| `.widget` | Generic widget container |
| `.wikipedia-widget` | Wikipedia summary card |
| `.interesting-finds` | "Interesting Finds" section |

## Stability

Kagi can change their DOM structure at any time. Kagistry cannot guarantee selector stability. If a theme or plugin breaks after a Kagi update, the selectors in this reference may need updating. File an issue if you notice a broken selector.
