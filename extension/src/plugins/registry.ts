import type { PluginDefinition, PluginInstance, PluginAPI, PluginState } from './types';
import { trapGlobal } from '@/hooks/traps';
import { wrapFunction } from '@/hooks/wrap';
import { addEventInterceptor, onProviderEvent } from '@/hooks/events';
import { addFetchRequestInterceptor, addFetchResponseInterceptor } from '@/hooks/fetch';
import { observeElement } from '@/hooks/observer';
import { setVariable, removeVariable, getComputedVariable } from '@/styles/variables';
import { bridgeRequest } from '@/bridge/main-side';
import { getCurrentPagePath } from '@/utils/engine';
import { onUrlChange } from '@/hooks/navigation';

const plugins = new Map<string, PluginInstance>();

function createPluginAPI(instance: PluginInstance): PluginAPI {
  function tracked<T extends (...args: never[]) => () => void>(fn: T): T {
    return ((...args: Parameters<T>) => {
      const cleanup = fn(...args);
      instance.cleanups.push(cleanup);
      return cleanup;
    }) as T;
  }

  const pluginName = instance.definition.name;
  const PROCESSED_PREFIX = `data-corgi-${pluginName}`;

  return {
    trapGlobal: tracked(trapGlobal),
    wrapFunction: tracked(
      (target: Record<string, unknown>, method: string, options) =>
        wrapFunction(target, method, options),
    ),
    onProviderEvent: tracked(onProviderEvent),
    addEventInterceptor: tracked(addEventInterceptor),
    addFetchRequestInterceptor: tracked(addFetchRequestInterceptor),
    addFetchResponseInterceptor: tracked(addFetchResponseInterceptor),
    observeElement: tracked(observeElement),
    setVariable,
    removeVariable,
    getComputedVariable,
    injectCSS(css: string): HTMLStyleElement {
      const style = document.createElement('style');
      style.setAttribute('data-corgi-plugin', pluginName);
      style.textContent = css;
      (document.head ?? document.documentElement).appendChild(style);
      instance.cleanups.push(() => style.remove());
      return style;
    },
    async getSettings<T extends Record<string, unknown> = Record<string, unknown>>(): Promise<T> {
      const result = await bridgeRequest<T>('plugin:settings:get', {
        pluginName,
      });
      return result ?? ({} as T);
    },
    async setSettings(values: Record<string, unknown>): Promise<void> {
      await bridgeRequest('plugin:settings:set', {
        pluginName,
        values,
      });
    },

    getPagePath(): string | null {
      return getCurrentPagePath();
    },
    isPage(path: string): boolean {
      return getCurrentPagePath() === path;
    },

    injectStyle(id: string, css: string): HTMLStyleElement {
      let el = document.getElementById(id) as HTMLStyleElement | null;
      if (!el) {
        el = document.createElement('style');
        el.id = id;
        el.setAttribute('data-corgi-plugin', pluginName);
        (document.head ?? document.documentElement).appendChild(el);
        instance.cleanups.push(() => document.getElementById(id)?.remove());
      }
      el.textContent = css;
      return el;
    },
    updateStyle(id: string, css: string): void {
      const el = document.getElementById(id);
      if (el) el.textContent = css;
    },
    removeStyle(id: string): void {
      document.getElementById(id)?.remove();
    },

    markProcessed(el: Element, key: string): void {
      el.setAttribute(`${PROCESSED_PREFIX}-${key}`, '');
    },
    isProcessed(el: Element, key: string): boolean {
      return el.hasAttribute(`${PROCESSED_PREFIX}-${key}`);
    },
    clearProcessed(key: string): void {
      const attr = `${PROCESSED_PREFIX}-${key}`;
      for (const el of document.querySelectorAll(`[${attr}]`)) {
        el.removeAttribute(attr);
      }
    },

    async loadSettings<T extends Record<string, unknown>>(defaults: T): Promise<T> {
      const stored = await bridgeRequest<Partial<T>>('plugin:settings:get', {
        pluginName,
      });
      return { ...defaults, ...(stored ?? {}) };
    },

    async getAssetURL(path: string): Promise<string> {
      return bridgeRequest<string>('runtime:getURL', { path });
    },

    async proxyFetch(url: string): Promise<string> {
      return bridgeRequest<string>('fetch:proxy', { url });
    },
    async fetchJSON<T>(url: string): Promise<T | null> {
      try {
        const text = await bridgeRequest<string>('fetch:proxy', { url });
        return JSON.parse(text) as T;
      } catch (error) {
        console.error(`[plugins] fetchJSON failed for "${pluginName}" (${url}):`, error);
        return null;
      }
    },

    onUrlChange: tracked(onUrlChange),
  };
}

