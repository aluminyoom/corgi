import { themeState } from "@/utils/storage";
import { getThemeId, type Theme } from "@/utils/types";
import { formatAuthors } from "@/authors";
import { el, kagiToggle, settingsRow } from "./dom";

export async function renderThemeList(container: HTMLElement): Promise<void> {
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
    const raw = JSON.parse(json);
    if (!raw.name || !raw.version || !raw.authors?.length) {
      throw new Error("Theme must have name, version, and authors fields");
    }

    const theme: Theme = {
      ...raw,
      displayName: raw.displayName || raw.name,
      description: raw.description || "",
      tags: Array.isArray(raw.tags) ? raw.tags : [],
      variables:
        typeof raw.variables === "object" &&
        raw.variables !== null &&
        !Array.isArray(raw.variables)
          ? raw.variables
          : {},
      css: typeof raw.css === "string" ? raw.css : "",
    };

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

export function createImportButton(
  themeListContainer: HTMLElement,
): HTMLElement {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.display = "none";

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string")
        handleImport(reader.result, themeListContainer);
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
