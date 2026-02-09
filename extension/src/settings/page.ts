import { themeState, extensionEnabled, pluginStates, BUILTIN_PLUGINS } from '@/utils/storage';
import { getThemeId, type Theme } from '@/utils/types';

const PAGE_CONTAINER_ID = 'corgi-settings-page';

function createHeader(): HTMLElement {
  const header = document.createElement('div');
  header.className = 'flex align-center justify-between mb-24';

  const title = document.createElement('h1');
  title.className = 'heading-2';
  title.textContent = 'Corgi';

  const version = document.createElement('span');
  version.className = 'text-xs color-muted ml-8';
  version.textContent = `v${browser.runtime.getManifest().version}`;

  title.appendChild(version);
  header.appendChild(title);

  return header;
}

function createToggleRow(label: string, checked: boolean, onChange: (value: boolean) => void): HTMLElement {
  const row = document.createElement('div');
  row.className = 'setting-row flex align-center justify-between py-12';

  const text = document.createElement('span');
  text.className = 'text-sm';
  text.textContent = label;

  const toggle = document.createElement('label');
  toggle.className = 'switch';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));

  const slider = document.createElement('span');
  slider.className = 'slider round';

  toggle.appendChild(input);
  toggle.appendChild(slider);

  row.appendChild(text);
  row.appendChild(toggle);

  return row;
}

function createSection(title: string): HTMLElement {
  const section = document.createElement('div');
  section.className = 'mb-24';

  const heading = document.createElement('h2');
  heading.className = 'heading-3 mb-12';
  heading.textContent = title;

  section.appendChild(heading);
  return section;
}

function createThemeCard(theme: Theme, active: boolean, onToggle: (active: boolean) => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'p-16 rounded-lg mb-8';
  card.style.cssText = 'border: 1px solid var(--border-color, rgba(128,128,128,0.2));';

  const top = document.createElement('div');
  top.className = 'flex align-center justify-between';

  const info = document.createElement('div');

  const name = document.createElement('strong');
  name.className = 'text-sm';
  name.textContent = theme.name;

  const meta = document.createElement('div');
  meta.className = 'text-xs color-muted mt-2';
  meta.textContent = `${theme.author} \u00B7 v${theme.version}`;

  info.appendChild(name);
  info.appendChild(meta);

  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.checked = active;
  toggle.addEventListener('change', () => onToggle(toggle.checked));

  top.appendChild(info);
  top.appendChild(toggle);
  card.appendChild(top);

  if (theme.description) {
    const desc = document.createElement('div');
    desc.className = 'text-xs color-muted mt-8';
    desc.textContent = theme.description;
    card.appendChild(desc);
  }

  return card;
}

function createEmptyState(message: string): HTMLElement {
  const empty = document.createElement('div');
  empty.className = 'text-sm color-muted py-16 text-center';
  empty.textContent = message;
  return empty;
}

function createImportButton(onImport: (json: string) => void): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'mt-12';

  const btn = document.createElement('button');
  btn.className = 'btn btn-sm btn-secondary';
  btn.textContent = 'Import Theme (JSON)';

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';
  fileInput.style.display = 'none';

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImport(reader.result);
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  btn.addEventListener('click', () => fileInput.click());

  wrapper.appendChild(btn);
  wrapper.appendChild(fileInput);

  return wrapper;
}

async function renderThemeList(container: HTMLElement): Promise<void> {
  container.innerHTML = '';

  const state = await themeState.getValue();
  const activeIds = state.activeThemeIds;

  if (state.themes.length === 0) {
    container.appendChild(createEmptyState('No themes installed. Import a theme JSON to get started.'));
    return;
  }

  for (const theme of state.themes) {
    const id = getThemeId(theme);
    const isActive = activeIds.includes(id);

    const card = createThemeCard(theme, isActive, async (nowActive) => {
      const current = await themeState.getValue();
      const ids = new Set(current.activeThemeIds);

      if (nowActive) {
        ids.add(id);
      } else {
        ids.delete(id);
      }

      await themeState.setValue({ ...current, activeThemeIds: [...ids] });
      renderThemeList(container);
    });

    container.appendChild(card);
  }
}

