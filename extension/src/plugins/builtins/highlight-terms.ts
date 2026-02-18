import { definePlugin } from '../api';

const SNIPPET_SELECTOR = '.__sri-desc';
const MARK_CLASS = 'corgi-highlight';
const MARKED_ATTR = 'data-corgi-highlighted';

const HIGHLIGHT_CSS = `
  .${MARK_CLASS} {
    background: color-mix(in srgb, var(--search_result_title, var(--primary, #6366f1)) 20%, transparent);
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
  }
`;

function getSearchTerms(): string[] {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  return query
    .split(/\s+/)
    .map((t) => t.replace(/^["']|["']$/g, '').trim())
    .filter((t) => t.length >= 2);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightSnippets(terms: string[]): void {
  if (!terms.length) return;

  const pattern = new RegExp(
    `(${terms.map(escapeRegex).join('|')})`,
    'gi',
  );

  const snippets = document.querySelectorAll<HTMLElement>(SNIPPET_SELECTOR);
  for (const snippet of snippets) {
    if (snippet.hasAttribute(MARKED_ATTR)) continue;
    snippet.setAttribute(MARKED_ATTR, '');

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
          const mark = document.createElement('mark');
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

function removeHighlights(): void {
  for (const mark of document.querySelectorAll<HTMLElement>(`.${MARK_CLASS}`)) {
    const parent = mark.parentNode;
    if (!parent) continue;
    parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
    parent.normalize();
  }
  for (const el of document.querySelectorAll<HTMLElement>(`[${MARKED_ATTR}]`)) {
    el.removeAttribute(MARKED_ATTR);
  }
}

export const highlightTermsPlugin = definePlugin({
  name: 'highlight-terms',
  displayName: 'Highlight Search Terms',
  version: '0.1.0',
  authors: ['aluminyoom'],
  description: 'Highlight your search terms in result snippets',
  defaultEnabled: false,

  css: HIGHLIGHT_CSS,

  onStart(api) {
    const pagePath = document.documentElement.getAttribute('data-path');
    if (pagePath !== '/search') return;

    const terms = getSearchTerms();
    if (!terms.length) return;

    highlightSnippets(terms);

    const cleanup = api.observeElement('.right-content-box', () => {
      highlightSnippets(terms);
    }, { childList: true, subtree: true });

    return () => {
      cleanup();
      removeHighlights();
    };
  },
});
