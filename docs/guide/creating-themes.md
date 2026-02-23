# Creating Themes

::: warning Unstable
Theming support works but is still rough around the edges. If you run into issues, you can achieve similar results through the plugin API's `injectCSS` method or through Kagi's own custom CSS setting while the theming engine is being stabilized.
:::

A Corgi theme is a JSON file that declares CSS variable overrides and optional custom CSS, and it requires no build tools to create.

## Minimal Theme

```json
{
  "name": "my-theme",
  "displayName": "My Theme",
  "version": "1.0.0",
  "authors": ["your-name"],
  "description": "A custom look for Kagi",
  "tags": ["dark"],
  "variables": {
    "--app-bg": "#1a1a2e",
    "--app-text": "#e0e0e0",
    "--primary": "#6366f1"
  },
  "css": ""
}
```

Save this as a `.json` file and import it through the Corgi settings page.

## Variables

The `variables` field maps CSS variable names to values. These are applied to `:root` with `!important`, so they override Kagi's defaults regardless of specificity.

See the [CSS Variables](/api/css-variables) reference for the full list of variables Kagi uses.

## Custom CSS

For changes that go beyond variables, use the `css` field:

```json
{
  "css": ".search-result { border-radius: 12px; padding: 16px; }"
}
```

Custom CSS is injected as a `<style>` element inside a `<corgi-styles>` container that sits before Kagi's own stylesheets. Your styles share the same specificity as Kagi's, so you may need specific selectors to win.

## Page Overrides

The `pages` field applies different styles to specific pages:

```json
{
  "pages": {
    "search": {
      "variables": { "--app-bg": "#0d0d1a" },
      "css": ".search-result { margin-bottom: 24px; }"
    }
  }
}
```

Page keys correspond to the `data-path` attribute value on `<html>`. Common values are `search`, `settings`, and `landing`.

## Theme Metadata

The optional `meta` field provides hints to the engine:

```json
{
  "meta": {
    "kagiThemes": ["dark"],
    "minCorgiVersion": "0.1.0"
  }
}
```

- `kagiThemes`: Which Kagi base themes this theme targets, letting users filter by compatibility.
- `minCorgiVersion`: The minimum Corgi version needed for features this theme uses.

## Testing

1. Save your theme JSON
2. Open `kagi.com/settings/corgi`
3. Import the file and toggle it on
4. Navigate to a search page to see the result

Changes to `variables` apply instantly. If you update the file, re-import it. Themes with the same `name` are replaced on import rather than duplicated.

## Distribution

Share your theme by distributing the JSON file. There is no central registry yet, so consider including a screenshot and a note about which Kagi base theme (light, dark, or both) your theme targets.
