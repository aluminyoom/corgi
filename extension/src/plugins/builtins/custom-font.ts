import { definePlugin } from '../api';

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

function applyFont(settings: FontSettings): void {
  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  const fontName = settings.fontName.trim();

  if (!fontName) {
    styleEl?.remove();
    return;
  }

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    (document.head ?? document.documentElement).appendChild(styleEl);
  }

  const importUrl = buildFontUrl(settings);
  const importRule = importUrl ? `@import url("${importUrl}");` : '';

  styleEl.textContent = `
    ${importRule}

    body, p, div, span, a, li, td, th,
    h1, h2, h3, h4, h5, h6,
    input, textarea, button, select, label,
    article, section, main, header, footer, nav, aside {
      font-family: '${fontName}', sans-serif !important;
    }
  `;
}

export const customFontPlugin = definePlugin({
  name: 'custom-font',
  displayName: 'Custom Font',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Override Kagi\'s font with a Google Font or any web font',
  defaultEnabled: false,

  settings: [
    { key: 'fontName', label: 'Font name (e.g. Inter, Fira Code, JetBrains Mono)', type: 'string', default: '' },
    { key: 'fontUrl', label: 'Custom font CSS URL (optional, overrides auto Google Fonts URL)', type: 'string', default: '' },
  ],

  onStart(api) {
    async function loadAndApply(): Promise<void> {
      const stored = await api.getSettings<Partial<FontSettings>>();
      const settings = { ...DEFAULTS, ...stored };
      applyFont(settings);
    }

    loadAndApply();

    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  },
});
