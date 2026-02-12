import type { Theme } from '@/utils/types';
import { getThemeId } from '@/utils/types';

const CONTAINER_TAG = 'corgi-styles';

let container: HTMLElement | null = null;

function getContainer(): HTMLElement {
  if (container && container.isConnected) return container;

  container = document.querySelector(CONTAINER_TAG);
  if (container) return container;

  container = document.createElement(CONTAINER_TAG);
  container.setAttribute('data-corgi', 'true');

  const target = document.head ?? document.documentElement;
  const firstLink = target.querySelector('link[rel="stylesheet"]');
  if (firstLink) {
    target.insertBefore(container, firstLink);
  } else {
    target.appendChild(container);
  }

  return container;
}

function buildThemeStyleId(index: number): string {
  return `corgi-theme-${index}`;
}

export function applyThemes(themes: Theme[], pagePath: string | null): void {
  const root = getContainer();

  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }

  for (let i = 0; i < themes.length; i++) {
    const theme = themes[i];
    const style = document.createElement('style');
    style.id = buildThemeStyleId(i);
    style.setAttribute('data-theme', getThemeId(theme));

    const parts: string[] = [];

    const pageOverride = pagePath ? theme.pages?.[pagePath] : undefined;
    const mergedVars = { ...theme.variables, ...pageOverride?.variables };

    if (Object.keys(mergedVars).length > 0) {
      const declarations = Object.entries(mergedVars)
        .map(([key, value]) => `  ${key}: ${value} !important;`)
        .join('\n');
      parts.push(`:root {\n${declarations}\n}`);
    }

    if (theme.css) parts.push(theme.css);
    if (pageOverride?.css) parts.push(pageOverride.css);

    style.textContent = parts.join('\n\n');
    root.appendChild(style);
  }
}

export function clearThemes(): void {
  if (container && container.isConnected) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
}

export function removeContainer(): void {
  container?.remove();
  container = null;
}

export function interceptKagiStylesheets(): () => void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLLinkElement)) continue;
        if (node.rel !== 'stylesheet') continue;
        const href = node.getAttribute('href') ?? '';
        if (href.includes('/_s/custom_css')) {
          // Kagi's built-in custom CSS link. We can optionally disable it
          // when Corgi is managing styles, or leave it for composability.
        }
      }
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  return () => observer.disconnect();
}
