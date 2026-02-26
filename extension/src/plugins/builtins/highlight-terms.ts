import { definePlugin } from "../api";
import type { PluginAPI } from "../types";
import { escapeRegex } from "@/utils/strings";

const SNIPPET_SELECTOR = ".__sri-desc";
const MARK_CLASS = "corgi-highlight";
const STYLE_ID = "corgi-highlight-terms-style";

const DEFAULT_COLOR = "#6366f1";

function buildHighlightCSS(color: string): string {
  return `
    .${MARK_CLASS} {
      background: color-mix(in srgb, ${color} 20%, transparent);
      color: inherit;
      border-radius: 2px;
      padding: 0 1px;
    }
  `;
}

function getSearchTerms(): string[] {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  return query
    .split(/\s+/)
    .map((t) => t.replace(/^["']|["']$/g, "").trim())
    .filter((t) => t.length >= 2);
}

function highlightSnippets(api: PluginAPI, terms: string[]): void {
  if (!terms.length) return;

  const pattern = new RegExp(`(${terms.map(escapeRegex).join("|")})`, "gi");

  const snippets = document.querySelectorAll<HTMLElement>(SNIPPET_SELECTOR);
  for (const snippet of snippets) {
    if (api.isProcessed(snippet, "highlighted")) continue;
    api.markProcessed(snippet, "highlighted");

    const walker = document.createTreeWalker(snippet, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      if (node.nodeValue && pattern.test(node.nodeValue)) {
        pattern.lastIndex = 0;
        textNodes.push(node);
      }
    }

    for (const textNode of textNodes) {
      const frag = document.createDocumentFragment();
      const parts = textNode.nodeValue!.split(pattern);
      for (const part of parts) {
        if (pattern.test(part)) {
          pattern.lastIndex = 0;
          const mark = document.createElement("mark");
          mark.className = MARK_CLASS;
          mark.textContent = part;
          frag.appendChild(mark);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      }
      textNode.parentNode?.replaceChild(frag, textNode);
    }
  }
}

function removeHighlights(api: PluginAPI): void {
  for (const mark of document.querySelectorAll<HTMLElement>(`.${MARK_CLASS}`)) {
    const parent = mark.parentNode;
    if (!parent) continue;
    parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
    parent.normalize();
  }
  api.clearProcessed("highlighted");
}

export const highlightTermsPlugin = definePlugin({
  name: "highlight-terms",
  displayName: "Highlight Search Terms",
  version: "0.3.0",
  authors: ["aluminyoom"],
  description: "Highlight your search terms in result snippets",
  defaultEnabled: false,

  settings: [
    {
      key: "highlightColor",
      label: "Highlight color",
      type: "string",
      default: DEFAULT_COLOR,
    },
  ],

  async onStart(api) {
    if (!api.isPage("/search")) return;

    const terms = getSearchTerms();
    if (!terms.length) return;

    const { highlightColor: color } = await api.loadSettings({
      highlightColor: DEFAULT_COLOR,
    });

    api.injectStyle(STYLE_ID, buildHighlightCSS(color));

    highlightSnippets(api, terms);

    const cleanup = api.observeElement(
      ".right-content-box",
      () => {
        highlightSnippets(api, terms);
      },
      { childList: true, subtree: true },
    );

    return () => {
      cleanup();
      removeHighlights(api);
    };
  },
});
