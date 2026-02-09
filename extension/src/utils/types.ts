export interface Theme {
  name: string;
  version: string;
  author: string;
  description: string;
  tags: string[];
  variables: Record<string, string>;
  css: string;
  pages?: Record<string, { variables?: Record<string, string>; css?: string }>;
  meta?: {
    kagiThemes?: string[];
    minCorgiVersion?: string;
  };
}

export interface ThemeState {
  themes: Theme[];
  activeThemeIds: string[];
  enabled: boolean;
}

export type ThemeId = string;

export function getThemeId(theme: Theme): ThemeId {
  return `${theme.author}/${theme.name}`;
}
