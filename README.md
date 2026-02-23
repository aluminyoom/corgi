# 🐾 Corgi

A plugin system and theming engine for [Kagi Search](https://kagi.com).

> [!WARNING]
> **Corgi is in heavy development.** Things will break, APIs will change, and dragons roam freely. If you hit a bug, please [open an issue](https://github.com/aluminyoom/corgi/issues).

Corgi hooks into Kagi's page, patches its runtime, and gives you a plugin API to extend everything. Settings live inside Kagi's own settings page at `/settings/corgi`, so the whole experience feels native.

It ships with **29 built-in plugins** across three categories: 12 visual polish, 4 customization, and 13 utilities. See the [full plugin list](https://aluminyoom.github.io/corgi/guide/using-plugins) in the docs.

## Install

```bash
git clone https://github.com/aluminyoom/corgi.git
cd corgi/extension
pnpm install
pnpm build
```

Then load `extension/.output/chrome-mv3` as an unpacked extension in `chrome://extensions` with Developer Mode enabled.

## Development

```bash
cd extension
pnpm dev     # hot reload
pnpm build   # production
pnpm zip     # package for distribution
```

To create a plugin, drop a `.ts` file in `extension/src/plugins/builtins/` and auto-discovery handles the rest:

```ts
import { definePlugin } from '@/plugins/api';

export const myPlugin = definePlugin({
  name: 'my-plugin',
  displayName: 'My Plugin',
  version: '0.1.0',
  authors: ['your-name'],
  description: 'Does something cool',
  onStart(api) {
    // Your code here
  },
});
```

See [Creating Plugins](https://aluminyoom.github.io/corgi/guide/creating-plugins) for the full API reference.

## Docs

VitePress docs live in `docs/` and can be run locally:

```bash
cd docs && pnpm install && pnpm dev
```

## License

[MIT](LICENSE). Made by [aluminyoom](https://github.com/aluminyoom).

*Not affiliated with Kagi Inc. Do not contact Kagi support for Corgi issues.*
