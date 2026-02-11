import { definePlugin } from '../../api';

const CATEGORY_HREFS: Record<string, string> = {
  '/settings/search': 'Search',
  '/settings/billing': 'Billing',
};

const SUB_CLASSES = ['nav-link-sub', 'ml-20', 'my-8', 'py-2', 'px-8'];
const TOP_CLASSES = ['nav-link', 'py-8', 'px-10', 'mx-n10', 'rounded-full', 'corgi-promoted-sub'];

function transformNavCategories(): (() => void) | undefined {
  const menu = document.querySelector('.cth_settings_nav_menu');
  if (!menu) return;

  const originals = new Map<HTMLElement, { className: string; innerHTML: string; href: string }>();

  for (const [href, label] of Object.entries(CATEGORY_HREFS)) {
    const categoryLink = menu.querySelector<HTMLAnchorElement>(`a.nav-link[href="${href}"]`);
    if (!categoryLink) continue;

    originals.set(categoryLink, {
      className: categoryLink.className,
      innerHTML: categoryLink.innerHTML,
      href: categoryLink.getAttribute('href') ?? href,
    });

    const heading = document.createElement('div');
    heading.className = 'corgi-nav-category';
    heading.textContent = label;
    heading.dataset.corgiCategory = href;

    const separator = document.createElement('hr');
    separator.className = 'corgi-nav-separator';

    categoryLink.replaceWith(separator, heading);

    let sibling = heading.nextElementSibling;
    while (sibling && sibling.classList.contains('nav-link-sub')) {
      for (const cls of SUB_CLASSES) sibling.classList.remove(cls);
      for (const cls of TOP_CLASSES) sibling.classList.add(cls);
      sibling = sibling.nextElementSibling;
    }
  }

  return () => {
    for (const sep of menu.querySelectorAll<HTMLElement>('.corgi-nav-separator')) {
      sep.remove();
    }

    for (const heading of menu.querySelectorAll<HTMLElement>('.corgi-nav-category')) {
      const href = heading.dataset.corgiCategory;
      if (!href) continue;

      const link = document.createElement('a');
      const original = [...originals.entries()].find(([, v]) => v.href === href);
      if (original) {
        link.className = original[1].className;
        link.innerHTML = original[1].innerHTML;
        link.href = original[1].href;
      }
      heading.replaceWith(link);
    }

    for (const promoted of menu.querySelectorAll<HTMLElement>('.corgi-promoted-sub')) {
      for (const cls of TOP_CLASSES) promoted.classList.remove(cls);
      for (const cls of SUB_CLASSES) promoted.classList.add(cls);
    }
  };
}

export const sidebarCategoriesPlugin = definePlugin({
  name: 'corgi-polish/sidebar-categories',
  version: '0.1.0',
  author: 'corgi',
  description: 'Displays Search and Billing as category headings with sub-items promoted to top-level styling',

  css: `
    .corgi-nav-category {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: color-mix(in srgb, currentColor 50%, transparent);
      padding: 8px 0 4px;
      user-select: none;
      pointer-events: none;
    }

    .corgi-nav-separator {
      margin: 8px 0;
    }

    .cth_settings_nav_menu a[href="/logout"] {
      color: var(--color-danger, #e53935) !important;
    }

    .cth_settings_nav_menu a[href="/logout"] i,
    .cth_settings_nav_menu a[href="/logout"] svg {
      color: inherit !important;
    }
  `,

  onStart() {
    return transformNavCategories();
  },
});
