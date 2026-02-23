# Theming Engine

::: warning Unstable
Theming support works but is still rough around the edges. If you run into issues, you can achieve similar results through the plugin API's `injectCSS` method or through Kagi's own custom CSS setting while the theming engine is being stabilized.
:::

The theming engine controls how Corgi applies visual changes to Kagi pages. It operates at three levels: CSS variable overrides, arbitrary CSS injection, and stylesheet interception.

## CSS Variable Overrides

Kagi defines hundreds of CSS custom properties on `:root` for colors, fonts, spacing, and component styles, and Corgi themes can override any of them without writing selector-based CSS.

Variable overrides are applied as a `<style>` element injected into `<corgi-styles>` before Kagi's own stylesheets load, using `!important` to ensure they take precedence regardless of specificity:

```css
:root {
  --app-bg: #0a0a0a !important;
  --app-text: #e0e0e0 !important;
  --primary: #ff6b35 !important;
  /* ... */
}
```

## Custom CSS

Themes can also include arbitrary CSS for changes that go beyond variable overrides, like hiding elements, repositioning layouts, or adding visual effects. This CSS is injected into a separate `<style>` element within `<corgi-styles>`.

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

A `MutationObserver` watches for `<link>` and `<style>` elements added to the document, allowing Corgi to block Kagi's built-in custom CSS (`link[href^='/_s/custom_css?']`) when Corgi themes are active to prevent conflicts, reorder stylesheets to maintain the correct cascade position, and detect Kagi theme changes (class additions on `<html>` like `theme_dark` or `theme_calm_blue`) so it can react accordingly.

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

Kagi has its own theme system controlled by `getKagiSetting("theme")` with values like `theme_light`, `theme_dark`, and various sub-themes, and it applies them by adding CSS classes to the `<html>` element.

Corgi does not replace this system but layers on top of it. When Corgi is active, Kagi's base theme classes remain on `<html>` to provide default variable values, Corgi's `!important` overrides take precedence for any variables the theme defines, and Kagi's `updateTheme()` function still runs even though its visual effect is overridden.

This means Corgi themes can be partial. A theme that only overrides `--primary` and `--app-bg` will inherit all other styles from whatever Kagi theme the user has selected.
