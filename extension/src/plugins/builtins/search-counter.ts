import { definePlugin } from '../api';

export const searchCounterPlugin = definePlugin({
  name: 'search-counter',
  version: '0.1.0',
  author: 'corgi',
  description: 'Shows a live count of search results on the page',

  css: `
    .corgi-result-counter {
      position: fixed;
      bottom: 16px;
      right: 16px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-family: var(--font-mono, monospace);
      background: var(--secondary, #fff);
      color: var(--primary, #181824);
      border: 1px solid color-mix(in srgb, currentColor 15%, transparent);
      box-shadow: 0 2px 8px color-mix(in srgb, currentColor 10%, transparent);
      z-index: 9999;
      pointer-events: none;
      opacity: 0.9;
      transition: opacity 0.2s;
    }
  `,

  onStart(api) {
    let counter: HTMLElement | null = null;
    let updating = false;

    function updateCount(): void {
      if (!counter || updating) return;
      updating = true;

      const results = document.querySelectorAll('.search-result, .__srgi');
      const text = results.length > 0 ? `${results.length} results` : '';
      const visible = results.length > 0;

      if (counter.textContent !== text) counter.textContent = text;
      const display = visible ? 'block' : 'none';
      if (counter.style.display !== display) counter.style.display = display;

      updating = false;
    }

    counter = document.createElement('div');
    counter.className = 'corgi-result-counter';
    counter.style.display = 'none';
    document.body.appendChild(counter);

    let rafId = 0;
    function scheduleUpdate(): void {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        updateCount();
      });
    }

    const resultContainer = document.querySelector('.search-result')?.parentElement ?? null;
    const observeTarget = resultContainer ? '.search-result' : 'body';
    const cleanup = api.observeElement(observeTarget, () => scheduleUpdate(), {
      childList: true,
      subtree: observeTarget === 'body',
    });

    api.onProviderEvent('search', () => scheduleUpdate());

    updateCount();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      cleanup();
      counter?.remove();
    };
  },
});
