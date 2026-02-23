import { definePlugin } from '../api';

const SCRAMBLED_ATTR = 'data-corgi-scrambled';

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function scrambleResults(): void {
  const containers = document.querySelectorAll<HTMLElement>('._0_main-search-results');
  for (const container of containers) {
    if (container.hasAttribute(SCRAMBLED_ATTR)) continue;
    container.setAttribute(SCRAMBLED_ATTR, '');

    const results = Array.from(
      container.querySelectorAll<HTMLElement>(':scope > .search-result, :scope > .sri-group'),
    );
    if (results.length < 2) continue;

    shuffleArray(results);
    for (const result of results) {
      container.appendChild(result);
    }
  }
}

export const resultScramblerPlugin = definePlugin({
  name: 'result-scrambler',
  displayName: 'Result Scrambler',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Randomize search result order for serendipitous discovery',
  defaultEnabled: false,

  onStart(api) {
    const pagePath = document.documentElement.getAttribute('data-path');
    if (pagePath !== '/search') return;

    scrambleResults();

    const cleanup = api.observeElement('.center-content-box', () => {
      scrambleResults();
    }, { childList: true, subtree: true });

    return () => {
      cleanup();
    };
  },
});
