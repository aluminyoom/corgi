# Getting Started

## Install from Source

Corgi is not yet on any browser extension store, so you need to build it yourself.

### Prerequisites

- **Node.js** 18 or later
- **pnpm** 8 or later
- A Kagi account (you must be signed in for the extension to work)

### Clone and Build

```bash
git clone https://github.com/aluminyoom/corgi.git
cd corgi/extension
pnpm install
pnpm build
```

The build output lands in `extension/.output/chrome-mv3/`.

### Load in Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select `extension/.output/chrome-mv3/`
4. Navigate to [kagi.com](https://kagi.com) and sign in

### Load in Firefox

```bash
pnpm build --browser firefox
```

Then load `extension/.output/firefox-mv3/` as a temporary add-on from `about:debugging`.

## Verify Installation

Navigate to `kagi.com/settings/corgi`. If you see a "Corgi" link in the settings sidebar and the page loads with the Corgi header, a master toggle, and a list of plugins, everything is working.

Corgi ships with [29 built-in plugins](/guide/using-plugins) across three categories: 12 visual polish, 4 customization, and 13 utilities. Most are disabled by default so nothing changes until you opt in.

## Development Mode

For active development with hot module replacement:

```bash
pnpm dev
```

WXT opens a browser window with the extension loaded, and changes to source files trigger automatic rebuilds.
