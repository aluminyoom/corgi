import type { Theme, ThemeState } from './types';

export interface PluginMeta {
  name: string;
  version: string;
  author: string;
  description: string;
  builtin: boolean;
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
  fallback: { disabled: [] },
});

export const BUILTIN_PLUGINS: PluginMeta[] = [
  {
    name: 'search-counter',
    version: '0.1.0',
    author: 'kagistry',
    description: 'Shows the number of results returned for each search.',
    builtin: true,
  },
  {
    name: 'usage-counter',
    version: '0.2.0',
    author: 'kagistry',
    description: 'Displays account usage stats (searches, AI, assistant) below the filter bar.',
    builtin: true,
  },
];
