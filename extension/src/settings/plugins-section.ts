import { pluginStates } from "@/utils/storage";
import {
  getBuiltinMeta,
  getBuiltinGroups,
  type PluginGroupMeta,
} from "@/plugins/builtins/discover";
import { formatAuthors } from "@/authors";
import { el, kagiToggle, settingsRow } from "./dom";
import { pluginSettingsButton } from "./form";

function groupRow(
  group: PluginGroupMeta,
  allEnabled: boolean,
  onToggle: (enabled: boolean) => void,
  onExpand: () => void,
  expanded: boolean,
): HTMLElement {
  const expandBtn = el(
    "button",
    {
      style:
        "background: none; border: none; cursor: pointer; color: var(--color-primary, #6366f1); font-size: 12px; padding: 2px 0; margin-top: 4px; display: block;",
    },
    expanded ? "Hide plugins" : "Show plugins",
  );
  expandBtn.addEventListener("click", (e) => {
    e.preventDefault();
    onExpand();
  });

  const left = el(
    "div",
    { className: "c-left lg:min-w-xs pr-24 m-0 fs-base" },
    el("label", {}, group.displayName),
    el("div", { className: "description" }, group.description),
    expandBtn,
  );

  const right = el("div", {
    className: "c-right flex justify-end align-center flex-fluid pt-8 xl:pt-0",
  });
  right.appendChild(kagiToggle(allEnabled, onToggle));

  const row = el("div", { className: "settings-row flex flex-wrap" });
  row.appendChild(left);
  row.appendChild(right);

  const box = el("div", { className: "settings-row-box box pb-16 md:pb-9" });
  box.appendChild(row);
  return box;
}

const expandedGroups = new Set<string>();

export async function renderPluginList(container: HTMLElement): Promise<void> {
  container.innerHTML = "";
  const states = await pluginStates.getValue();
  const disabledSet = new Set(states.disabled);
  const groupedPlugins = new Set<string>();

  for (const group of getBuiltinGroups()) {
    for (const name of group.plugins) groupedPlugins.add(name);
  }

  for (const group of getBuiltinGroups()) {
    const memberStates = group.plugins.map((name) => !disabledSet.has(name));
    const allEnabled = memberStates.every(Boolean);
    const isExpanded = expandedGroups.has(group.name);

    const childContainer = el("div", {
      style: `padding-left: 24px; display: ${isExpanded ? "" : "none"};`,
    });

    const card = groupRow(
      group,
      allEnabled,
      async (nowEnabled) => {
        const current = await pluginStates.getValue();
        const disabled = new Set(current.disabled);
        for (const name of group.plugins) {
          if (nowEnabled) disabled.delete(name);
          else disabled.add(name);
        }
        await pluginStates.setValue({ disabled: [...disabled] });
        renderPluginList(container);
      },
      () => {
        const visible = childContainer.style.display !== "none";
        childContainer.style.display = visible ? "none" : "";
        if (visible) expandedGroups.delete(group.name);
        else expandedGroups.add(group.name);
        const btn = card.querySelector("button");
        if (btn) btn.textContent = visible ? "Show plugins" : "Hide plugins";
      },
      isExpanded,
    );

    container.appendChild(card);

    for (const pluginName of group.plugins) {
      const meta = getBuiltinMeta().find((p) => p.name === pluginName);
      if (!meta) continue;

      childContainer.appendChild(
        settingsRow(
          meta.displayName,
          `${formatAuthors(meta.authors)} \u00B7 v${meta.version} \u2014 ${meta.description}`,
          kagiToggle(!disabledSet.has(pluginName), async (nowEnabled) => {
            const current = await pluginStates.getValue();
            const disabled = new Set(current.disabled);
            if (nowEnabled) disabled.delete(pluginName);
            else disabled.add(pluginName);
            await pluginStates.setValue({ disabled: [...disabled] });
          }),
          pluginSettingsButton(meta),
        ),
      );
    }

    container.appendChild(childContainer);
  }

  for (const plugin of getBuiltinMeta()) {
    if (groupedPlugins.has(plugin.name)) continue;

    container.appendChild(
      settingsRow(
        plugin.displayName,
        `${formatAuthors(plugin.authors)} \u00B7 v${plugin.version} \u2014 ${plugin.description}`,
        kagiToggle(!disabledSet.has(plugin.name), async (nowEnabled) => {
          const current = await pluginStates.getValue();
          const disabled = new Set(current.disabled);
          if (nowEnabled) disabled.delete(plugin.name);
          else disabled.add(plugin.name);
          await pluginStates.setValue({ disabled: [...disabled] });
        }),
        pluginSettingsButton(plugin),
      ),
    );
  }
}