export function registerPlugin(definition: PluginDefinition): void {
  if (plugins.has(definition.name)) return;

  plugins.set(definition.name, {
    definition,
    state: 'registered',
    cleanups: [],
  });
}

export function startPlugin(name: string): void {
  const instance = plugins.get(name);
  if (!instance || instance.state === 'started') return;

  const deps = instance.definition.dependencies ?? [];
  for (const dep of deps) {
    const depInstance = plugins.get(dep);
    if (!depInstance || depInstance.state !== 'started') {
      instance.state = 'error';
      instance.error = new Error(`missing dependency: ${dep}`);
      return;
    }
  }

  try {
    const api = createPluginAPI(instance);
    const def = instance.definition;

    if (def.patches) {
      for (const patch of def.patches) {
        const target = resolveTarget(patch.target);
        if (!target) continue;
        const cleanup = wrapFunction(target, patch.method, {
          before: patch.before,
          after: patch.after,
          replace: patch.replace,
        });
        instance.cleanups.push(cleanup);
      }
    }

    if (def.eventInterceptors) {
      for (const interceptor of def.eventInterceptors) {
        instance.cleanups.push(addEventInterceptor(interceptor));
      }
    }

    if (def.eventListeners) {
      for (const [tag, listener] of Object.entries(def.eventListeners)) {
        instance.cleanups.push(onProviderEvent(tag, listener));
      }
    }

    if (def.fetchInterceptors) {
      for (const interceptor of def.fetchInterceptors) {
        instance.cleanups.push(addFetchRequestInterceptor(interceptor));
      }
    }

    if (def.fetchResponseInterceptors) {
      for (const interceptor of def.fetchResponseInterceptors) {
        instance.cleanups.push(addFetchResponseInterceptor(interceptor));
      }
    }

    if (def.css) {
      api.injectCSS(def.css);
    }

    if (def.onStart) {
      const result = def.onStart(api);
      if (result instanceof Promise) {
        result.then((cleanup) => {
          if (typeof cleanup === 'function') {
            instance.cleanups.push(cleanup);
          }
        }).catch((err) => {
          instance.state = 'error';
          instance.error = err instanceof Error ? err : new Error(String(err));
          console.warn(`[corgi] async plugin ${def.name} failed:`, err);
        });
      } else if (typeof result === 'function') {
        instance.cleanups.push(result);
      }
    }

    instance.state = 'started';
  } catch (err) {
    instance.state = 'error';
    instance.error = err instanceof Error ? err : new Error(String(err));
    cleanupInstance(instance);
  }
}

export function stopPlugin(name: string): void {
  const instance = plugins.get(name);
  if (!instance || instance.state !== 'started') return;

  try {
    instance.definition.onStop?.();
  } catch {
    // stop errors should not prevent cleanup
  }

  cleanupInstance(instance);
  instance.state = 'stopped';
}

function cleanupInstance(instance: PluginInstance): void {
  for (const cleanup of instance.cleanups.reverse()) {
    try {
      cleanup();
    } catch {
      // cleanup errors should not prevent other cleanups
    }
  }
  instance.cleanups = [];
}

export function startAllPlugins(): void {
  const sorted = topologicalSort();
  for (const name of sorted) {
    startPlugin(name);
  }
}

export function stopAllPlugins(): void {
  for (const [name] of plugins) {
    stopPlugin(name);
  }
}

export function getPlugin(name: string): PluginInstance | undefined {
  return plugins.get(name);
}

export function getPluginState(name: string): PluginState | undefined {
  return plugins.get(name)?.state;
}

export function listPlugins(): PluginInstance[] {
  return [...plugins.values()];
}

function resolveTarget(path: string): Record<string, unknown> | null {
  const parts = path.split('.');
  let current: unknown = window;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return null;
    current = (current as Record<string, unknown>)[part];
  }
  if (current == null || typeof current !== 'object') return null;
  return current as Record<string, unknown>;
}

function topologicalSort(): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function visit(name: string): void {
    if (visited.has(name)) return;
    visited.add(name);
    const instance = plugins.get(name);
    if (!instance) return;
    for (const dep of instance.definition.dependencies ?? []) {
      visit(dep);
    }
    result.push(name);
  }

  for (const [name] of plugins) {
    visit(name);
  }

  return result;
}
