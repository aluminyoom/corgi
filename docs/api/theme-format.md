# Theme Format

Complete reference for the Corgi theme JSON structure.

## Schema

```typescript
interface Theme {
  name: string;
  version: string;
  author: string;
  description: string;
  tags: string[];
  variables: Record<string, string>;
  css: string;
  pages?: Record<string, {
    variables?: Record<string, string>;
    css?: string;
  }>;
  meta?: {
    kagiThemes?: string[];
    minCorgiVersion?: string;
  };
}
```

## Fields

### Required

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Display name of the theme |
| `version` | `string` | Semver version string |
| `author` | `string` | Author identifier (used in theme ID) |
| `description` | `string` | Short description of the theme |
| `tags` | `string[]` | Searchable tags (e.g., `["dark", "minimal"]`) |
| `variables` | `Record<string, string>` | CSS variable overrides applied to `:root` |
| `css` | `string` | Raw CSS injected into the page |

### Optional

| Field | Type | Description |
|-------|------|-------------|
| `pages` | `Record<string, PageOverride>` | Per-page variable and CSS overrides |
| `meta` | `ThemeMeta` | Engine hints and compatibility info |

### PageOverride

| Field | Type | Description |
|-------|------|-------------|
| `variables` | `Record<string, string>` | CSS variables for this page only |
| `css` | `string` | CSS injected only on this page |

Page keys match the `data-path` attribute on `<html>`.

### ThemeMeta

| Field | Type | Description |
|-------|------|-------------|
| `kagiThemes` | `string[]` | Kagi base themes this is designed for (`"dark"`, `"light"`) |
| `minCorgiVersion` | `string` | Minimum Corgi version required |

## Theme ID

Themes are identified by `author/name`. Importing a theme with the same author and name as an existing theme replaces the existing one.

## Example

```json
{
  "name": "Midnight",
  "version": "1.0.0",
  "author": "corgi",
  "description": "A deep dark theme with purple accents",
  "tags": ["dark", "purple", "minimal"],
  "variables": {
    "--app-bg": "#0d0d1a",
    "--app-text": "#e0e0e0",
    "--primary": "#8b5cf6",
    "--link": "#a78bfa"
  },
  "css": "",
  "pages": {
    "search": {
      "variables": {
        "--search-result-title": "#c4b5fd"
      }
    }
  },
  "meta": {
    "kagiThemes": ["dark"]
  }
}
```
