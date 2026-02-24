import { definePlugin } from '../api';

const LANDING_INPUT = '[data-path="/landing"] .search-input';
const CATEGORY_SELECTOR = '.landing-category-select';
const ACTIVE_CLASS = '--active';

const CATEGORY_MAP: Record<string, string> = {
  n_se: 'all',
  n_im: 'images',
  n_vi: 'videos',
  n_ne: 'news',
  n_ma: 'maps',
};

function getActiveCategory(): string {
  const active = document.querySelector(`${CATEGORY_SELECTOR} .${ACTIVE_CLASS}`);
  if (!active) return 'all';

  for (const [cls, name] of Object.entries(CATEGORY_MAP)) {
    if (active.classList.contains(cls)) return name;
  }
  return 'all';
}

type PlaceholderSettings = {
  global: string;
  all: string;
  images: string;
  videos: string;
  news: string;
  maps: string;
};

const DEFAULTS: PlaceholderSettings = {
  global: '',
  all: '',
  images: '',
  videos: '',
  news: '',
  maps: '',
};

function applyPlaceholder(settings: PlaceholderSettings): void {
  const input = document.querySelector<HTMLInputElement>(LANDING_INPUT);
  if (!input) return;

  const category = getActiveCategory();
  const categoryText = settings[category as keyof PlaceholderSettings];
  const text = categoryText || settings.global;

  if (text) {
    input.placeholder = text;
  }
}

export const customPlaceholderPlugin = definePlugin({
  name: 'custom-placeholder',
  displayName: 'Custom Placeholder',
  version: '0.2.0',
  authors: ['aluminyoom'],
  description: 'Customize the landing page search placeholder text, globally or per category',

  settings: [
    { key: 'global', label: 'Global placeholder (used when no category-specific text is set)', type: 'string', default: '' },
    { key: 'all', label: 'Search (All) placeholder', type: 'string', default: '' },
    { key: 'images', label: 'Images placeholder', type: 'string', default: '' },
    { key: 'videos', label: 'Videos placeholder', type: 'string', default: '' },
    { key: 'news', label: 'News placeholder', type: 'string', default: '' },
    { key: 'maps', label: 'Maps placeholder', type: 'string', default: '' },
  ],

  onStart(api) {
    if (!api.isPage('/landing')) return;

    let settings: PlaceholderSettings = { ...DEFAULTS };

    async function loadAndApply(): Promise<void> {
      settings = await api.loadSettings(DEFAULTS);
      applyPlaceholder(settings);
    }

    loadAndApply();

    const cleanup = api.observeElement(CATEGORY_SELECTOR, () => {
      applyPlaceholder(settings);
    }, { attributes: true, subtree: true, attributeFilter: ['class'] });

    const clickHandler = (e: Event): void => {
      const target = e.target as HTMLElement;
      if (target.closest?.(CATEGORY_SELECTOR)) {
        setTimeout(() => applyPlaceholder(settings), 50);
      }
    };
    document.addEventListener('click', clickHandler, true);

    return () => {
      cleanup();
      document.removeEventListener('click', clickHandler, true);
    };
  },
});
