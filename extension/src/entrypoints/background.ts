import { themeState, extensionEnabled } from '@/utils/storage';
import { getThemeId, type Theme } from '@/utils/types';
import { onMessage } from '@/utils/messaging';

export default defineBackground(() => {
  browser.action.onClicked.addListener(() => {
    browser.tabs.create({ url: 'https://kagi.com/settings/corgi' });
  });

  onMessage('getActiveThemes', async () => {
    const state = await themeState.getValue();
    return state.themes.filter((t) => state.activeThemeIds.includes(getThemeId(t)));
  });

  onMessage('getEnabled', () => extensionEnabled.getValue());

  onMessage('setEnabled', async ({ data }) => {
    await extensionEnabled.setValue(data.enabled);
  });

  onMessage('addTheme', async ({ data }) => {
    const state = await themeState.getValue();
    const id = getThemeId(data.theme);
    const existing = state.themes.findIndex((t) => getThemeId(t) === id);

    const themes =
      existing >= 0
        ? state.themes.map((t, i) => (i === existing ? data.theme : t))
        : [...state.themes, data.theme];

    await themeState.setValue({
      ...state,
      themes,
      activeThemeIds: state.activeThemeIds.includes(id)
        ? state.activeThemeIds
        : [...state.activeThemeIds, id],
    });
  });

  onMessage('removeTheme', async ({ data }) => {
    const state = await themeState.getValue();
    await themeState.setValue({
      ...state,
      themes: state.themes.filter((t) => getThemeId(t) !== data.themeId),
      activeThemeIds: state.activeThemeIds.filter((id) => id !== data.themeId),
    });
  });

  onMessage('setActiveThemes', async ({ data }) => {
    const state = await themeState.getValue();
    await themeState.setValue({ ...state, activeThemeIds: data.themeIds });
  });
});
