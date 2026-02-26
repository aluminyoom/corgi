import { definePlugin } from "../api";
import type { PluginAPI } from "../types";

function shuffleArray<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function scrambleResults(api: PluginAPI): void {
  const containers = document.querySelectorAll<HTMLElement>(
    "._0_main-search-results",
  );
  for (const container of containers) {
    if (api.isProcessed(container, "processed")) continue;
    api.markProcessed(container, "processed");

    const results = Array.from(
      container.querySelectorAll<HTMLElement>(
        ":scope > .search-result, :scope > .sri-group",
      ),
    );
    if (results.length < 2) continue;

    shuffleArray(results);
    for (const result of results) {
      container.appendChild(result);
    }
  }
}

export const resultScramblerPlugin = definePlugin({
  name: "result-scrambler",
  displayName: "Result Scrambler",
  version: "0.2.0",
  authors: ["aluminyoom"],
  description: "Randomize search result order for serendipitous discovery",
  defaultEnabled: false,

  onStart(api) {
    if (!api.isPage("/search")) return;

    scrambleResults(api);

    const cleanup = api.observeElement(
      ".center-content-box",
      () => {
        scrambleResults(api);
      },
      { childList: true, subtree: true },
    );

    return () => {
      cleanup();
    };
  },
});
