import type { PluginDefinition } from './types';
import { registerPlugin, startPlugin } from './registry';

export function definePlugin(definition: PluginDefinition): PluginDefinition {
  return definition;
}

export function installPlugin(definition: PluginDefinition): void {
  registerPlugin(definition);
  startPlugin(definition.name);
}

export { definePlugin as plugin };
