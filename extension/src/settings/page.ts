import { extensionEnabled, pluginStates } from "@/utils/storage";
import { getBuiltinMeta } from "@/plugins/builtins/discover";
import { el, kagiToggle, settingsRow, sectionHeading } from "./dom";
import { renderPluginList } from "./plugins-section";
import { renderThemeList, createImportButton } from "./themes-section";

const PAGE_CONTAINER_ID = "corgi-settings-page";

function createAdmonition(): HTMLElement {
  const box = el("div", { className: "alert" });
  box.style.cssText =
    "background: var(--app-bg); border: 1px solid var(--accent-alert, var(--red-600)); margin-bottom: 20px;";

  const heading = el("div", {});
  heading.style.cssText =
    "font-weight: 600; color: var(--accent-alert, var(--red-600)); margin-bottom: 6px;";
  heading.textContent = "Corgi is an unofficial project";

  const text = el("div", {});
  text.style.cssText =
    "color: var(--primary-600); margin-bottom: 12px; line-height: 1.5;";
  text.textContent =
    "Corgi is a third-party extension and is not affiliated with or supported by Kagi. " +
    "Please do not contact Kagi support for Corgi-related issues. Before reporting a bug to Kagi, " +
    "disable Corgi first to confirm the issue is not caused by it.";

  const actions = el("div", { className: "flex gap-8 flex-wrap" });

  const issueLink = el("a", {
    href: "https://github.com/aluminyoom/corgi/issues",
    target: "_blank",
    rel: "noopener",
    className: "btn --danger-secondary",
  });
  issueLink.style.cssText =
    "text-decoration: none; font-size: 0.8125rem; min-height: 32px; padding: 0 16px;";
  issueLink.textContent = "Report a Corgi issue";

  const kagiLink = el("a", {
    href: "https://github.com/aluminyoom/corgi",
    target: "_blank",
    rel: "noopener",
    className: "btn --secondary",
  });
  kagiLink.style.cssText =
    "text-decoration: none; font-size: 0.8125rem; min-height: 32px; padding: 0 16px;";
  kagiLink.textContent = "View Source Code";

  actions.appendChild(issueLink);
  actions.appendChild(kagiLink);
  box.appendChild(heading);
  box.appendChild(text);
  box.appendChild(actions);
  return box;
}

export async function buildSettingsPage(): Promise<HTMLElement> {
  const container = el("div", { id: PAGE_CONTAINER_ID });

  const header = el("div", { className: "flex align-start justify-between" });
  const title = el("h1", {}, "Manage your Corgi extensions and preferences");
  header.appendChild(title);
  container.appendChild(header);

  const form = el("div", { className: "s-form" });
  const section = el("div", { className: "max-w-xl _0_spc" });

  section.appendChild(createAdmonition());

  const enabled = await extensionEnabled.getValue();
  section.appendChild(
    settingsRow(
      "Enable Corgi",
      "Master switch for the Corgi extension. When disabled, no plugins or themes will run.",
      kagiToggle(enabled, async (value) => {
        await extensionEnabled.setValue(value);
      }),
    ),
  );

  const pluginCount = getBuiltinMeta().length;
  const states = await pluginStates.getValue();
  const disabledCount = states.disabled.length;
  const enabledCount = pluginCount - disabledCount;
  section.appendChild(
    sectionHeading(
      `Plugins (${pluginCount})`,
      `${enabledCount} plugins enabled`,
    ),
  );

  const pluginList = el("div", { id: "corgi-plugin-list" });
  await renderPluginList(pluginList);
  section.appendChild(pluginList);

  section.appendChild(sectionHeading("Themes"));

  const themeList = el("div", { id: "corgi-theme-list" });
  await renderThemeList(themeList);
  section.appendChild(themeList);
  section.appendChild(createImportButton(themeList));

  const hint = el(
    "div",
    { className: "description mt-8" },
    "Some changes take effect on next page load.",
  );
  section.appendChild(hint);

  form.appendChild(section);
  container.appendChild(form);
  return container;
}

export function isSettingsPageMounted(): boolean {
  return document.getElementById(PAGE_CONTAINER_ID) !== null;
}
