import type { Theme, ThemeState } from './types';

export interface PluginStates {
  disabled: string[];
}

export type PluginSettingsStore = Record<string, Record<string, unknown>>;

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

// NOTE: fallback uses empty disabled list to avoid importing discover (which
// eagerly pulls in all plugin modules via import.meta.glob, including bridge
// code that uses `window` — unavailable in the background service worker).
// The actual default-disabled list is applied on first storage access in
// contexts that have `window` (content script / settings page).
export const pluginStates = storage.defineItem<PluginStates>('local:pluginStates', {
  fallback: { disabled: [] },
});

export const pluginSettings = storage.defineItem<PluginSettingsStore>('local:pluginSettings', {
  fallback: {},
});
