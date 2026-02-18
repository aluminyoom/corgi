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
const OVERFLOW_ATTR = 'data-corgi-logo-overflow';

/**
 * Apply the custom logo. Returns true if the DOM elements were found
 * (regardless of whether a custom image was set).
 */
function applyLogo(settings: LogoSettings): boolean {
  const src = settings.file || settings.url;
  const clouds = document.querySelector<HTMLElement>(CLOUDS_SELECTOR);
  const logoDiv = document.querySelector<HTMLElement>(LOGO_SELECTOR);

  if (!clouds || !logoDiv) return false;

  const existing = document.getElementById(LOGO_ELEMENT_ID);

  // always hide siblings of .logo inside .clouds (e.g. .doggo_sit_a)
  for (const child of clouds.children) {
    const el = child as HTMLElement;
    if (!el.classList.contains('logo')) {
      el.style.display = 'none';
      el.setAttribute(HIDDEN_ATTR, '');
    }
  }

  // clip .logo so the custom image never bleeds into the search bar
  if (!logoDiv.hasAttribute(OVERFLOW_ATTR)) {
    logoDiv.style.overflow = 'hidden';
    logoDiv.setAttribute(OVERFLOW_ATTR, '');
  }

  // no custom image — remove any leftover img but keep siblings hidden
  if (!src) {
    if (existing) existing.remove();
    return true;
  }

  // hide original logo content inside .logo (e.g. the Kagi SVG)
  for (const child of logoDiv.children) {
    const el = child as HTMLElement;
    if (el.id !== LOGO_ELEMENT_ID) {
      el.style.display = 'none';
      el.setAttribute(HIDDEN_ATTR, '');
    }
  }

  let img = existing as HTMLImageElement | null;
  if (!img) {
    img = document.createElement('img');
    img.id = LOGO_ELEMENT_ID;
    logoDiv.appendChild(img);
  }

  img.src = src;
  // constrain to .logo container — object-fit keeps aspect ratio,
  // max-width/max-height let users shrink below container size
  img.style.cssText = [
    'display: block',
    'margin: 0 auto',
    'width: auto',
    'height: auto',
    'max-width: 100%',
    'max-height: 100%',
    'object-fit: contain',
  ].join(';');

  // user overrides — only apply if they differ from defaults so the
  // 100% container constraint still works as the baseline
  const userW = settings.maxWidth || DEFAULTS.maxWidth;
  const userH = settings.maxHeight || DEFAULTS.maxHeight;
  if (userW !== '100%') img.style.maxWidth = userW;
  if (userH !== '100%') img.style.maxHeight = userH;

  return true;
}

function restoreLogo(): void {
  const img = document.getElementById(LOGO_ELEMENT_ID);
  if (img) img.remove();

  for (const el of document.querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}]`)) {
    el.style.display = '';
    el.removeAttribute(HIDDEN_ATTR);
  }

  for (const el of document.querySelectorAll<HTMLElement>(`[${OVERFLOW_ATTR}]`)) {
    el.style.overflow = '';
    el.removeAttribute(OVERFLOW_ATTR);
  }
}

export const customLogoPlugin = definePlugin({
  name: 'custom-logo',
  displayName: 'Custom Logo',
  version: '0.2.0',
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

    let settled = false;
    let cachedSettings: LogoSettings = { ...DEFAULTS };

    async function loadAndApply(): Promise<void> {
      const stored = await api.getSettings<Partial<LogoSettings>>();
      cachedSettings = { ...DEFAULTS, ...stored };
      settled = applyLogo(cachedSettings);
    }

    loadAndApply();

    // re-apply whenever .logo DOM changes (e.g. Kagi re-renders the landing)
    const cleanup = api.observeElement(LOGO_SELECTOR, () => {
      // always re-apply — DOM may have been replaced by Kagi
      if (settled) {
        applyLogo(cachedSettings);
      } else {
        loadAndApply();
      }
    }, { childList: true, subtree: true });

    return () => {
      cleanup();
      restoreLogo();
    };
  },
});
