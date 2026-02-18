import { definePlugin } from '../api';

const CLOUDS_SELECTOR = '.clouds';
const LOGO_SELECTOR = '.clouds .logo';

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
const HIDDEN_ATTR = 'data-corgi-logo-hidden';

function applyLogo(settings: LogoSettings): void {
  const src = settings.file || settings.url;
  const clouds = document.querySelector<HTMLElement>(CLOUDS_SELECTOR);
  const logoDiv = document.querySelector<HTMLElement>(LOGO_SELECTOR);
  const existing = document.getElementById(LOGO_ELEMENT_ID);

  // always hide siblings of .logo inside .clouds (e.g. .doggo_sit_a)
  if (clouds) {
    for (const child of clouds.children) {
      const el = child as HTMLElement;
      if (!el.classList.contains('logo')) {
        el.style.display = 'none';
        el.setAttribute(HIDDEN_ATTR, '');
      }
    }
  }

  // no custom image — remove any leftover img but keep siblings hidden
  if (!src) {
    if (existing) existing.remove();
    return;
  }

  // hide original logo content inside .logo
  if (logoDiv) {
    for (const child of logoDiv.children) {
      const el = child as HTMLElement;
      if (el.id !== LOGO_ELEMENT_ID) {
        el.style.display = 'none';
        el.setAttribute(HIDDEN_ATTR, '');
      }
    }
  }

  let img = existing as HTMLImageElement | null;
  if (!img) {
    img = document.createElement('img');
    img.id = LOGO_ELEMENT_ID;
    img.style.cssText = 'display: block; margin: 0 auto;';
    logoDiv?.appendChild(img);
  }

  img.src = src;
  img.style.maxWidth = settings.maxWidth || '200px';
  img.style.maxHeight = settings.maxHeight || '200px';
}

function restoreLogo(): void {
  const img = document.getElementById(LOGO_ELEMENT_ID);
  if (img) img.remove();

  for (const el of document.querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}]`)) {
    el.style.display = '';
    el.removeAttribute(HIDDEN_ATTR);
  }
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

    const cleanup = api.observeElement(LOGO_SELECTOR, () => {
      if (!applied) loadAndApply();
    }, { childList: true });

    return () => {
      cleanup();
      restoreLogo();
    };
  },
});
