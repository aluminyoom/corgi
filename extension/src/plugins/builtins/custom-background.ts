import { definePlugin } from '../api';

interface BackgroundSettings {
  url: string;
  file: string;
  size: string;
  position: string;
  opacity: string;
}

const DEFAULTS: BackgroundSettings = {
  url: '',
  file: '',
  size: 'cover',
  position: 'center',
  opacity: '1',
};

const STYLE_ID = 'corgi-custom-bg-style';

function applyBackground(settings: BackgroundSettings): void {
  const src = settings.file || settings.url;
  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;

  if (!src) {
    styleEl?.remove();
    return;
  }

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    (document.head ?? document.documentElement).appendChild(styleEl);
  }

  // use body::before pseudo-element so we can control opacity independently
  // without affecting body content — also clears kagi's own body/html background
  const cssUrl = src.replace(/"/g, '\\"');
  styleEl.textContent = `
    [data-path="/landing"] body {
      background: transparent !important;
      position: relative;
    }
    [data-path="/landing"] html {
      background: transparent !important;
    }
    [data-path="/landing"] body::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background-image: url("${cssUrl}");
      background-size: ${settings.size};
      background-position: ${settings.position};
      background-repeat: no-repeat;
      opacity: ${settings.opacity};
    }
    [data-path="/landing"] footer {
      background: transparent !important;
    }
  `;
}

export const customBackgroundPlugin = definePlugin({
  name: 'custom-background',
  displayName: 'Custom Background',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Set a custom background image for the landing page (URL or file upload)',

  settings: [
    { key: 'url', label: 'Background image URL', type: 'string', default: '' },
    { key: 'file', label: 'Or upload a background image', type: 'file', default: '', accept: 'image/*' },
    {
      key: 'size',
      label: 'Background size',
      type: 'select',
      default: 'cover',
      options: [
        { label: 'Cover', value: 'cover' },
        { label: 'Contain', value: 'contain' },
        { label: 'Auto', value: 'auto' },
      ],
    },
    {
      key: 'position',
      label: 'Background position',
      type: 'select',
      default: 'center',
      options: [
        { label: 'Center', value: 'center' },
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
      ],
    },
    { key: 'opacity', label: 'Opacity (0-1)', type: 'string', default: '1' },
  ],

  onStart(api) {
    const pagePath = document.documentElement.getAttribute('data-path');
    if (pagePath !== '/landing') return;

    async function loadAndApply(): Promise<void> {
      const stored = await api.getSettings<Partial<BackgroundSettings>>();
      const settings = { ...DEFAULTS, ...stored };
      applyBackground(settings);
    }

    loadAndApply();

    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  },
});
