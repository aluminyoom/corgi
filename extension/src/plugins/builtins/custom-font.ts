import { definePlugin } from '../api';
import type { PluginAPI } from '../types';

const STYLE_ID = 'corgi-custom-font-style';

interface FontSettings {
  fontName: string;
  fontUrl: string;
}

const DEFAULTS: FontSettings = {
  fontName: '',
  fontUrl: '',
};

function buildFontUrl(settings: FontSettings): string {
  if (settings.fontUrl) return settings.fontUrl;
  if (!settings.fontName) return '';
  const encoded = encodeURIComponent(settings.fontName);
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;500;600;700&display=swap`;
}

function applyFont(api: PluginAPI, settings: FontSettings): void {
  const fontName = settings.fontName.trim();

  if (!fontName) {
    api.removeStyle(STYLE_ID);
    return;
  }

  const importUrl = buildFontUrl(settings);
  const importRule = importUrl ? `@import url("${importUrl}");` : '';

  api.injectStyle(STYLE_ID, `
    ${importRule}

    body, p, div, span, a, li, td, th,
    h1, h2, h3, h4, h5, h6,
    input, textarea, button, select, label,
    article, section, main, header, footer, nav, aside {
      font-family: '${fontName}', sans-serif !important;
    }
  `);
}

export const customFontPlugin = definePlugin({
  name: 'custom-font',
  displayName: 'Custom Font',
  version: '0.2.0',
  authors: ['aluminyoom'],
  description: 'Override Kagi\'s font with a Google Font or any web font',
  defaultEnabled: false,

  settings: [
    { key: 'fontName', label: 'Font name (e.g. Inter, Fira Code, JetBrains Mono)', type: 'string', default: '' },
    { key: 'fontUrl', label: 'Custom font CSS URL (optional, overrides auto Google Fonts URL)', type: 'string', default: '' },
  ],

  onStart(api) {
    async function loadAndApply(): Promise<void> {
      const settings = await api.loadSettings(DEFAULTS);
      applyFont(api, settings);
    }

    loadAndApply();
  },
});
