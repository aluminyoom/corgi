import type { EventInterceptor, EventListener } from '@/hooks/events';
import type { FetchInterceptor, FetchResponseInterceptor } from '@/hooks/fetch';

export interface PluginPatch {
  target: string;
  method: string;
  before?: (...args: unknown[]) => unknown[] | void;
  after?: (result: unknown) => unknown | void;
  replace?: (original: (...args: unknown[]) => unknown, ...args: unknown[]) => unknown;
}

export interface PluginDefinition {
  name: string;
  displayName: string;
  version: string;
  authors: string[];
  description: string;
  dependencies?: string[];

  group?: string;
  defaultEnabled?: boolean;

  patches?: PluginPatch[];

  onStart?: (api: PluginAPI) => void | (() => void);
  onStop?: () => void;

  eventInterceptors?: EventInterceptor[];
  eventListeners?: Record<string, EventListener>;
  fetchInterceptors?: FetchInterceptor[];
  fetchResponseInterceptors?: FetchResponseInterceptor[];

  css?: string;
  settings?: PluginSetting[];
}

export interface PluginSetting {
  key: string;
  label: string;
  type: 'boolean' | 'string' | 'number' | 'select';
  default: unknown;
  options?: { label: string; value: unknown }[];
}

export interface PluginAPI {
  trapGlobal: <T>(property: string, callback: (value: T) => void) => () => void;
  wrapFunction: (
    target: Record<string, unknown>,
    method: string,
    options: {
      before?: (...args: unknown[]) => unknown[] | void;
      after?: (result: unknown) => unknown | void;
      replace?: (original: (...args: unknown[]) => unknown, ...args: unknown[]) => unknown;
    },
  ) => () => void;
  onProviderEvent: (tag: string, listener: EventListener) => () => void;
  addEventInterceptor: (interceptor: EventInterceptor) => () => void;
  addFetchRequestInterceptor: (interceptor: FetchInterceptor) => () => void;
  addFetchResponseInterceptor: (interceptor: FetchResponseInterceptor) => () => void;
  observeElement: (
    selector: string,
    handler: (mutations: MutationRecord[]) => void,
    options?: MutationObserverInit,
  ) => () => void;
  setVariable: (name: string, value: string) => void;
  removeVariable: (name: string) => void;
  getComputedVariable: (name: string) => string;
  injectCSS: (css: string) => HTMLStyleElement;
}

export type PluginState = 'registered' | 'started' | 'stopped' | 'error';

export interface PluginInstance {
  definition: PluginDefinition;
  state: PluginState;
  cleanups: (() => void)[];
  error?: Error;
}
