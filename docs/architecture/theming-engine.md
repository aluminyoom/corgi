# Theming Engine

The theming engine controls how Corgi applies visual changes to Kagi pages. It operates at three levels: CSS variable overrides, arbitrary CSS injection, and stylesheet interception.

## CSS Variable Overrides

Kagi defines hundreds of CSS custom properties on `:root` for colors, fonts, spacing, and component styles. Corgi themes can override any of these without writing selector-based CSS.

Variable overrides are applied as a `<style>` element injected into `<corgi-styles>` before Kagi's own stylesheets load:

```css
:root {
  --app-bg: #0a0a0a !important;
  --app-text: #e0e0e0 !important;
  --primary: #ff6b35 !important;
  /* ... */
}
```

Using `!important` ensures overrides take precedence regardless of specificity in Kagi's styles.

## Custom CSS

Themes can include arbitrary CSS for changes that go beyond variable overrides, such as hiding elements, repositioning layouts, or adding visual effects. Custom CSS is injected into a separate `<style>` element within `<corgi-styles>`.

## Style Container

Corgi creates a custom HTML element hierarchy for style management:

```html
<corgi-styles>
  <style data-corgi="variables">
    /* CSS variable overrides from active theme */
  </style>
  <style data-corgi="theme-css">
    /* Arbitrary CSS from active theme */
  </style>
  <style data-corgi="plugin-styles">
    /* CSS injected by plugins via managedStyle */
  </style>
  <style data-corgi="user-css">
    /* User's custom CSS (manual overrides) */
  </style>
</corgi-styles>
```

This container is injected at `document_start` as the first child of `<html>`, before `<head>`. When Kagi's stylesheets load later, Corgi's `!important` overrides take precedence.

## Stylesheet Interception

A `MutationObserver` watches for `<link>` and `<style>` elements added to the document. This allows Corgi to:

- **Block** Kagi's built-in custom CSS (`link[href^='/_s/custom_css?']`) when Corgi themes are active, preventing conflicts
- **Reorder** stylesheets to ensure Corgi's styles load in the correct cascade position
- **Detect** Kagi theme changes (class additions on `<html>` like `theme_dark`, `theme_calm_blue`) and react accordingly

## Theme Application Flow

```
1. ISOLATED world reads active theme from chrome.storage.local
2. Bridges theme data to MAIN world via postMessage
3. MAIN world creates <corgi-styles> at document_start
4. Variable overrides are written as :root { --var: value !important }
5. Custom CSS is written to the theme-css style element
6. If theme specifies page-specific overrides, those are applied
   conditionally based on window.location.pathname
7. MutationObserver blocks Kagi's custom CSS link if present
8. On Kagi theme change (updateTheme()), Corgi re-applies
   its overrides to maintain precedence
```

## Page-Specific Styles

Themes can target specific Kagi pages with separate variable overrides and CSS. The theme format supports a `pages` map keyed by route patterns:

```json
{
  "pages": {
    "/search": {
      "variables": { "--search-result-title": "#fff" },
      "css": ".some-search-specific-rule { display: none }"
    },
    "/settings": {
      "variables": { "--app-frame-bg": "#111" }
    }
  }
}
```

The engine evaluates the current `window.location.pathname` against these keys on page load and on SPA-style navigation events.

## Interaction with Kagi's Theme System

Kagi has its own theme system controlled by `getKagiSetting("theme")` with values like `theme_light`, `theme_dark`, and variety sub-themes. Kagi applies themes by adding CSS classes to the `<html>` element.

Corgi does not replace this system. It layers on top. When Corgi is active:
1. Kagi's base theme classes remain on `<html>` (providing default variable values)
2. Corgi's `!important` overrides take precedence for any variables the theme defines
3. Kagi's `updateTheme()` function still runs, but its visual effect is overridden

This means Corgi themes can be partial. A theme that only overrides `--primary` and `--app-bg` will inherit all other styles from whatever Kagi theme the user has selected.
