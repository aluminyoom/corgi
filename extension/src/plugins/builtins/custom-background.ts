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

const BG_ELEMENT_ID = 'corgi-custom-bg';

function applyBackground(settings: BackgroundSettings): void {
  const src = settings.file || settings.url;
  let bgEl = document.getElementById(BG_ELEMENT_ID);

  if (!src) {
    bgEl?.remove();
    return;
  }

  if (!bgEl) {
    bgEl = document.createElement('div');
    bgEl.id = BG_ELEMENT_ID;
    document.body.prepend(bgEl);
  }

  bgEl.style.cssText = [
    'position: fixed',
    'inset: 0',
    'z-index: -1',
    'pointer-events: none',
    `background-image: url(${CSS.escape ? `"${src}"` : `"${src}"`})`,
    `background-size: ${settings.size}`,
    `background-position: ${settings.position}`,
    'background-repeat: no-repeat',
    `opacity: ${settings.opacity}`,
  ].join('; ');
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

  css: `
    [data-path="/landing"] #${BG_ELEMENT_ID} ~ footer {
      background: transparent !important;
    }
  `,

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
      document.getElementById(BG_ELEMENT_ID)?.remove();
    };
  },
});
