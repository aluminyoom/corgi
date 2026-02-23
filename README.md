# 🐾 Corgi

**A theming engine and plugin API for [Kagi Search](https://kagi.com)** — think Vencord, but for Kagi.

> [!WARNING]
> **Corgi is in heavy development.** Things will break, APIs will change, and dragons roam freely. If you encounter bugs, please [report them here](https://github.com/aluminyoom/corgi/issues).

Corgi is an unofficial Chrome extension that adds a plugin system, theming engine, and settings integration to Kagi. It injects a settings tab directly into Kagi's settings page where you can manage plugins and customize your search experience.

## Features

- **Plugin system** with auto-discovery — drop a file in `builtins/` and it just works
- **Theming engine** with CSS variable overrides
- **Settings integration** — Corgi lives inside Kagi's own settings page
- **29 built-in plugins** across multiple categories

### Built-in Plugins

#### 🪄 Corgi Polish (12 plugins)
Visual refinements that make Kagi feel more polished:

| Plugin | Description |
|--------|-------------|
| Centered Header | Centers the search header on results pages |
| Cleaner Cards | Removes visual noise from result cards |
| Edge-to-Edge Nav | Extends navigation bar to full width |
| Modern Landing Tabs | Modernizes the landing page tab styling |
| Pill Filters | Turns filter buttons into pill-shaped elements |
| QoL Tweaks | Small quality-of-life CSS improvements |
| Refined Typography | Better font sizing and spacing |
| SERP Card Wrapping | Wraps search results in card containers |
| Sidebar Categories | Styles sidebar category links |
| Smoother Interactions | Adds transitions and hover effects |
| Sticky Sidebar | Keeps the sidebar visible while scrolling |
| Visual Hierarchy | Improves contrast and spacing between elements |

#### 🎨 Customization (4 plugins)
| Plugin | Description |
|--------|-------------|
| Custom Background | Set a custom background image or color |
| Custom Font | Override the default font family |
| Custom Logo | Replace the Kagi logo on the landing page |
| Custom Placeholder | Change the search bar placeholder text |

#### 🔧 Utilities (13 plugins)
| Plugin | Description |
|--------|-------------|
| Feeling Lucky | Adds an "I'm Feeling Lucky" button to the search bar |
| Hide Favicons | Removes favicons from search results |
| Highlight Terms | Highlights search terms in results with a configurable color |
| Infinite Scroll | Automatically loads the next page of results |
| Quick Copy | Hover to reveal a copy button on result URLs |
| Raw URLs | Shows full URLs instead of breadcrumb paths |
| Result Counter | Numbers each search result inline |
| Result Scrambler | Randomizes the order of search results (chaos mode) |
| Rounded Cards | Gives search results a cozy card treatment |
| Support Redirect | Redirects Kagi support pages |
| Usage Counter | Tracks how many searches you've made |
| Oneko | A cat that follows your cursor |
| Fatass Horse | A horse that vibes on your screen |

## Installation

### From Source

```bash
# Clone the repo
git clone https://github.com/aluminyoom/corgi.git
cd corgi/extension

# Install dependencies
pnpm install

# Build
pnpm build
```

Then load the unpacked extension from `extension/.output/chrome-mv3` in `chrome://extensions` (enable Developer Mode).

### Chrome Web Store

Coming soon.

## Development

```bash
cd extension
pnpm dev          # Dev mode with hot reload
pnpm build        # Production build
pnpm zip          # Package for distribution
```

### Creating a Plugin

Drop a `.ts` file in `extension/src/plugins/builtins/` with:

```ts
import { definePlugin } from '@/plugins/api';

export const myPlugin = definePlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  description: 'Does something cool',
  version: '0.1.0',
  enabled: false,
  settings: [],
  init: async (api) => {
    // Your code here
    return () => {
      // Cleanup on disable
    };
  },
});
```

That's it. The auto-discovery system picks it up automatically.

## Documentation

Full documentation is available in the `docs/` directory (VitePress-powered). Run locally:

```bash
cd docs
pnpm install
pnpm dev
```

## License

[MIT](LICENSE) — made with care by [aluminyoom](https://github.com/aluminyoom).

---

*Corgi is not affiliated with or supported by Kagi Inc. Please do not contact Kagi support for Corgi-related issues.*
