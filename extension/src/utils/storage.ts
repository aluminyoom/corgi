import type { Theme, ThemeState } from './types';
import { getBuiltinMeta, getBuiltinGroups, getDefaultDisabled } from '@/plugins/builtins/discover';

export type { PluginMeta, PluginGroupMeta } from '@/plugins/builtins/discover';

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

export const pluginStates = storage.defineItem<PluginStates>('local:pluginStates', {
  fallback: { disabled: getDefaultDisabled() },
});

export const pluginSettings = storage.defineItem<PluginSettingsStore>('local:pluginSettings', {
  fallback: {},
});

export const BUILTIN_PLUGINS = getBuiltinMeta();
export const BUILTIN_GROUPS = getBuiltinGroups();
