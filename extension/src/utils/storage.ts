import type { Theme, ThemeState } from './types';

export interface PluginMeta {
  name: string;
  version: string;
  author: string;
  description: string;
  builtin: boolean;
}

export interface PluginGroupMeta {
  name: string;
  version: string;
  author: string;
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
  ] },
});

export const BUILTIN_PLUGINS: PluginMeta[] = [
  {
    name: 'search-counter',
    version: '0.1.0',
    author: 'corgi',
    description: 'Shows the number of results returned for each search.',
    builtin: true,
  },
  {
    name: 'usage-counter',
    version: '0.2.0',
    author: 'corgi',
    description: 'Displays account usage stats (searches, AI, assistant) below the filter bar.',
    builtin: true,
  },
  {
    name: 'corgi-polish/refined-typography',
    version: '0.1.0',
    author: 'corgi',
    description: 'Tighter line heights, improved font weights on headings, better text spacing',
    builtin: true,
  },
  {
    name: 'corgi-polish/smoother-interactions',
    version: '0.1.0',
    author: 'corgi',
    description: 'Subtle transitions on hover states, focus rings, and interactive elements',
    builtin: true,
  },
  {
    name: 'corgi-polish/cleaner-cards',
    version: '0.1.0',
    author: 'corgi',
    description: 'Softer shadows, consistent border-radius, and improved spacing on cards and boxes',
    builtin: true,
  },
  {
    name: 'corgi-polish/visual-hierarchy',
    version: '0.1.0',
    author: 'corgi',
    description: 'Muted secondary text, stronger title contrast, clearer result group separation',
    builtin: true,
  },
];

export const BUILTIN_GROUPS: PluginGroupMeta[] = [
  {
    name: 'Corgi Polish',
    version: '0.1.0',
    author: 'corgi',
    description: 'A collection of subtle visual refinements that make Kagi feel more polished without changing its identity. Disabled by default.',
    plugins: [
      'corgi-polish/refined-typography',
      'corgi-polish/smoother-interactions',
      'corgi-polish/cleaner-cards',
      'corgi-polish/visual-hierarchy',
    ],
  },
];
