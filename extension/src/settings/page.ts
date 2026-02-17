import { themeState, extensionEnabled, pluginStates, pluginSettings } from '@/utils/storage';
import { getBuiltinMeta, getBuiltinGroups, type PluginMeta, type PluginGroupMeta } from '@/plugins/builtins/discover';
import type { PluginSetting } from '@/plugins/types';
import { getThemeId, type Theme } from '@/utils/types';
import { formatAuthors } from '@/authors';
import { showModal } from '@/ui/modal';

const PAGE_CONTAINER_ID = 'corgi-settings-page';

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  ...children: (HTMLElement | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') element.className = value;
      else element.setAttribute(key, value);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') element.appendChild(document.createTextNode(child));
    else element.appendChild(child);
  }
  return element;
}

function kagiToggle(checked: boolean, onChange: (value: boolean) => void): HTMLElement {
  const input = document.createElement('input');
  input.type = 'checkbox';
  if (checked) input.checked = true;

  const hidden = document.createElement('input');
  hidden.type = 'hidden';
  hidden.value = 'false';

  const bar = el('div', { className: 'k_ui_toggle_switch_bar' });
  const toggle = el('label', { className: '_0_k_ui_toggle_switch k_ui_toggle_switch' });
  toggle.appendChild(input);
  toggle.appendChild(hidden);
  toggle.appendChild(bar);

  input.addEventListener('change', () => onChange(input.checked));
  return toggle;
}

function settingsRow(label: string, description: string, control: HTMLElement, gearBtn?: HTMLElement | null): HTMLElement {
  const left = el('div', { className: 'c-left lg:min-w-xs pr-24 m-0 fs-base' },
    el('label', {}, label),
    el('div', { className: 'description' }, description),
  );

  const right = el('div', { className: 'c-right flex justify-end align-center flex-fluid pt-8 xl:pt-0' });
  if (gearBtn) right.appendChild(gearBtn);
  right.appendChild(control);

  const row = el('div', { className: 'settings-row flex flex-wrap' });
  row.appendChild(left);
  row.appendChild(right);

  const box = el('div', { className: 'settings-row-box box pb-16 md:pb-9' });
  box.appendChild(row);
  return box;
}

function sectionHeading(text: string): HTMLElement {
  const box = el('div', { className: 'settings-row-box box pb-16 md:pb-9' });
  box.style.borderBottom = 'none';
  const heading = el('h2', { className: 'heading-3 mt-8' }, text);
  box.appendChild(heading);
  return box;
}

