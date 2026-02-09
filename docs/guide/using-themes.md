# Using Themes

Themes let you change how Kagi looks by overriding CSS variables and injecting custom styles. Corgi applies themes at the stylesheet level, so they integrate with Kagi's existing dark/light mode system.

## Managing Themes

Open `kagi.com/settings/corgi` to see your installed themes. Each theme has a toggle to enable or disable it. Multiple themes can be active at the same time; they layer on top of each other in the order they appear.

## Installing a Theme

Themes are distributed as JSON files. To install one:

1. Go to `kagi.com/settings/corgi`
2. Click "Import Theme (JSON)"
3. Select the `.json` file

The theme appears in your list immediately. Toggle it on to see the changes.

## Removing a Theme

Theme removal is not yet available through the settings UI. To remove a theme, clear the extension's storage from `chrome://extensions` (click "Details" on the Corgi extension, then "Clear data").

## Theme Layering

When multiple themes are active, their CSS variables merge. If two themes set the same variable, the theme that appears later in the list wins. Custom CSS from all active themes is injected in order, so later themes can override earlier ones.

## Page-Specific Styles

Themes can define overrides for specific pages. For example, a theme might use different colors on the search results page versus the settings page. The extension reads the `data-path` attribute on `<html>` to determine the current page and applies matching overrides.

## Creating Your Own

See the [Creating Themes](./creating-themes.md) guide for the full theme JSON format and how to build your own.
