# CSS Variables

Kagi uses CSS custom properties extensively. Overriding these variables is the primary way Corgi themes change the page appearance.

All variables are set on `:root` and cascade through the entire page. Corgi applies overrides with `!important` to ensure they take priority over Kagi's defaults.

## Core

| Variable | Default (dark) | Description |
|----------|---------------|-------------|
| `--app-bg` | `#1a1a2e` | Page background |
| `--app-text` | `#e0e0e0` | Default text color |
| `--app-frame-bg` | `#121225` | Frame/card backgrounds |
| `--color-scheme` | `dark` | Browser color scheme hint |

## Typography

| Variable | Default | Description |
|----------|---------|-------------|
| `--font-main` | System stack | Primary font family |
| `--font-lufga` | Lufga | Heading font |
| `--font-mono` | Monospace stack | Code and monospaced text |

## Colors

| Variable | Description |
|----------|-------------|
| `--primary` | Primary accent color |
| `--primary-hover` | Primary color on hover |
| `--primary-25` through `--primary-900` | Primary color scale |
| `--secondary` | Secondary accent |
| `--link` | Link text color |

## Search

| Variable | Description |
|----------|-------------|
| `--color-search-input` | Search input text color |
| `--color-search-input-border` | Search input border |
| `--search-result-title` | Search result title color |

## UI Elements

| Variable | Description |
|----------|-------------|
| `--input-bg` | Input field background |
| `--modal-bg` | Modal overlay background |
| `--hover-bg` | Hover state background |
| `--inline-widget-bg` | Widget card background |
| `--box-shadow` | Default box shadow |
| `--border-color` | Border color (not always defined by Kagi, used by Corgi) |

## Buttons

| Variable | Description |
|----------|-------------|
| `--btn-primary-bg` | Primary button background |
| `--btn-primary-color` | Primary button text |

## Reading Variables

To read the current computed value of a variable from a plugin:

```typescript
const bg = api.getComputedVariable('--app-bg');
```

This returns the resolved value after all theme overrides are applied.
