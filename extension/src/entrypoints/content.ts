import { themeState, extensionEnabled } from '@/utils/storage';
import { buildThemeCSS, injectCSS, removeInjectedCSS, getCurrentPagePath } from '@/utils/engine';
import { getThemeId } from '@/utils/types';
import { onMessage } from '@/utils/messaging';

export default defineContentScript({
  matches: ['*://*.kagi.com/*'],
  runAt: 'document_start',

  async main() {
    const applyThemes = async () => {
      const enabled = await extensionEnabled.getValue();
      if (!enabled) {
        removeInjectedCSS();
        return;
      }

      const state = await themeState.getValue();
      const activeThemes = state.themes.filter((t) =>
        state.activeThemeIds.includes(getThemeId(t)),
      );

      const pagePath = getCurrentPagePath();
      const css = buildThemeCSS(activeThemes, pagePath);
      injectCSS(css);
    };

    await applyThemes();

    themeState.watch(() => applyThemes());
    extensionEnabled.watch(() => applyThemes());

    onMessage('reloadThemes', () => {
      applyThemes();
    });

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-path'
        ) {
          applyThemes();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-path', 'class'],
    });
  },
});