function buildSettingsForm(
  settings: PluginSetting[],
  values: Record<string, unknown>,
): { form: HTMLElement; getValues: () => Record<string, unknown> } {
  const form = el('div', { style: 'display: flex; flex-direction: column; gap: 16px;' });
  const inputs: { key: string; getValue: () => unknown }[] = [];

  for (const setting of settings) {
    const row = el('div', { style: 'display: flex; flex-direction: column; gap: 4px;' });
    const label = el('label', { style: 'font-size: 13px; font-weight: 500; color: var(--color, var(--primary-800, #222));' }, setting.label);
    row.appendChild(label);

    const currentValue = values[setting.key] ?? setting.default;

    if (setting.type === 'boolean') {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(currentValue);
      checkbox.style.cssText = 'width: 16px; height: 16px;';
      row.appendChild(checkbox);
      inputs.push({ key: setting.key, getValue: () => checkbox.checked });
    } else if (setting.type === 'select' && setting.options) {
      const select = document.createElement('select');
      select.style.cssText = 'padding: 6px 10px; border-radius: 8px; border: 1px solid var(--primary-100, #e0e0e0); background: var(--app-bg, #fff); color: var(--color, #222); font-size: 13px;';
      for (const opt of setting.options) {
        const option = document.createElement('option');
        option.value = String(opt.value);
        option.textContent = opt.label;
        if (String(currentValue) === String(opt.value)) option.selected = true;
        select.appendChild(option);
      }
      row.appendChild(select);
      inputs.push({ key: setting.key, getValue: () => select.value });
    } else if (setting.type === 'number') {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = String(currentValue ?? '');
      input.style.cssText = 'padding: 6px 10px; border-radius: 8px; border: 1px solid var(--primary-100, #e0e0e0); background: var(--app-bg, #fff); color: var(--color, #222); font-size: 13px; max-width: 200px;';
      row.appendChild(input);
      inputs.push({ key: setting.key, getValue: () => Number(input.value) });
    } else if (setting.type === 'file') {
      let dataUrl = String(currentValue ?? '');
      const preview = el('div', { style: 'margin-top: 4px;' });

      function updatePreview(): void {
        preview.innerHTML = '';
        if (dataUrl) {
          const img = document.createElement('img');
          img.src = dataUrl;
          img.style.cssText = 'max-width: 200px; max-height: 80px; border-radius: 6px; border: 1px solid var(--primary-100, #e0e0e0);';
          preview.appendChild(img);

          const clearBtn = el('button', {
            style: 'background: none; border: none; cursor: pointer; color: var(--accent-alert, #e53e3e); font-size: 12px; margin-left: 8px;',
          }, 'Remove');
          clearBtn.addEventListener('click', () => {
            dataUrl = '';
            updatePreview();
          });
          preview.appendChild(clearBtn);
        }
      }

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = setting.accept ?? 'image/*';
      fileInput.style.cssText = 'font-size: 13px;';
      fileInput.addEventListener('change', () => {
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
      const isLong = String(currentValue ?? '').length > 60 || setting.key.includes('url') || setting.key.includes('data');
      if (isLong) {
        const textarea = document.createElement('textarea');
        textarea.value = String(currentValue ?? '');
        textarea.rows = 3;
        textarea.style.cssText = 'padding: 6px 10px; border-radius: 8px; border: 1px solid var(--primary-100, #e0e0e0); background: var(--app-bg, #fff); color: var(--color, #222); font-size: 13px; resize: vertical; font-family: var(--font-mono, monospace);';
        row.appendChild(textarea);
        inputs.push({ key: setting.key, getValue: () => textarea.value });
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = String(currentValue ?? '');
        input.style.cssText = 'padding: 6px 10px; border-radius: 8px; border: 1px solid var(--primary-100, #e0e0e0); background: var(--app-bg, #fff); color: var(--color, #222); font-size: 13px;';
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

async function openPluginSettingsModal(meta: PluginMeta): Promise<void> {
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
        label: 'Cancel',
        variant: 'secondary',
        action() { handle.close(); },
      },
      {
        label: 'Save',
        variant: 'primary',
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

function pluginSettingsButton(meta: PluginMeta): HTMLElement | null {
  if (!meta.settings?.length) return null;

  const btn = el('button', {
    style: 'background: none; border: none; cursor: pointer; padding: 4px; margin-right: 8px; color: var(--color-primary, #6366f1); display: flex; align-items: center;',
  });
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>';
  btn.title = 'Plugin settings';
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openPluginSettingsModal(meta);
  });
  return btn;
}

function groupRow(
  group: PluginGroupMeta,
  allEnabled: boolean,
  onToggle: (enabled: boolean) => void,
  onExpand: () => void,
  expanded: boolean,
): HTMLElement {
  const expandBtn = el('button', {
    style: 'background: none; border: none; cursor: pointer; color: var(--color-primary, #6366f1); font-size: 12px; padding: 2px 0; margin-top: 4px; display: block;',
  }, expanded ? 'Hide plugins' : 'Show plugins');
  expandBtn.addEventListener('click', (e) => {
    e.preventDefault();
    onExpand();
  });

  const left = el('div', { className: 'c-left lg:min-w-xs pr-24 m-0 fs-base' },
    el('label', {}, group.displayName),
    el('div', { className: 'description' }, group.description),
    expandBtn,
  );

  const right = el('div', { className: 'c-right flex justify-end align-center flex-fluid pt-8 xl:pt-0' });
  right.appendChild(kagiToggle(allEnabled, onToggle));

  const row = el('div', { className: 'settings-row flex flex-wrap' });
  row.appendChild(left);
  row.appendChild(right);

  const box = el('div', { className: 'settings-row-box box pb-16 md:pb-9' });
  box.appendChild(row);
  return box;
}

const expandedGroups = new Set<string>();

async function renderPluginList(container: HTMLElement): Promise<void> {
  container.innerHTML = '';
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

    const childContainer = el('div', { style: `padding-left: 24px; display: ${isExpanded ? '' : 'none'};` });

    const card = groupRow(group, allEnabled,
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
        const visible = childContainer.style.display !== 'none';
        childContainer.style.display = visible ? 'none' : '';
        if (visible) expandedGroups.delete(group.name);
        else expandedGroups.add(group.name);
        const btn = card.querySelector('button');
        if (btn) btn.textContent = visible ? 'Show plugins' : 'Hide plugins';
      },
      isExpanded,
    );

    container.appendChild(card);

    for (const pluginName of group.plugins) {
      const meta = getBuiltinMeta().find((p) => p.name === pluginName);
      if (!meta) continue;

      childContainer.appendChild(settingsRow(
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
      ));
    }

    container.appendChild(childContainer);
  }

  for (const plugin of getBuiltinMeta()) {
    if (groupedPlugins.has(plugin.name)) continue;

    container.appendChild(settingsRow(
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
    ));
  }
}

async function renderThemeList(container: HTMLElement): Promise<void> {
  container.innerHTML = '';
  const state = await themeState.getValue();

  if (state.themes.length === 0) {
    container.appendChild(settingsRow(
      'No themes installed',
      'Import a theme JSON file to get started.',
      el('span'),
    ));
    return;
  }

  for (const theme of state.themes) {
    const id = getThemeId(theme);
    const isActive = state.activeThemeIds.includes(id);

    container.appendChild(settingsRow(
      theme.displayName,
      `${formatAuthors(theme.authors)} \u00B7 v${theme.version}${theme.description ? ' \u2014 ' + theme.description : ''}`,
      kagiToggle(isActive, async (nowActive) => {
        const current = await themeState.getValue();
        const ids = new Set(current.activeThemeIds);
        if (nowActive) ids.add(id);
        else ids.delete(id);
        await themeState.setValue({ ...current, activeThemeIds: [...ids] });
        renderThemeList(container);
      }),
    ));
  }
}

async function handleImport(json: string, themeListContainer: HTMLElement): Promise<void> {
  try {
    const theme = JSON.parse(json) as Theme;
    if (!theme.name || !theme.version || !theme.authors?.length) {
      throw new Error('Theme must have name, version, and authors fields');
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
    console.error('[corgi] failed to import theme:', err);
  }
}

function createImportButton(onImport: (json: string) => void): HTMLElement {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') onImport(reader.result);
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  const btn = el('button', {
    className: '_0_k_ui_dropdown k_ui_dropdown __basic',
    style: 'cursor: pointer; padding: 6px 14px; font-size: 13px;',
  }, 'Import Theme (JSON)');
  btn.addEventListener('click', () => fileInput.click());

  const wrapper = el('div', { className: 'mt-12 mb-16' });
  wrapper.appendChild(btn);
  wrapper.appendChild(fileInput);
  return wrapper;
}

function createAdmonition(): HTMLElement {
  const box = el('div', { className: 'alert' });
  box.style.cssText =
    'background: var(--app-bg); border: 1px solid var(--accent-alert, var(--red-600)); margin-bottom: 20px;';

  const heading = el('div', {});
  heading.style.cssText =
    'font-weight: 600; color: var(--accent-alert, var(--red-600)); margin-bottom: 6px;';
  heading.textContent = 'Corgi is an unofficial project';

  const text = el('div', {});
  text.style.cssText = 'color: var(--primary-600); margin-bottom: 12px; line-height: 1.5;';
  text.textContent =
    'Corgi is a third-party extension and is not affiliated with or supported by Kagi. ' +
    'Please do not contact Kagi support for Corgi-related issues. Before reporting a bug to Kagi, ' +
    'disable Corgi first to confirm the issue is not caused by it.';

  const actions = el('div', { className: 'flex gap-8 flex-wrap' });

  const issueLink = el('a', {
    href: 'https://github.com/aluminyoom/corgi/issues',
    target: '_blank',
    rel: 'noopener',
    className: 'btn --danger-secondary',
  });
  issueLink.style.cssText = 'text-decoration: none; font-size: 0.8125rem; min-height: 32px; padding: 0 16px;';
  issueLink.textContent = 'Report a Corgi issue';

  const kagiLink = el('a', {
    href: 'https://kagifeedback.org',
    target: '_blank',
    rel: 'noopener',
    className: 'btn --secondary',
  });
  kagiLink.style.cssText = 'text-decoration: none; font-size: 0.8125rem; min-height: 32px; padding: 0 16px;';
  kagiLink.textContent = 'Kagi Feedback';

  actions.appendChild(issueLink);
  actions.appendChild(kagiLink);
  box.appendChild(heading);
  box.appendChild(text);
  box.appendChild(actions);
  return box;
}

export async function buildSettingsPage(): Promise<HTMLElement> {
  const container = el('div', { id: PAGE_CONTAINER_ID });

  const header = el('div', { className: 'flex align-start justify-between' });
  const title = el('h1', {}, 'Manage your Corgi extensions and preferences');
  header.appendChild(title);
  container.appendChild(header);

  const form = el('div', { className: 's-form' });
  const section = el('div', { className: 'max-w-xl _0_spc' });

  section.appendChild(createAdmonition());

  const enabled = await extensionEnabled.getValue();
  section.appendChild(settingsRow(
    'Enable Corgi',
    'Master switch for the Corgi extension. When disabled, no plugins or themes will run.',
    kagiToggle(enabled, async (value) => {
      await extensionEnabled.setValue(value);
    }),
  ));

  section.appendChild(sectionHeading(`Plugins (${getBuiltinMeta().length})`));

  const pluginList = el('div', { id: 'corgi-plugin-list' });
  await renderPluginList(pluginList);
  section.appendChild(pluginList);

  section.appendChild(sectionHeading('Themes'));

  const themeList = el('div', { id: 'corgi-theme-list' });
  await renderThemeList(themeList);
  section.appendChild(themeList);
  section.appendChild(createImportButton((json) => handleImport(json, themeList)));

  const hint = el('div', { className: 'description mt-8' }, 'Some changes take effect on next page load.');
  section.appendChild(hint);

  form.appendChild(section);
  container.appendChild(form);
  return container;
}

export function isSettingsPageMounted(): boolean {
  return document.getElementById(PAGE_CONTAINER_ID) !== null;
}
