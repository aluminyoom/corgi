import type { PluginSetting } from "@/plugins/types";
import type { PluginMeta } from "@/plugins/builtins/discover";
import { pluginSettings } from "@/utils/storage";
import { showModal } from "@/ui/modal";
import { el } from "./dom";

export function buildSettingsForm(
  settings: PluginSetting[],
  values: Record<string, unknown>,
): { form: HTMLElement; getValues: () => Record<string, unknown> } {
  const form = el("div", {
    style: "display: flex; flex-direction: column; gap: 16px;",
  });
  const inputs: { key: string; getValue: () => unknown }[] = [];

  for (const setting of settings) {
    const row = el("div", {
      style: "display: flex; flex-direction: column; gap: 4px;",
    });
    const label = el(
      "label",
      {
        style:
          "font-size: 13px; font-weight: 500; color: var(--color, var(--primary-800));",
      },
      setting.label,
    );
    row.appendChild(label);

    const currentValue = values[setting.key] ?? setting.default;

    if (setting.type === "boolean") {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(currentValue);
      checkbox.style.cssText = "width: 16px; height: 16px;";
      row.appendChild(checkbox);
      inputs.push({ key: setting.key, getValue: () => checkbox.checked });
    } else if (setting.type === "select" && setting.options) {
      const select = document.createElement("select");
      select.style.cssText =
        "padding: 6px 10px; border-radius: 8px; border: 1px solid var(--primary-100); background: var(--input-bg, var(--app-bg)); color: var(--color); font-size: 13px; color-scheme: inherit;";
      for (const opt of setting.options) {
        const option = document.createElement("option");
        option.value = String(opt.value);
        option.textContent = opt.label;
        if (String(currentValue) === String(opt.value)) option.selected = true;
        select.appendChild(option);
      }
      row.appendChild(select);
      inputs.push({ key: setting.key, getValue: () => select.value });
    } else if (setting.type === "number") {
      const input = document.createElement("input");
      input.type = "number";
      input.value = String(currentValue ?? "");
      input.style.cssText =
        "padding: 6px 10px; border-radius: 8px; border: 1px solid var(--primary-100); background: var(--input-bg, var(--app-bg)); color: var(--color); font-size: 13px; max-width: 200px; color-scheme: inherit;";
      row.appendChild(input);
      inputs.push({ key: setting.key, getValue: () => Number(input.value) });
    } else if (setting.type === "file") {
      let dataUrl = String(currentValue ?? "");
      const preview = el("div", { style: "margin-top: 4px;" });

      function updatePreview(): void {
        preview.innerHTML = "";
        if (dataUrl) {
          const img = document.createElement("img");
          img.src = dataUrl;
          img.style.cssText =
            "max-width: 200px; max-height: 80px; border-radius: 6px; border: 1px solid var(--primary-100);";
          preview.appendChild(img);

          const clearBtn = el(
            "button",
            {
              style:
                "background: none; border: none; cursor: pointer; color: var(--accent-alert, #e53e3e); font-size: 12px; margin-left: 8px;",
            },
            "Remove",
          );
          clearBtn.addEventListener("click", () => {
            dataUrl = "";
            updatePreview();
          });
          preview.appendChild(clearBtn);
        }
      }

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = setting.accept ?? "image/*";
      fileInput.style.cssText =
        "font-size: 13px; color: var(--color); color-scheme: inherit;";
      fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          dataUrl = reader.result as string;
          updatePreview();
        };
        reader.readAsDataURL(file);
      });

      row.appendChild(fileInput);
      row.appendChild(preview);
      updatePreview();
      inputs.push({ key: setting.key, getValue: () => dataUrl });
    } else {
      const isLong =
        String(currentValue ?? "").length > 60 ||
        setting.key.includes("url") ||
        setting.key.includes("data");
      if (isLong) {
        const textarea = document.createElement("textarea");
        textarea.value = String(currentValue ?? "");
        textarea.rows = 3;
        textarea.style.cssText =
          "padding: 6px 10px; border-radius: 8px; border: 1px solid var(--primary-100); background: var(--input-bg, var(--app-bg)); color: var(--color); font-size: 13px; resize: vertical; font-family: var(--font-mono, monospace); color-scheme: inherit;";
        row.appendChild(textarea);
        inputs.push({ key: setting.key, getValue: () => textarea.value });
      } else {
        const input = document.createElement("input");
        input.type = "text";
        input.value = String(currentValue ?? "");
        input.style.cssText =
          "padding: 6px 10px; border-radius: 8px; border: 1px solid var(--primary-100); background: var(--input-bg, var(--app-bg)); color: var(--color); font-size: 13px; color-scheme: inherit;";
        row.appendChild(input);
        inputs.push({ key: setting.key, getValue: () => input.value });
      }
    }

    form.appendChild(row);
  }

  return {
    form,
    getValues: () => {
      const result: Record<string, unknown> = {};
      for (const { key, getValue } of inputs) result[key] = getValue();
      return result;
    },
  };
}

export async function openPluginSettingsModal(meta: PluginMeta): Promise<void> {
  if (!meta.settings?.length) return;

  const allSettings = await pluginSettings.getValue();
  const currentValues = allSettings[meta.name] ?? {};
  const { form, getValues } = buildSettingsForm(meta.settings, currentValues);

  let handle: ReturnType<typeof showModal>;
  handle = showModal({
    title: `${meta.displayName} Settings`,
    body: form,
    buttons: [
      {
        label: "Cancel",
        variant: "secondary",
        action() {
          handle.close();
        },
      },
      {
        label: "Save",
        variant: "primary",
        async action() {
          const values = getValues();
          const all = await pluginSettings.getValue();
          all[meta.name] = values;
          await pluginSettings.setValue(all);
          handle.close();
        },
      },
    ],
  });
}

export function pluginSettingsButton(meta: PluginMeta): HTMLElement | null {
  if (!meta.settings?.length) return null;

  const btn = el("button", {
    style:
      "background: none; border: none; cursor: pointer; padding: 4px; margin-right: 8px; color: var(--color-primary, #6366f1); display: flex; align-items: center;",
  });
  btn.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.325 4.317C10.751 2.562 13.249 2.561 13.677 4.317 13.954 5.454 15.251 5.99 16.248 5.383 17.791 4.443 19.558 6.209 18.618 7.753 18.01 8.753 18.548 10.049 19.683 10.325 21.439 10.751 21.439 13.249 19.683 13.677 18.546 13.954 18.01 15.251 18.617 16.248 19.557 17.791 17.791 19.558 16.247 18.618 15.247 18.01 13.951 18.548 13.675 19.683 13.249 21.439 10.751 21.439 10.323 19.683 10.046 18.546 8.749 18.01 7.752 18.617 6.209 19.557 4.442 17.791 5.382 16.247 5.99 15.247 5.452 13.951 4.317 13.675 2.562 13.249 2.561 10.751 4.317 10.323 5.454 10.046 5.99 8.749 5.383 7.752 4.443 6.209 6.209 4.442 7.753 5.382 8.753 5.99 10.049 5.452 10.325 4.317Z"/><circle cx="12" cy="12" r="3"/></svg>';
  btn.title = "Plugin settings";
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPluginSettingsModal(meta);
  });
  return btn;
}
