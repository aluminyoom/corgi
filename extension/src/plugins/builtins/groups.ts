export interface GroupDef {
  name: string;
  displayName: string;
  version: string;
  authors: string[];
  description: string;
  defaultEnabled: boolean;
}

export const BUILTIN_GROUP_DEFS: GroupDef[] = [
  {
    name: "corgi-polish",
    displayName: "Corgi Polish",
    version: "0.1.0",
    authors: ["aluminyoom"],
    description:
      "A collection of subtle visual refinements that make Kagi feel more polished without changing its identity. Disabled by default.",
    defaultEnabled: false,
  },
];
