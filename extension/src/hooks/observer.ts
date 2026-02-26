export type MutationHandler = (mutations: MutationRecord[]) => void;

interface ObserverEntry {
  observer: MutationObserver;
  handlers: Set<MutationHandler>;
}

const observers = new Map<string, ObserverEntry>();

export function observeElement(
  selector: string,
  handler: MutationHandler,
  options: MutationObserverInit = { childList: true, subtree: true },
): () => void {
  const existing = observers.get(selector);
  if (existing) {
    existing.handlers.add(handler);
    return () => {
      existing.handlers.delete(handler);
      if (existing.handlers.size === 0) {
        existing.observer.disconnect();
        observers.delete(selector);
      }
    };
  }

  const handlers = new Set<MutationHandler>();
  handlers.add(handler);

  const observer = new MutationObserver((mutations) => {
    for (const fn of handlers) {
      try {
        fn(mutations);
      } catch {
        // observer handlers should not crash other handlers
      }
    }
  });

  const entry: ObserverEntry = { observer, handlers };
  observers.set(selector, entry);

  const attach = () => {
    const target =
      selector === "document"
        ? document.documentElement
        : document.querySelector(selector);
    if (target) {
      observer.observe(target, options);
      return true;
    }
    return false;
  };

  if (!attach()) {
    const waitObserver = new MutationObserver(() => {
      if (attach()) {
        waitObserver.disconnect();
      }
    });
    waitObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  return () => {
    handlers.delete(handler);
    if (handlers.size === 0) {
      observer.disconnect();
      observers.delete(selector);
    }
  };
}

export function onElementAdded(
  parentSelector: string,
  childSelector: string,
  handler: (element: Element) => void,
): () => void {
  return observeElement(parentSelector, (mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(childSelector)) {
          handler(node);
        }
        for (const child of node.querySelectorAll(childSelector)) {
          handler(child);
        }
      }
    }
  });
}

export function disconnectAll(): void {
  for (const [, entry] of observers) {
    entry.observer.disconnect();
  }
  observers.clear();
}
