# Using Plugins

Plugins extend Kagi beyond cosmetics. Where themes only change how things look, plugins change how things work by hooking into JavaScript, patching the DOM, intercepting network requests, and injecting styles.

## Managing Plugins

Open `kagi.com/settings/corgi` to see all available plugins, each with a toggle to enable or disable it. Changes take effect on the next page load.

## Built-in Plugins

Corgi ships with **29 plugins** across three categories.

### Corgi Polish (12 plugins)

The Corgi Polish group contains visual refinements that sharpen Kagi without changing its identity. The group is disabled by default, but you can toggle it on to enable all twelve at once or expand it to pick individually.

| Plugin | Effect |
|--------|--------|
| Centered Header | Centers the search header on results pages |
| Cleaner Cards | Strips visual noise from result cards |
| Edge-to-Edge Nav | Extends navigation to full width |
| Modern Landing Tabs | Modernizes tab styling on the landing page |
| Pill Filters | Turns filter buttons into pills |
| QoL Tweaks | Small CSS quality-of-life fixes |
| Refined Typography | Better font sizing, weight, and spacing |
| SERP Card Wrapping | Wraps search results in card containers |
| Sidebar Categories | Styles sidebar category links |
| Smoother Interactions | Adds transitions and hover effects |
| Sticky Sidebar | Keeps the sidebar visible while scrolling |
| Visual Hierarchy | Improves contrast and section separation |

### Customization (4 plugins)

| Plugin | Effect |
|--------|--------|
| Custom Background | Set a custom background image or color |
| Custom Font | Override the default font family |
| Custom Logo | Replace the Kagi logo on the landing page |
| Custom Placeholder | Change the search bar placeholder text |

### Utilities (13 plugins)

| Plugin | Effect |
|--------|--------|
| Feeling Lucky | Adds an "I'm Feeling Lucky" button |
| Hide Favicons | Removes favicons from search results |
| Highlight Terms | Highlights search terms in results |
| Infinite Scroll | Auto-loads the next page of results |
| Quick Copy | Hover to reveal a copy button on result URLs |
| Raw URLs | Shows full URLs instead of breadcrumb paths |
| Result Counter | Numbers each search result inline |
| Result Scrambler | Randomizes result order |
| Rounded Cards | Gives results a cozy card treatment |
| Support Redirect | Redirects Kagi support pages |
| Usage Counter | Shows a progress bar of remaining searches |
| Oneko | A cat that follows your cursor |
| Fatass Horse | A horse that vibes on your screen |

## Plugin Groups

Some plugins are bundled under a group, which provides a single toggle that enables or disables all members at once. You can expand the group to override individual members. Currently, **Corgi Polish** is the only group.

## How Plugins Load

When a Kagi page loads, the content script injects `corgi-main.js` into the page's main world. That script registers all built-in plugins and then asks the content script (through a `postMessage` bridge) which plugins the user has disabled. Any plugin not on the disabled list starts immediately.

Because plugins initialize during page load, toggling a plugin in settings does not affect the current page, so you need to reload to see the change.
