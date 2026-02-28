import { definePlugin } from "../api";

const LOAD_MORE_SELECTOR = "#load_more_results";
const SCROLL_THRESHOLD = 600;
const DEBOUNCE_MS = 300;

export const infiniteScrollPlugin = definePlugin({
  name: "infinite-scroll",
  displayName: "Infinite Scroll",
  version: "0.2.0",
  authors: ["aluminyoom"],
  description:
    "Automatically loads more results as you scroll down the search page",
  defaultEnabled: false,

  css: `
    .footer-search-results ${LOAD_MORE_SELECTOR} {
      display: none !important;
    }
  `,

  onStart(api) {
    if (!api.isPage("/search")) return;

    let loading = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function tryLoadMore(): void {
      if (loading) return;

      const btn = document.querySelector<HTMLButtonElement>(LOAD_MORE_SELECTOR);
      if (!btn || btn.hidden) return;

      const distanceToBottom =
        document.documentElement.scrollHeight -
        window.scrollY -
        window.innerHeight;

      if (distanceToBottom > SCROLL_THRESHOLD) return;

      loading = true;
      btn.click();

      const stopObserving = api.observeElement(
        "document",
        () => {
          loading = false;
          stopObserving();
        },
        { childList: true, subtree: true },
      );

      setTimeout(() => {
        loading = false;
        stopObserving();
      }, 5_000);
    }

    function onScroll(): void {
      if (timer) clearTimeout(timer);
      timer = setTimeout(tryLoadMore, DEBOUNCE_MS);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  },
});
