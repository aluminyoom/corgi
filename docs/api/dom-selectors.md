# DOM Selectors

Reference for Kagi's DOM structure. Use these selectors in theme CSS and plugin DOM observation.

::: tip
Kagi does not use a frontend framework. All elements are server-rendered HTML with vanilla JS. Class names follow a mix of BEM-like conventions and utility classes. Selectors should be stable across page loads, though they may change with Kagi updates.
:::

## Landing Page

| Selector | Description |
|----------|-------------|
| `#searchForm` | Main search form |
| `#searchBar` | Search text input |
| `#searchFormSubmit` | Search submit button |
| `.search-form-wrapper` / `.s-f-w` | Search form wrapper (JS-managed class) |
| `.search-form-container` | Outer search form container |
| `.search-input-container` | Search input container (has border-radius, box-shadow) |
| `.search-form .search-form-icons` | Icon container inside search bar |
| `.clouds` | Cloud/doggo illustration container |
| `.app-logo` | Kagi logo on landing page |

## Search Results Page

| Selector | Description |
|----------|-------------|
| `._0_main-search-results` | Results container (per-page blocks) |
| `._0_main-search-results#nextPage` | Template for next page of results |
| `.search-result` | Individual search result container |
| `.__srgi` | Search result group item |
| `.__sri-title` | Result title container |
| `.__sri_title_link` | Result title link (anchor element) |
| `.__sri-url` | Result URL display |
| `.__sri-desc` | Result description/snippet |
| `#search-form` | Main search form (SERP variant) |
| `#search-input` | Search text input (SERP variant) |
| `.right-sidebar` | Right sidebar container |
| `.related-searches` | Related searches section |
| `#load_more_results` | "More Results" pagination button |
| `.footer-search-results` | Footer containing pagination controls |
| `._0_page-separator` | Page separator between result batches |
| `._0_page-separator#nextSeparator` | Template for next page separator |
| `#layout-v2` | Main layout root |

## Settings Page

| Selector | Description |
|----------|-------------|
| `nav#settings-menu` | Settings navigation sidebar |
| `.cth_settings_nav_menu` | Nav menu container inside sidebar |
| `.nav-link` | Individual navigation link |
| `main` | Main content area |
| `.heading-2` | Section heading (h1-level) |
| `#corgi-plugin-list` | Corgi's injected plugin list container |

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
| `/search` | Search results |
| `/settings` | Settings pages |
| `/landing` | Homepage / search landing |
| `/images` | Image search results |

::: warning
Note: `data-path` values include the leading slash (e.g., `/search` not `search`). Use `document.documentElement.getAttribute('data-path')` to read.
:::

Themes can use this attribute to scope styles:

```css
html[data-path="/search"] .search-result {
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

Kagi can change their DOM structure at any time, so Corgi cannot guarantee selector stability. If a theme or plugin breaks after a Kagi update, the selectors in this reference may need updating. File an issue if you notice a broken selector.
