import type { Theme } from './types';

const STYLE_ELEMENT_ID = 'corgi-theme-styles';

export function buildThemeCSS(themes: Theme[], pagePath: string | null): string {
  const parts: string[] = [];

  for (const theme of themes) {
    const globalVars = theme.variables;
    const pageOverride = pagePath ? theme.pages?.[pagePath] : undefined;
    const mergedVars = { ...globalVars, ...pageOverride?.variables };

    if (Object.keys(mergedVars).length > 0) {
      const varDeclarations = Object.entries(mergedVars)
        .map(([key, value]) => `  ${key}: ${value} !important;`)
        .join('\n');
      parts.push(`:root {\n${varDeclarations}\n}`);
    }

    if (theme.css) {
      parts.push(theme.css);
    }

    if (pageOverride?.css) {
      parts.push(pageOverride.css);
    }
  }

  return parts.join('\n\n');
}

export function injectCSS(css: string): void {
  let styleEl = document.getElementById(STYLE_ELEMENT_ID);

  if (!css) {
    styleEl?.remove();
    return;
  }

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID;
    styleEl.setAttribute('data-corgi', 'true');
    (document.head ?? document.documentElement).appendChild(styleEl);
  }

  styleEl.textContent = css;
}

export function removeInjectedCSS(): void {
  document.getElementById(STYLE_ELEMENT_ID)?.remove();
}

export function getCurrentPagePath(): string | null {
  return document.documentElement.getAttribute('data-path');
}

export function getCurrentKagiTheme(): string | null {
  const classes = document.documentElement.classList;
  const themeClasses = ['theme_dark', 'theme_light', 'theme_calm_blue', 'theme_moon_dark'];
  for (const cls of themeClasses) {
    if (classes.contains(cls)) return cls;
  }
  return null;
}
