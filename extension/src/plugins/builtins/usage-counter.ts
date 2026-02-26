import { definePlugin } from "../api";

const FILTER_PANEL = "._0_filters-panel";
const WIDGET_ID = "corgi-usage-counter";
const CACHE_KEY = "corgi:billing";
const CACHE_TTL = 5 * 60 * 1000;

interface BillingEntry {
  label: string;
  used: number;
  limit: number;
}

interface BillingData {
  account: string;
  entries: BillingEntry[];
  ts: number;
}

function parseBillingHTML(html: string): BillingData | null {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const account =
    doc.querySelector(".billing_box_title span")?.textContent?.trim() ?? "";

  const boxes = doc.querySelectorAll(".billing_box_count_box");
  if (boxes.length === 0) return null;

  const entries: BillingEntry[] = [];
  for (const box of boxes) {
    const label =
      box.querySelector(".billing_box_count_title")?.textContent?.trim() ?? "";
    const raw =
      box.querySelector(".billing_box_count_num")?.textContent?.trim() ?? "";
    const match = raw.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (!match) continue;
    entries.push({
      label,
      used: Number(match[1]),
      limit: Number(match[2]),
    });
  }

  return entries.length > 0 ? { account, entries, ts: Date.now() } : null;
}

function readCache(): BillingData | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as BillingData;
    if (Date.now() - data.ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data: BillingData): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // storage full or disabled
  }
}

async function fetchBillingData(): Promise<BillingData | null> {
  const cached = readCache();
  if (cached) return cached;

  try {
    const resp = await fetch("/settings/billing", {
      credentials: "same-origin",
      headers: { Accept: "text/html" },
    });
    if (!resp.ok) return null;

    const html = await resp.text();
    const data = parseBillingHTML(html);
    if (data) writeCache(data);
    return data;
  } catch {
    return null;
  }
}

function findSearchEntry(data: BillingData): BillingEntry | null {
  return (
    data.entries.find((e) => /search/i.test(e.label)) ?? data.entries[0] ?? null
  );
}

function buildWidget(data: BillingData): HTMLElement {
  const el = document.createElement("div");
  el.id = WIDGET_ID;

  const search = findSearchEntry(data);
  if (!search) return el;

  const remaining = search.limit - search.used;
  const pct = Math.min(Math.round((remaining / search.limit) * 100), 100);

  el.innerHTML =
    `<div class="corgi-usage-bar">` +
    `<div class="corgi-usage-fill" style="width:${pct}%"></div>` +
    `</div>` +
    `<span class="corgi-usage-text">${remaining}/${search.limit} searches left</span>`;

  return el;
}

function updateWidget(data: BillingData): void {
  const existing = document.getElementById(WIDGET_ID);
  if (!existing) return;

  const search = findSearchEntry(data);
  if (!search) return;

  const remaining = search.limit - search.used;
  const pct = Math.min(Math.round((remaining / search.limit) * 100), 100);

  const fill = existing.querySelector<HTMLElement>(".corgi-usage-fill");
  const text = existing.querySelector(".corgi-usage-text");

  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${remaining}/${search.limit} searches left`;
}

export const usageCounterPlugin = definePlugin({
  name: "usage-counter",
  displayName: "Usage Counter",
  version: "0.2.0",
  authors: ["aluminyoom"],
  description: "Displays account usage stats below the filter bar",

  css: `
    #${WIDGET_ID} {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      margin: 4px 0 0;
      font-size: 12px;
      color: color-mix(in srgb, currentColor 60%, transparent);
    }
    .corgi-usage-bar {
      width: 120px;
      height: 4px;
      border-radius: 2px;
      background: color-mix(in srgb, currentColor 15%, transparent);
      overflow: hidden;
      flex-shrink: 0;
    }
    .corgi-usage-fill {
      height: 100%;
      border-radius: 2px;
      background: var(--yellow, var(--primary, currentColor));
      transition: width 0.3s ease;
    }
    .corgi-usage-text {
      white-space: nowrap;
    }
  `,

  onStart(api) {
    let mounted = false;

    async function tryInject(): Promise<void> {
      if (mounted || document.getElementById(WIDGET_ID)) return;

      const panel = document.querySelector(FILTER_PANEL);
      if (!panel) return;

      const data = await fetchBillingData();
      if (!data || !findSearchEntry(data)) return;

      panel.after(buildWidget(data));
      mounted = true;
    }

    tryInject();

    const cleanup = api.observeElement(
      FILTER_PANEL,
      () => {
        if (!mounted) tryInject();
      },
      { childList: true, subtree: false },
    );

    api.onProviderEvent("free_search_remaining", (payload: unknown) => {
      const remaining = Number(payload);
      if (!Number.isFinite(remaining)) return;

      const cached = readCache();
      if (cached) {
        const search = findSearchEntry(cached);
        if (search) {
          search.used = search.limit - remaining;
          writeCache(cached);
          if (mounted) updateWidget(cached);
          else tryInject();
        }
      }
    });

    return () => {
      cleanup();
      document.getElementById(WIDGET_ID)?.remove();
      mounted = false;
    };
  },
});
