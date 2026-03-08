import { definePlugin } from "../api";
import type { PluginAPI } from "../types";

function rewriteUrls(api: PluginAPI): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(".__sri-url");
  for (const link of links) {
    if (api.isProcessed(link, "processed")) continue;
    api.markProcessed(link, "processed");

    const pathBox = link.querySelector<HTMLElement>(".__sri_url_path_box");
    if (!pathBox || !link.href) continue;

    try {
      const url = new URL(link.href);
      const display =
        url.hostname + decodeURIComponent(url.pathname).replace(/\/$/, "");
      pathBox.textContent = display;
    } catch (error) {
      /* malformed URL, leave as-is */
      console.debug("[corgi] URL parse error (non-fatal):", error);
    }
  }
}

function restoreUrls(api: PluginAPI): void {
  api.clearProcessed("processed");
}

export const rawUrlsPlugin = definePlugin({
  name: "raw-urls",
  displayName: "Raw URLs",
  version: "0.2.0",
  authors: ["aluminyoom"],
  description:
    "Show clean full URLs instead of the breadcrumb site › path › path format",
  defaultEnabled: false,

  onStart(api) {
    if (!api.isPage("/search")) return;

    rewriteUrls(api);

    const cleanup = api.observeElement(
      ".center-content-box",
      () => {
        rewriteUrls(api);
      },
      { childList: true, subtree: true },
    );

    return () => {
      cleanup();
      restoreUrls(api);
    };
  },
});
