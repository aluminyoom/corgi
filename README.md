# 🐾 Corgi

A plugin system and theming engine for [Kagi Search](https://kagi.com). Think Vencord, but for Kagi.

> [!WARNING]
> **Corgi is in heavy development.** Things will break, APIs will change, and dragons roam freely. If you encounter bugs, please [report them here](https://github.com/aluminyoom/corgi/issues).

Corgi hooks into Kagi's page, patches its runtime, and gives you a plugin API to extend it. The settings UI lives inside Kagi's own settings page at `/settings/corgi`, so it looks and feels native.

**29 built-in plugins** across three categories:

### Corgi Polish (12)
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

### Customization (4)
| Plugin | Description |
|--------|-------------|
| Custom Background | Set a custom background image or color |
| Custom Font | Override the default font family |
| Custom Logo | Replace the Kagi logo on the landing page |
| Custom Placeholder | Change the search bar placeholder text |

### Utilities (13)
| Plugin | Description |
|--------|-------------|
| Feeling Lucky | Adds an "I'm Feeling Lucky" button to the search bar |
| Hide Favicons | Removes favicons from search results |
| Highlight Terms | Highlights search terms in results with a configurable color |
| Infinite Scroll | Automatically loads the next page of results |
| Quick Copy | Hover to reveal a copy button on result URLs |
| Raw URLs | Shows full URLs instead of breadcrumb paths |
| Result Counter | Numbers each search result inline |
| Result Scrambler | Randomizes the order of search results |
| Rounded Cards | Gives search results a cozy card treatment |
| Support Redirect | Redirects Kagi support pages |
| Usage Counter | Tracks how many searches you've made |
| Oneko | A cat that follows your cursor |
| Fatass Horse | A horse that vibes on your screen |

## Installation

```bash
git clone https://github.com/aluminyoom/corgi.git
cd corgi/extension
pnpm install
pnpm build
```

Load the unpacked extension from `extension/.output/chrome-mv3` in `chrome://extensions` (enable Developer Mode).

## Development

```bash
cd extension
pnpm dev          # Dev mode with hot reload
pnpm build        # Production build
pnpm zip          # Package for distribution
```

### Creating a Plugin

Drop a `.ts` file in `extension/src/plugins/builtins/`:

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

Auto-discovery picks it up. No registration needed.

## Docs

VitePress docs live in `docs/`. Run locally with `cd docs && pnpm install && pnpm dev`.

## License

[MIT](LICENSE). Made by [aluminyoom](https://github.com/aluminyoom).

*Corgi is not affiliated with or supported by Kagi Inc. Do not contact Kagi support for Corgi-related issues.*
