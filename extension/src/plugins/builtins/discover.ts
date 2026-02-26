import type { PluginDefinition, PluginSetting } from "../types";
import { BUILTIN_GROUP_DEFS } from "./groups";
import type { GroupDef } from "./groups";

type PluginModule = Record<string, unknown>;

const modules = import.meta.glob<PluginModule>(
  ["./**/*.ts", "!./index.ts", "!./groups.ts", "!./discover.ts"],
  { eager: true },
);

function extractPlugin(mod: PluginModule): PluginDefinition | undefined {
  for (const value of Object.values(mod)) {
    if (
      value &&
      typeof value === "object" &&
      "name" in value &&
      "displayName" in value &&
      "version" in value
    ) {
      return value as PluginDefinition;
    }
  }
  return undefined;
}

export const builtinPlugins: PluginDefinition[] = Object.values(modules)
  .map(extractPlugin)
  .filter((p): p is PluginDefinition => p !== undefined);

export interface PluginMeta {
  name: string;
  displayName: string;
  version: string;
  authors: string[];
  description: string;
  builtin: boolean;
  settings?: PluginSetting[];
}

export interface PluginGroupMeta {
  name: string;
  displayName: string;
  version: string;
  authors: string[];
  description: string;
  plugins: string[];
}

export function getBuiltinMeta(): PluginMeta[] {
  return builtinPlugins.map((p) => ({
    name: p.name,
    displayName: p.displayName,
    version: p.version,
    authors: p.authors,
    description: p.description,
    builtin: true,
    settings: p.settings,
  }));
}

export function getBuiltinGroups(): PluginGroupMeta[] {
  const groupMap = new Map<string, GroupDef>();
  for (const g of BUILTIN_GROUP_DEFS) groupMap.set(g.name, g);

  const membersByGroup = new Map<string, string[]>();
  for (const p of builtinPlugins) {
    if (!p.group) continue;
    const members = membersByGroup.get(p.group) ?? [];
    members.push(p.name);
    membersByGroup.set(p.group, members);
  }

  return BUILTIN_GROUP_DEFS.filter((g) => membersByGroup.has(g.name)).map(
    (g) => ({
      name: g.name,
      displayName: g.displayName,
      version: g.version,
      authors: g.authors,
      description: g.description,
      plugins: membersByGroup.get(g.name)!,
    }),
  );
}

export function getDefaultDisabled(): string[] {
  const groupDefaults = new Map<string, boolean>();
  for (const g of BUILTIN_GROUP_DEFS)
    groupDefaults.set(g.name, g.defaultEnabled);

  return builtinPlugins
    .filter((p) => {
      if (p.defaultEnabled === false) return true;
      if (
        p.group &&
        groupDefaults.get(p.group) === false &&
        p.defaultEnabled !== true
      )
        return true;
      return false;
    })
    .map((p) => p.name);
}
