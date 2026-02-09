import { definePlugin } from '../api';

const FILTER_PANEL = '._0_filters-panel';
const COUNTER_LABEL = '._0_search_counter_label';
const WIDGET_ID = 'kagistry-usage-counter';

function getSearchLimit(): number {
  const label = document.querySelector(COUNTER_LABEL) as HTMLElement | null;
  return Number(label?.dataset?.searchLimit) || 100;
}

function readCurrentRemaining(): number | null {
  const el = document.querySelector('._0_search_counter_num');
  if (!el || !el.textContent?.trim()) return null;
  const n = Number(el.textContent);
  return Number.isFinite(n) ? n : null;
}

function buildWidget(remaining: number, limit: number): HTMLElement {
  const pct = Math.min(Math.round((remaining / limit) * 100), 100);

  const el = document.createElement('div');
  el.id = WIDGET_ID;
  el.innerHTML =
    `<div class="kagistry-usage-bar">` +
    `<div class="kagistry-usage-fill" style="width:${pct}%"></div>` +
    `</div>` +
    `<span class="kagistry-usage-text">${remaining}/${limit} searches remaining</span>`;
  return el;
}

function updateWidget(remaining: number): void {
  const existing = document.getElementById(WIDGET_ID);
  if (!existing) return;

  const limit = getSearchLimit();
  const pct = Math.min(Math.round((remaining / limit) * 100), 100);

  const fill = existing.querySelector('.kagistry-usage-fill') as HTMLElement | null;
  const text = existing.querySelector('.kagistry-usage-text');

  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${remaining}/${limit} searches remaining`;
}

function inject(remaining: number | null): boolean {
  if (document.getElementById(WIDGET_ID)) return true;
  if (remaining === null) return false;

  const panel = document.querySelector(FILTER_PANEL);
  if (!panel) return false;

  const limit = getSearchLimit();
  panel.after(buildWidget(remaining, limit));
  return true;
}

export const usageCounterPlugin = definePlugin({
  name: 'usage-counter',
  version: '0.1.0',
  author: 'kagistry',
  description: 'Displays trial search usage after the filter bar',

  css: `
    #${WIDGET_ID} {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      margin: 4px 0 0;
      font-size: 12px;
      color: var(--search-result-sub, var(--app-text-2, #888));
    }
    .kagistry-usage-bar {
      width: 120px;
      height: 4px;
      border-radius: 2px;
      background: var(--border-color, rgba(128,128,128,0.2));
      overflow: hidden;
      flex-shrink: 0;
    }
    .kagistry-usage-fill {
      height: 100%;
      border-radius: 2px;
      background: var(--accent-color, var(--color-primary, #6366f1));
      transition: width 0.3s ease;
    }
    .kagistry-usage-text {
      white-space: nowrap;
    }
  `,

  onStart(api) {
    const cleanups: (() => void)[] = [];
    let injecting = false;

    function safeInject(): void {
      if (injecting) return;
      injecting = true;
      inject(readCurrentRemaining());
      injecting = false;
    }

    safeInject();

    cleanups.push(
      api.onProviderEvent('free_search_remaining', (payload: unknown) => {
        const remaining = Number(payload);
        if (!Number.isFinite(remaining)) return;

        if (!inject(remaining)) {
          updateWidget(remaining);
        } else {
          updateWidget(remaining);
        }
      }),
    );

    cleanups.push(
      api.observeElement(FILTER_PANEL, () => safeInject(), {
        childList: true,
        subtree: false,
      }),
    );

    return () => {
      for (const fn of cleanups) fn();
      document.getElementById(WIDGET_ID)?.remove();
    };
  },
});
