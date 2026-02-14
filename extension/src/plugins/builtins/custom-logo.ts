import { definePlugin } from '../api';

const CLOUDS_LOGO_SELECTOR = '.clouds .logo';

interface LogoSettings {
  url: string;
  file: string;
  maxWidth: string;
  maxHeight: string;
}

const DEFAULTS: LogoSettings = {
  url: '',
  file: '',
  maxWidth: '200px',
  maxHeight: '200px',
};

const LOGO_ELEMENT_ID = 'corgi-custom-logo';

function applyLogo(settings: LogoSettings): void {
  const src = settings.file || settings.url;
  const logoContainer = document.querySelector<HTMLElement>(CLOUDS_LOGO_SELECTOR);

  const existing = document.getElementById(LOGO_ELEMENT_ID);

  if (!src) {
    if (existing) {
      existing.remove();
      if (logoContainer) {
        for (const child of logoContainer.children) {
          (child as HTMLElement).style.display = '';
        }
      }
    }
    return;
  }

  if (logoContainer) {
    for (const child of logoContainer.children) {
      if ((child as HTMLElement).id !== LOGO_ELEMENT_ID) {
        (child as HTMLElement).style.display = 'none';
      }
    }
  }

  let img = existing as HTMLImageElement | null;
  if (!img) {
    img = document.createElement('img');
    img.id = LOGO_ELEMENT_ID;
    img.style.cssText = 'display: block; margin: 0 auto;';

    if (logoContainer) {
      logoContainer.appendChild(img);
    }
  }

  img.src = src;
  img.style.maxWidth = settings.maxWidth || '200px';
  img.style.maxHeight = settings.maxHeight || '200px';
}

export const customLogoPlugin = definePlugin({
  name: 'custom-logo',
  displayName: 'Custom Logo',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Replace the landing page logo with a custom image (URL or file upload)',

  settings: [
    { key: 'url', label: 'Logo image URL', type: 'string', default: '' },
    { key: 'file', label: 'Or upload a logo image', type: 'file', default: '', accept: 'image/*' },
    { key: 'maxWidth', label: 'Max width (CSS value)', type: 'string', default: '200px' },
    { key: 'maxHeight', label: 'Max height (CSS value)', type: 'string', default: '200px' },
  ],

  onStart(api) {
    const pagePath = document.documentElement.getAttribute('data-path');
    if (pagePath !== '/landing') return;

    let applied = false;

    async function loadAndApply(): Promise<void> {
      const stored = await api.getSettings<Partial<LogoSettings>>();
      const settings = { ...DEFAULTS, ...stored };
      applyLogo(settings);
      applied = true;
    }

    loadAndApply();

    const cleanup = api.observeElement(CLOUDS_LOGO_SELECTOR, () => {
      if (!applied) loadAndApply();
    }, { childList: true });

    return () => {
      cleanup();
      const img = document.getElementById(LOGO_ELEMENT_ID);
      if (img) {
        img.remove();
        const logoContainer = document.querySelector<HTMLElement>(CLOUDS_LOGO_SELECTOR);
        if (logoContainer) {
          for (const child of logoContainer.children) {
            (child as HTMLElement).style.display = '';
          }
        }
      }
    };
  },
});
