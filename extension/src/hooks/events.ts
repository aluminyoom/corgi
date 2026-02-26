export type EventInterceptor = (
  tag: string,
  data: unknown,
) => { tag: string; data: unknown } | null;

const interceptors = new Set<EventInterceptor>();
let installed = false;

function installEventInterception(): void {
  if (installed) return;
  installed = true;

  const originalDispatchEvent = window.dispatchEvent.bind(window);

  window.dispatchEvent = function (event: Event): boolean {
    if (event instanceof CustomEvent && event.type.startsWith("provider:")) {
      const tag = event.type.slice("provider:".length);
      let current: { tag: string; data: unknown } | null = {
        tag,
        data: event.detail,
      };

      for (const interceptor of interceptors) {
        if (!current) break;
        try {
          current = interceptor(current.tag, current.data);
        } catch {
          // interceptor errors should not block event dispatch
        }
      }

      if (!current) return false;

      if (current.tag !== tag || current.data !== event.detail) {
        const modified = new CustomEvent(`provider:${current.tag}`, {
          detail: current.data,
          bubbles: event.bubbles,
          cancelable: event.cancelable,
        });
        return originalDispatchEvent(modified);
      }
    }

    return originalDispatchEvent(event);
  };
}

export function addEventInterceptor(interceptor: EventInterceptor): () => void {
  installEventInterception();
  interceptors.add(interceptor);
  return () => interceptors.delete(interceptor);
}

export type EventListener = (tag: string, data: unknown) => void;

const listeners = new Map<string, Set<EventListener>>();

export function onProviderEvent(
  tag: string,
  listener: EventListener,
): () => void {
  installEventInterception();

  let set = listeners.get(tag);
  if (!set) {
    set = new Set();
    listeners.set(tag, set);

    window.addEventListener(`provider:${tag}`, ((event: CustomEvent) => {
      const tagListeners = listeners.get(tag);
      if (!tagListeners) return;
      for (const fn of tagListeners) {
        try {
          fn(tag, event.detail);
        } catch {
          // listener errors should not crash the pipeline
        }
      }
    }) as EventListenerOrEventListenerObject);
  }

  set.add(listener);
  return () => set!.delete(listener);
}

export function onAnyProviderEvent(listener: EventListener): () => void {
  return addEventInterceptor((tag, data) => {
    try {
      listener(tag, data);
    } catch {
      // passthrough
    }
    return { tag, data };
  });
}
