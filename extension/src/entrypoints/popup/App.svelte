<script lang="ts">
  import { sendMessage } from '@/utils/messaging';
  import type { Theme } from '@/utils/types';
  import { getThemeId } from '@/utils/types';

  let themes = $state<Theme[]>([]);
  let activeIds = $state<string[]>([]);
  let enabled = $state(true);
  let importing = $state(false);

  async function load() {
    enabled = await sendMessage('getEnabled', undefined);
    const active = await sendMessage('getActiveThemes', undefined);
    themes = active;
    activeIds = active.map(getThemeId);
  }

  async function toggleEnabled() {
    enabled = !enabled;
    await sendMessage('setEnabled', { enabled });
  }

  async function toggleTheme(themeId: string) {
    const next = activeIds.includes(themeId)
      ? activeIds.filter((id) => id !== themeId)
      : [...activeIds, themeId];
    activeIds = next;
    await sendMessage('setActiveThemes', { themeIds: next });
  }

  async function importTheme() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        importing = true;
        const text = await file.text();
        const theme: Theme = JSON.parse(text);
        await sendMessage('addTheme', { theme });
        await load();
      } catch {
        console.error('Failed to import theme');
      } finally {
        importing = false;
      }
    };
    input.click();
  }

  load();
</script>

<main>
  <header>
    <h1>Kagistry</h1>
    <button class="toggle" class:active={enabled} onclick={toggleEnabled}>
      {enabled ? 'On' : 'Off'}
    </button>
  </header>

  {#if themes.length === 0}
    <p class="empty">No themes installed. Import a theme to get started.</p>
  {:else}
    <ul>
      {#each themes as theme (getThemeId(theme))}
        <li>
          <label>
            <input
              type="checkbox"
              checked={activeIds.includes(getThemeId(theme))}
              onchange={() => toggleTheme(getThemeId(theme))}
            />
            <span class="theme-name">{theme.name}</span>
            <span class="theme-author">{theme.author}</span>
          </label>
        </li>
      {/each}
    </ul>
  {/if}

  <footer>
    <button onclick={importTheme} disabled={importing}>
      {importing ? 'Importing...' : 'Import Theme'}
    </button>
  </footer>
</main>

<style>
  main {
    width: 320px;
    padding: 16px;
    font-family: system-ui, -apple-system, sans-serif;
    color: #e0e0e0;
    background: #1a1a2e;
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  h1 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .toggle {
    padding: 4px 12px;
    border-radius: 12px;
    border: 1px solid #444;
    background: #2a2a3e;
    color: #888;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
  }

  .toggle.active {
    background: #4a6cf7;
    color: #fff;
    border-color: #4a6cf7;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 8px 0;
    border-bottom: 1px solid #2a2a3e;
  }

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .theme-name {
    font-size: 14px;
    flex: 1;
  }

  .theme-author {
    font-size: 12px;
    color: #666;
  }

  .empty {
    font-size: 13px;
    color: #666;
    text-align: center;
    padding: 24px 0;
  }

  footer {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }

  footer button {
    flex: 1;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid #333;
    background: #2a2a3e;
    color: #e0e0e0;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.15s;
  }

  footer button:hover:not(:disabled) {
    background: #3a3a5e;
  }

  footer button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
