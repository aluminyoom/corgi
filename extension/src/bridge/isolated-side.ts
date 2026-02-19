import {
  BRIDGE_SOURCE,
  type BridgeAction,
  type BridgeResponse,
  type BridgePush,
  isBridgeRequest,
} from './protocol';
import { themeState, extensionEnabled, pluginStates, pluginSettings } from '@/utils/storage';
import { getDefaultDisabled } from '@/plugins/builtins/discover';
import { getThemeId } from '@/utils/types';

type ActionHandler = (payload: unknown) => Promise<unknown>;

const handlers = new Map<BridgeAction, ActionHandler>();

function respond(id: string, ok: boolean, data?: unknown, error?: string): void {
  const message: BridgeResponse = {
    source: BRIDGE_SOURCE,
    direction: 'isolated-to-main',
    id,
    ok,
    data,
    error,
  };
  window.postMessage(message, '*');
}

export function pushToMain(action: BridgeAction, payload?: unknown): void {
  const message: BridgePush = {
    source: BRIDGE_SOURCE,
    direction: 'isolated-to-main',
    id: null,
    action,
    payload,
  };
  window.postMessage(message, '*');
}

handlers.set('runtime:getURL', async (payload) => {
  const { path } = payload as { path: string };
  return browser.runtime.getURL(path);
});

handlers.set('storage:get', async (payload) => {
  const { key } = payload as { key: string };
  if (key === 'themeState') return themeState.getValue();
  if (key === 'enabled') return extensionEnabled.getValue();
  return null;
});

handlers.set('storage:set', async (payload) => {
  const { key, value } = payload as { key: string; value: unknown };
  if (key === 'enabled') await extensionEnabled.setValue(value as boolean);
  return null;
});

handlers.set('theme:apply', async () => {
  const state = await themeState.getValue();
  const enabled = await extensionEnabled.getValue();
  if (!enabled) return { enabled: false, themes: [] };
  const active = state.themes.filter((t) => state.activeThemeIds.includes(getThemeId(t)));
  return { enabled: true, themes: active };
});

handlers.set('theme:clear', async () => {
  return null;
});

let pluginStatesInitialized = false;

handlers.set('plugin:state', async () => {
  const states = await pluginStates.getValue();

  if (!pluginStatesInitialized) {
    pluginStatesInitialized = true;
    const meta = await pluginStates.getMeta();

    if (!meta?.initialized) {
      // First-time install: apply all default-disabled plugins
      const defaults = getDefaultDisabled();
      if (defaults.length > 0) {
        const initialized = { disabled: defaults };
        await pluginStates.setValue(initialized);
        await pluginStates.setMeta({ initialized: true, knownPlugins: defaults });
        return initialized;
      }
      await pluginStates.setMeta({ initialized: true, knownPlugins: [] });
    } else {
      // Existing install: check for newly added defaultEnabled:false plugins
      const allDefaults = getDefaultDisabled();
      const knownPlugins = (meta.knownPlugins as string[] | undefined) ?? [];
      const knownSet = new Set(knownPlugins);
      const newlyDisabled = allDefaults.filter((name) => !knownSet.has(name));

      if (newlyDisabled.length > 0) {
        const disabled = new Set(states.disabled);
        for (const name of newlyDisabled) disabled.add(name);
        const updated = { disabled: [...disabled] };
        await pluginStates.setValue(updated);
        await pluginStates.setMeta({ ...meta, knownPlugins: allDefaults });
        return updated;
      }

      if (allDefaults.length !== knownPlugins.length) {
        await pluginStates.setMeta({ ...meta, knownPlugins: allDefaults });
      }
    }
  }

  return states;
});

handlers.set('plugin:settings:get', async (payload) => {
  const { pluginName } = payload as { pluginName: string };
  const all = await pluginSettings.getValue();
  return all[pluginName] ?? {};
});

handlers.set('plugin:settings:set', async (payload) => {
  const { pluginName, values } = payload as { pluginName: string; values: Record<string, unknown> };
  const all = await pluginSettings.getValue();
  all[pluginName] = values;
  await pluginSettings.setValue(all);
  return null;
});

export function startBridge(): void {
  window.addEventListener('message', async (event) => {
    if (event.source !== window) return;
    if (!isBridgeRequest(event)) return;

    const { id, action, payload } = event.data;
    const handler = handlers.get(action);

    if (!handler) {
      respond(id, false, undefined, `unknown action: ${action}`);
      return;
    }

    try {
      const result = await handler(payload);
      respond(id, true, result);
    } catch (err) {
      respond(id, false, undefined, err instanceof Error ? err.message : String(err));
    }
  });

  themeState.watch(() => pushToMain('theme:apply'));
  extensionEnabled.watch(() => pushToMain('theme:apply'));
}

export function pushReady(): void {
  pushToMain('ready');
}
