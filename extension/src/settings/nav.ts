const KAGISTRY_HREF = "/settings/corgi";
const NAV_LINK_ID = "corgi-nav-link";

const CORGI_ICON = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

function findNavMenu(): HTMLElement | null {
  return document.querySelector(".cth_settings_nav_menu");
}

function findSeparator(menu: HTMLElement): HTMLHRElement | null {
  return menu.querySelector("hr");
}

function deactivateKagiLinks(): void {
  const menu = findNavMenu();
  if (!menu) return;

  for (const link of menu.querySelectorAll<HTMLAnchorElement>(
    "a.nav-link:not(#corgi-nav-link)",
  )) {
    link.classList.remove("--active");
    link.removeAttribute("aria-current");
  }
}

function createNavLink(): HTMLAnchorElement {
  const link = document.createElement("a");
  link.id = NAV_LINK_ID;
  link.href = KAGISTRY_HREF;
  link.className =
    "nav-link ws-nowrap py-8 px-10 mx-n10 flex align-center rounded-full ws-normal";

  const icon = document.createElement("i");
  icon.className = "mr-8 flex icon-sm align-self-start mt-2";
  icon.innerHTML = CORGI_ICON;

  const label = document.createElement("span");
  label.textContent = "Corgi";

  link.appendChild(icon);
  link.appendChild(label);

  return link;
}

export function injectNavLink(): HTMLAnchorElement | null {
  const existing = document.getElementById(
    NAV_LINK_ID,
  ) as HTMLAnchorElement | null;
  if (existing) return existing;

  const menu = findNavMenu();
  if (!menu) return null;

  const link = createNavLink();
  const separator = findSeparator(menu);

  if (separator) {
    separator.before(link);
  } else {
    menu.appendChild(link);
  }

  return link;
}

export function activateNavLink(): void {
  document.documentElement.classList.add("corgi-active");

  deactivateKagiLinks();

  const link = document.getElementById(NAV_LINK_ID) as HTMLAnchorElement | null;
  if (link) {
    link.classList.add("--active");
    link.setAttribute("aria-current", "page");
  }
}

export function deactivateNavLink(): void {
  document.documentElement.classList.remove("corgi-active");

  const link = document.getElementById(NAV_LINK_ID) as HTMLAnchorElement | null;
  if (link) {
    link.classList.remove("--active");
    link.removeAttribute("aria-current");
  }
}

export function isCorgiRoute(): boolean {
  return window.location.pathname === KAGISTRY_HREF;
}
