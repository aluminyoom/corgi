import { definePlugin } from '../api';

export const searchCounterPlugin = definePlugin({
  name: 'search-counter',
  version: '0.1.0',
  author: 'kagistry',
  description: 'Shows a live count of search results on the page',

  css: `
    .kagistry-result-counter {
      position: fixed;
      bottom: 16px;
      right: 16px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-family: var(--font-mono, monospace);
      background: var(--app-frame-bg, rgba(0, 0, 0, 0.7));
      color: var(--app-text, #fff);
      border: 1px solid var(--border-color, rgba(128, 128, 128, 0.2));
      z-index: 9999;
      pointer-events: none;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
  `,

  onStart(api) {
    let counter: HTMLElement | null = null;

    function updateCount(): void {
      const results = document.querySelectorAll('.search-result, .__srgi');
      if (!counter) return;

      if (results.length > 0) {
        counter.textContent = `${results.length} results`;
        counter.style.display = 'block';
      } else {
        counter.style.display = 'none';
      }
    }

    counter = document.createElement('div');
    counter.className = 'kagistry-result-counter';
    counter.style.display = 'none';
    document.body.appendChild(counter);

    const cleanup = api.observeElement('body', () => updateCount(), {
      childList: true,
      subtree: true,
    });

    api.onProviderEvent('search', () => {
      requestAnimationFrame(updateCount);
    });

    updateCount();

    return () => {
      cleanup();
      counter?.remove();
    };
  },
});
