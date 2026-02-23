# Getting Started

> [!NOTE]
> **This page may be outdated.** Corgi is actively evolving and some details here may not reflect the current state. See the [README](https://github.com/aluminyoom/corgi) for the latest setup instructions.

## Install from Source

Corgi is not yet published to browser extension stores. For now, install it from source.

### Prerequisites

- **Node.js** 18 or later
- **pnpm** 8 or later
- A Kagi account (you need to be signed in for the extension to work)

### Clone and Build

```bash
git clone https://github.com/aluminyoom/corgi.git
cd corgi
pnpm install
pnpm --filter extension build
```

The build output is at `extension/.output/chrome-mv3/`.

### Load in Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `extension/.output/chrome-mv3/` directory
5. Navigate to [kagi.com](https://kagi.com) and sign in

### Load in Firefox

```bash
pnpm --filter extension build --browser firefox
```

Then load `extension/.output/firefox-mv3/` as a temporary add-on from `about:debugging`.

## Verify Installation

Once installed, navigate to `kagi.com/settings/corgi`. You should see a "Corgi" link in the settings sidebar. If the page loads with the Corgi header, enable toggle, and a list of built-in plugins, everything is working.

Corgi ships with two built-in plugins enabled by default:

- **search-counter** shows a result count badge on search pages
- **usage-counter** adds a search usage progress bar below filters

It also includes a **Corgi Polish** plugin group (disabled by default) with four subtle visual refinements:

- **refined-typography** improves font weights, line heights, and letter spacing
- **smoother-interactions** adds hover transitions, focus rings, and scale transforms
- **cleaner-cards** applies soft backgrounds, border-radius, and padding to result cards
- **visual-hierarchy** mutes secondary text and adds clearer section separation

You can toggle all four at once with the group toggle, or expand the group and override individual plugins.

You can also open the Kagi Control Center (press `c` or click the gear icon) and find a Corgi shortcut at the bottom.

## Development Mode

For active development with hot module replacement:

```bash
pnpm --filter extension dev
```

WXT will open a browser window with the extension loaded. Changes to source files trigger automatic rebuilds.
