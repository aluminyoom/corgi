/**
 * Returns a promise that resolves with `document.body` once it exists.
 * Useful for content scripts injected at `document_start`.
 */
export function waitForBody(): Promise<HTMLElement> {
  return new Promise((resolve) => {
    if (document.body) return resolve(document.body);
    const obs = new MutationObserver(() => {
      if (document.body) {
        obs.disconnect();
        resolve(document.body);
      }
    });
    obs.observe(document.documentElement, { childList: true });
  });
}

/**
 * Silently write text to the clipboard.
 * Returns `true` on success, `false` if the Clipboard API is blocked.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.debug("[corgi] clipboard write error (non-fatal):", error);
    return false;
  }
}
