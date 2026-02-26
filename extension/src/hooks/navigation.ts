/** Monkey-patches `history.pushState`/`replaceState` + `popstate` to detect SPA navigations. */
export function onUrlChange(callback: () => void): () => void {
  const prevPushState = history.pushState;
  const prevReplaceState = history.replaceState;

  const patchedPushState = function (
    this: History,
    ...args: Parameters<typeof prevPushState>
  ) {
    prevPushState.apply(this, args);
    callback();
  };

  const patchedReplaceState = function (
    this: History,
    ...args: Parameters<typeof prevReplaceState>
  ) {
    prevReplaceState.apply(this, args);
    callback();
  };

  history.pushState = patchedPushState as typeof history.pushState;
  history.replaceState = patchedReplaceState as typeof history.replaceState;

  window.addEventListener("popstate", callback);

  return () => {
    if (history.pushState === patchedPushState) {
      history.pushState = prevPushState;
    }
    if (history.replaceState === patchedReplaceState) {
      history.replaceState = prevReplaceState;
    }
    window.removeEventListener("popstate", callback);
  };
}
