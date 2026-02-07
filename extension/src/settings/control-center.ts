const LINK_ID = 'kagistry-cc-link';
const SETTINGS_HREF = '/settings/kagistry';

const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

function createLink(): HTMLAnchorElement {
  const link = document.createElement('a');
  link.id = LINK_ID;
  link.href = SETTINGS_HREF;
  link.className = 'nav-item-link';
  link.innerHTML = ICON + 'Kagistry';

  link.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = SETTINGS_HREF;
  });

  return link;
}

function tryInject(): boolean {
  if (document.getElementById(LINK_ID)) return true;

  const panel = document.querySelector('#quickSettings');
  if (!panel) return false;

  const nav = panel.querySelector('.cc-desk-nav') ?? panel.querySelector('.cc-app-nav');
  if (!nav) return false;

  nav.appendChild(createLink());
  return true;
}

export function injectControlCenterLink(): void {
  tryInject();

  window.addEventListener('quick-settings-opened', () => tryInject());

  const observer = new MutationObserver(() => {
    if (document.querySelector('#quickSettings') && !document.getElementById(LINK_ID)) {
      tryInject();
    }
  });

  observer.observe(document.body, { childList: true, subtree: false });
}
