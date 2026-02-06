import { injectNavLink, activateNavLink, isKagistryRoute } from './nav';
import { buildSettingsPage, isSettingsPageMounted } from './page';

function isSettingsPage(): boolean {
  return window.location.pathname.startsWith('/settings');
}

function getMainElement(): HTMLElement | null {
  return document.querySelector('main');
}

function clearMainContent(main: HTMLElement): void {
  main.innerHTML = '';
}

async function mountSettingsPage(): Promise<void> {
  if (isSettingsPageMounted()) return;

  const main = getMainElement();
  if (!main) return;

  clearMainContent(main);

  const page = await buildSettingsPage();
  main.appendChild(page);
  activateNavLink();
}

function unmountSettingsPage(): void {
  const main = getMainElement();
  if (!main) return;

  const page = main.querySelector('#kagistry-settings-page');
  if (page) page.remove();
}

function handleRouteChange(): void {
  if (isKagistryRoute()) {
    mountSettingsPage();
  } else if (isSettingsPageMounted()) {
    unmountSettingsPage();
  }
}

export function initSettingsIntegration(): void {
  if (!isSettingsPage()) return;

  function tryInject(): void {
    const navLink = injectNavLink();
    if (!navLink) return;

    handleRouteChange();

    navLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.history.pushState(null, '', '/settings/kagistry');
      handleRouteChange();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInject);
  } else {
    tryInject();
  }

  const navObserver = new MutationObserver(() => {
    if (!document.getElementById('kagistry-nav-link')) {
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
