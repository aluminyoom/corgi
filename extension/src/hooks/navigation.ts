/** Monkey-patches `history.pushState`/`replaceState` + `popstate` to detect SPA navigations. */
export function onUrlChange(callback: () => void): () => void {
  const origPushState = history.pushState.bind(history);
  const origReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args: Parameters<typeof origPushState>) {
    origPushState(...args);
    callback();
  };

  history.replaceState = function (...args: Parameters<typeof origReplaceState>) {
    origReplaceState(...args);
    callback();
  };

  window.addEventListener('popstate', callback);

  return () => {
    history.pushState = origPushState;
    history.replaceState = origReplaceState;
    window.removeEventListener('popstate', callback);
  };
}
