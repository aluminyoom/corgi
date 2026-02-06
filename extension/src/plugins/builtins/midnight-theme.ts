import type { Theme } from '@/utils/types';

export const midnightTheme: Theme = {
  name: 'Midnight',
  version: '1.0.0',
  author: 'kagistry',
  description: 'A deep dark theme with purple accents for late night searching',
  tags: ['dark', 'purple', 'minimal'],
  variables: {
    '--app-bg': '#0d0d1a',
    '--app-text': '#e0e0e0',
    '--app-frame-bg': '#121225',
    '--primary': '#8b5cf6',
    '--primary-hover': '#7c3aed',
    '--link': '#a78bfa',
    '--input-bg': '#1a1a2e',
    '--hover-bg': 'rgba(139, 92, 246, 0.08)',
    '--search-result-title': '#c4b5fd',
    '--color-search-input': '#e0e0e0',
    '--color-search-input-border': '#2d2d4a',
  },
  css: '',
  meta: {
    kagiThemes: ['dark'],
  },
};
