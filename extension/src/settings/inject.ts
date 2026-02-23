import { injectNavLink, activateNavLink, deactivateNavLink, isCorgiRoute } from './nav';
import { buildSettingsPage, isSettingsPageMounted } from './page';

function isSettingsPage(): boolean {
  return window.location.pathname.startsWith('/settings');
}

function getMainElement(): HTMLElement | null {
  return document.querySelector('main');
}

function hideKagiContent(main: HTMLElement): void {
  for (const child of Array.from(main.children)) {
    if (child.id === 'corgi-settings-page') continue;
    (child as HTMLElement).style.display = 'none';
  }
}

function showKagiContent(main: HTMLElement): void {
  for (const child of Array.from(main.children)) {
    if (child.id === 'corgi-settings-page') continue;
    (child as HTMLElement).style.display = '';
  }
}

let mounted = false;
let previousTitle = '';

async function mountSettingsPage(): Promise<void> {
  if (mounted) return;
  mounted = true;

  const main = getMainElement();
  if (!main) { mounted = false; return; }

  previousTitle = document.title;
  document.title = 'Corgi - Kagi Settings';
  hideKagiContent(main);

  const existing = main.querySelector('#corgi-settings-page');
  if (existing) {
    (existing as HTMLElement).style.display = '';
    activateNavLink();
    return;
  }

  const page = await buildSettingsPage();
  main.appendChild(page);
  activateNavLink();
}

function unmountSettingsPage(): void {
  mounted = false;
  const main = getMainElement();
  if (!main) return;

  if (previousTitle) {
    document.title = previousTitle;
    previousTitle = '';
  }

  const page = main.querySelector('#corgi-settings-page');
  if (page) (page as HTMLElement).style.display = 'none';

  showKagiContent(main);
  deactivateNavLink();
}

function handleRouteChange(): void {
  if (isCorgiRoute()) {
    mountSettingsPage();
  } else {
    unmountSettingsPage();
  }
}

export function initSettingsIntegration(): void {
  if (!isSettingsPage()) return;

  let linkWired = false;

  function tryInject(): void {
    const navLink = injectNavLink();
    if (!navLink) return;

    if (!linkWired) {
      linkWired = true;
      navLink.addEventListener('click', (event) => {
        event.preventDefault();
        window.history.pushState(null, '', '/settings/corgi');
        handleRouteChange();
      });
    }

    handleRouteChange();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInject);
  } else {
    tryInject();
  }

  const navObserver = new MutationObserver(() => {
    if (!document.getElementById('corgi-nav-link')) {
      linkWired = false;
      tryInject();
    }
  });

  const waitForBody = () => {
    if (document.body) {
      navObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      requestAnimationFrame(waitForBody);
    }
  };
  waitForBody();

  window.addEventListener('popstate', handleRouteChange);
}
