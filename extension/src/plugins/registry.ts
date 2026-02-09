import type { PluginDefinition, PluginInstance, PluginAPI, PluginState } from './types';
import { trapGlobal } from '@/hooks/traps';
import { wrapFunction } from '@/hooks/wrap';
import { addEventInterceptor, onProviderEvent } from '@/hooks/events';
import { addFetchRequestInterceptor, addFetchResponseInterceptor } from '@/hooks/fetch';
import { observeElement } from '@/hooks/observer';
import { setVariable, removeVariable, getComputedVariable } from '@/styles/variables';

const plugins = new Map<string, PluginInstance>();

function createPluginAPI(instance: PluginInstance): PluginAPI {
  function tracked<T extends (...args: never[]) => () => void>(fn: T): T {
    return ((...args: Parameters<T>) => {
      const cleanup = fn(...args);
      instance.cleanups.push(cleanup);
      return cleanup;
    }) as T;
  }

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
      style.setAttribute('data-corgi-plugin', instance.definition.name);
      style.textContent = css;
      (document.head ?? document.documentElement).appendChild(style);
      instance.cleanups.push(() => style.remove());
      return style;
    },
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
      const cleanup = def.onStart(api);
      if (typeof cleanup === 'function') {
        instance.cleanups.push(cleanup);
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