async function handleImport(json: string, themeListContainer: HTMLElement): Promise<void> {
  try {
    const theme = JSON.parse(json) as Theme;

    if (!theme.name || !theme.version || !theme.author) {
      throw new Error('Theme must have name, version, and author fields');
    }

    const current = await themeState.getValue();
    const id = getThemeId(theme);
    const existing = current.themes.findIndex((t) => getThemeId(t) === id);

    const themes = [...current.themes];
    if (existing >= 0) {
      themes[existing] = theme;
    } else {
      themes.push(theme);
    }

    await themeState.setValue({ ...current, themes });
    renderThemeList(themeListContainer);
  } catch (err) {
    console.error('[corgi] failed to import theme:', err);
  }
}

function createPluginCard(
  name: string,
  version: string,
  author: string,
  description: string,
  enabled: boolean,
  onToggle: (enabled: boolean) => void,
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'p-16 rounded-lg mb-8';
  card.style.cssText = 'border: 1px solid var(--border-color, rgba(128,128,128,0.2));';

  const top = document.createElement('div');
  top.className = 'flex align-center justify-between';

  const info = document.createElement('div');

  const nameEl = document.createElement('strong');
  nameEl.className = 'text-sm';
  nameEl.textContent = name;

  const meta = document.createElement('div');
  meta.className = 'text-xs color-muted mt-2';
  meta.textContent = `${author} \u00B7 v${version}`;

  info.appendChild(nameEl);
  info.appendChild(meta);

  const toggle = document.createElement('label');
  toggle.className = 'switch';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = enabled;
  input.addEventListener('change', () => onToggle(input.checked));

  const slider = document.createElement('span');
  slider.className = 'slider round';

  toggle.appendChild(input);
  toggle.appendChild(slider);

  top.appendChild(info);
  top.appendChild(toggle);
  card.appendChild(top);

  if (description) {
    const desc = document.createElement('div');
    desc.className = 'text-xs color-muted mt-8';
    desc.textContent = description;
    card.appendChild(desc);
  }

  return card;
}

async function renderPluginList(container: HTMLElement): Promise<void> {
  container.innerHTML = '';

  const states = await pluginStates.getValue();
  const disabledSet = new Set(states.disabled);

  for (const plugin of BUILTIN_PLUGINS) {
    const enabled = !disabledSet.has(plugin.name);

    const card = createPluginCard(
      plugin.name,
      plugin.version,
      plugin.author,
      plugin.description,
      enabled,
      async (nowEnabled) => {
        const current = await pluginStates.getValue();
        const disabled = new Set(current.disabled);

        if (nowEnabled) {
          disabled.delete(plugin.name);
        } else {
          disabled.add(plugin.name);
        }

        await pluginStates.setValue({ disabled: [...disabled] });
      },
    );

    container.appendChild(card);
  }
}

export async function buildSettingsPage(): Promise<HTMLElement> {
  const container = document.createElement('div');
  container.id = PAGE_CONTAINER_ID;

  const header = createHeader();
  container.appendChild(header);

  const enabled = await extensionEnabled.getValue();
  const enableRow = createToggleRow('Enable Corgi', enabled, async (value) => {
    await extensionEnabled.setValue(value);
  });
  container.appendChild(enableRow);

  const hr = document.createElement('hr');
  hr.className = 'my-16';
  container.appendChild(hr);

  const themesSection = createSection('Themes');
  const themeList = document.createElement('div');
  themeList.id = 'corgi-theme-list';

  await renderThemeList(themeList);
  themesSection.appendChild(themeList);
  themesSection.appendChild(createImportButton((json) => handleImport(json, themeList)));

  container.appendChild(themesSection);

  const hr2 = document.createElement('hr');
  hr2.className = 'my-16';
  container.appendChild(hr2);

  const pluginsSection = createSection('Plugins');
  const pluginList = document.createElement('div');
  pluginList.id = 'corgi-plugin-list';

  await renderPluginList(pluginList);
  pluginsSection.appendChild(pluginList);

  const hint = document.createElement('div');
  hint.className = 'text-xs color-muted mt-8';
  hint.textContent = 'Changes take effect on next page load.';
  pluginsSection.appendChild(hint);

  container.appendChild(pluginsSection);

  return container;
}

export function isSettingsPageMounted(): boolean {
  return document.getElementById(PAGE_CONTAINER_ID) !== null;
}
