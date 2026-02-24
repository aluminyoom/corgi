import { definePlugin } from '../api';
import type { PluginAPI } from '../types';

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

function applyBackground(api: PluginAPI, settings: BackgroundSettings): void {
  const src = settings.file || settings.url;

  if (!src) {
    api.removeStyle(STYLE_ID);
    return;
  }

  const cssUrl = src.replace(/"/g, '\\"');
  api.injectStyle(STYLE_ID, `
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
  `);
}

export const customBackgroundPlugin = definePlugin({
  name: 'custom-background',
  displayName: 'Custom Background',
  version: '0.2.0',
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
    if (!api.isPage('/landing')) return;

    async function loadAndApply(): Promise<void> {
      const settings = await api.loadSettings(DEFAULTS);
      applyBackground(api, settings);
    }

    loadAndApply();
  },
});
