import { themeState, extensionEnabled, pluginStates } from "@/utils/storage";
import { getBuiltinMeta } from "@/plugins/builtins/discover";
import { getThemeId, type Theme } from "@/utils/types";
import { formatAuthors } from "@/authors";
import { el, kagiToggle, settingsRow, sectionHeading } from "./dom";
import { renderPluginList } from "./plugins-section";

const PAGE_CONTAINER_ID = "corgi-settings-page";

async function renderThemeList(container: HTMLElement): Promise<void> {
  container.innerHTML = "";
  const state = await themeState.getValue();

  if (state.themes.length === 0) {
    container.appendChild(
      settingsRow(
        "No themes installed",
        "Import a theme JSON file to get started.",
        el("span"),
      ),
    );
    return;
  }

  for (const theme of state.themes) {
    const id = getThemeId(theme);
    const isActive = state.activeThemeIds.includes(id);

    container.appendChild(
      settingsRow(
        theme.displayName,
        `${formatAuthors(theme.authors)} \u00B7 v${theme.version}${theme.description ? " \u2014 " + theme.description : ""}`,
        kagiToggle(isActive, async (nowActive) => {
          const current = await themeState.getValue();
          const ids = new Set(current.activeThemeIds);
          if (nowActive) ids.add(id);
          else ids.delete(id);
          await themeState.setValue({ ...current, activeThemeIds: [...ids] });
          renderThemeList(container);
        }),
      ),
    );
  }
}

async function handleImport(
  json: string,
  themeListContainer: HTMLElement,
): Promise<void> {
  try {
    const theme = JSON.parse(json) as Theme;
    if (!theme.name || !theme.version || !theme.authors?.length) {
      throw new Error("Theme must have name, version, and authors fields");
    }

    const current = await themeState.getValue();
    const id = getThemeId(theme);
    const existing = current.themes.findIndex((t) => getThemeId(t) === id);
    const themes = [...current.themes];
    if (existing >= 0) themes[existing] = theme;
    else themes.push(theme);

    await themeState.setValue({ ...current, themes });
    renderThemeList(themeListContainer);
  } catch (err) {
    console.error("[corgi] failed to import theme:", err);
  }
}

function createImportButton(onImport: (json: string) => void): HTMLElement {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.display = "none";

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onImport(reader.result);
    };
    reader.readAsText(file);
    fileInput.value = "";
  });

  const btn = el(
    "button",
    {
      className: "_0_k_ui_dropdown k_ui_dropdown __basic",
      style: "cursor: pointer; padding: 6px 14px; font-size: 13px;",
    },
    "Import Theme (JSON)",
  );
  btn.addEventListener("click", () => fileInput.click());

  const wrapper = el("div", { className: "mt-12 mb-16" });
  wrapper.appendChild(btn);
  wrapper.appendChild(fileInput);
  return wrapper;
}

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
  section.appendChild(
    createImportButton((json) => handleImport(json, themeList)),
  );

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
