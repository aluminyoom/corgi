import type { Theme, ThemeState } from './types';

export interface PluginMeta {
  name: string;
  displayName: string;
  version: string;
  authors: string[];
  description: string;
  builtin: boolean;
}

export interface PluginGroupMeta {
  name: string;
  displayName: string;
  version: string;
  authors: string[];
  description: string;
  plugins: string[];
}

export interface PluginStates {
  disabled: string[];
}

const DEFAULT_STATE: ThemeState = {
  themes: [],
  activeThemeIds: [],
  enabled: true,
};

export const themeState = storage.defineItem<ThemeState>('local:themeState', {
  fallback: DEFAULT_STATE,
});

export const activeThemePrefs = storage.defineItem<string[]>('sync:activeThemeIds', {
  fallback: [],
});

export const extensionEnabled = storage.defineItem<boolean>('sync:enabled', {
  fallback: true,
});

export const pluginStates = storage.defineItem<PluginStates>('local:pluginStates', {
  fallback: { disabled: [
    'corgi-polish/refined-typography',
    'corgi-polish/smoother-interactions',
    'corgi-polish/cleaner-cards',
    'corgi-polish/visual-hierarchy',
    'corgi-polish/qol',
    'corgi-polish/sticky-sidebar',
    'corgi-polish/sidebar-categories',
    'corgi-polish/serp-card-wrapping',
    'corgi-polish/pill-filters',
    'corgi-polish/edge-to-edge-nav',
    'corgi-polish/centered-header',
  ] },
});

export const BUILTIN_PLUGINS: PluginMeta[] = [
  {
    name: 'search-counter',
    displayName: 'Search Counter',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Shows the number of results returned for each search.',
    builtin: true,
  },
  {
    name: 'usage-counter',
    displayName: 'Usage Counter',
    version: '0.2.0',
    authors: ['aluminyoom'],
    description: 'Displays account usage stats (searches, AI, assistant) below the filter bar.',
    builtin: true,
  },
  {
    name: 'corgi-polish/refined-typography',
    displayName: 'Refined Typography',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Tighter line heights, improved font weights on headings, better text spacing',
    builtin: true,
  },
  {
    name: 'corgi-polish/smoother-interactions',
    displayName: 'Smoother Interactions',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Subtle transitions on hover states, focus rings, and interactive elements',
    builtin: true,
  },
  {
    name: 'corgi-polish/cleaner-cards',
    displayName: 'Cleaner Cards',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Softer shadows, consistent border-radius, and improved spacing on cards and boxes',
    builtin: true,
  },
  {
    name: 'corgi-polish/visual-hierarchy',
    displayName: 'Visual Hierarchy',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Muted secondary text, stronger title contrast, clearer result group separation',
    builtin: true,
  },
  {
    name: 'corgi-polish/qol',
    displayName: 'Quality of Life',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Small quality-of-life fixes: centered sidebar icons, aligned inline elements',
    builtin: true,
  },
  {
    name: 'corgi-polish/sticky-sidebar',
    displayName: 'Sticky Sidebar',
    version: '0.2.0',
    authors: ['aluminyoom'],
    description: 'Makes the settings sidebar sticky while the main content scrolls independently',
    builtin: true,
  },
  {
    name: 'corgi-polish/sidebar-categories',
    displayName: 'Sidebar Categories',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Displays Search and Billing as category headings with sub-items promoted to top-level styling',
    builtin: true,
  },
  {
    name: 'support-redirect',
    displayName: 'Support Redirect',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Warns users not to report Corgi issues to Kagi when visiting support links.',
    builtin: true,
  },
  {
    name: 'corgi-polish/serp-card-wrapping',
    displayName: 'SERP Card Wrapping',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Wraps the right sidebar content in a card for better visual distinction from search results',
    builtin: true,
  },
  {
    name: 'corgi-polish/pill-filters',
    displayName: 'Pill Filters',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Makes filter bar buttons pill-shaped to match the search bar curvature',
    builtin: true,
  },
  {
    name: 'corgi-polish/edge-to-edge-nav',
    displayName: 'Edge-to-Edge Nav',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Extends the SERP navigation border to stretch edge-to-edge across the full browser width',
    builtin: true,
  },
  {
    name: 'corgi-polish/centered-header',
    displayName: 'Centered Header',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'Vertically centers the apps and control center buttons with the search bar in the SERP header',
    builtin: true,
  },
];

export const BUILTIN_GROUPS: PluginGroupMeta[] = [
  {
    name: 'corgi-polish',
    displayName: 'Corgi Polish',
    version: '0.1.0',
    authors: ['aluminyoom'],
    description: 'A collection of subtle visual refinements that make Kagi feel more polished without changing its identity. Disabled by default.',
    plugins: [
      'corgi-polish/refined-typography',
      'corgi-polish/smoother-interactions',
      'corgi-polish/cleaner-cards',
      'corgi-polish/visual-hierarchy',
      'corgi-polish/qol',
      'corgi-polish/sticky-sidebar',
      'corgi-polish/sidebar-categories',
      'corgi-polish/serp-card-wrapping',
      'corgi-polish/pill-filters',
      'corgi-polish/edge-to-edge-nav',
      'corgi-polish/centered-header',
    ],
  },
];
