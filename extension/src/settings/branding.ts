const BRAND_ID = "corgi-branding";
const MEMBER_BRAND_ID = "corgi-member-branding";

const COPYRIGHT_SELECTOR = "div.copyright";
const MEMBER_BADGE_SELECTOR = "div.member-number-badge";

function getVersion(): string {
  try {
    return browser.runtime.getManifest().version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function injectCopyrightBranding(): boolean {
  if (document.getElementById(BRAND_ID)) return true;

  const copyright = document.querySelector(COPYRIGHT_SELECTOR);
  if (!copyright) return false;

  const span = document.createElement("span");
  span.id = BRAND_ID;
  span.textContent = ` \u00B7 Corgi v${getVersion()}`;
  copyright.appendChild(span);
  return true;
}

function injectMemberBadgeBranding(): boolean {
  if (document.getElementById(MEMBER_BRAND_ID)) return true;

  const badge = document.querySelector(MEMBER_BADGE_SELECTOR);
  if (!badge) return false;

  const el = document.createElement("div");
  el.id = MEMBER_BRAND_ID;
  el.className = badge.className;
  el.textContent = `Corgi v${getVersion()}`;
  badge.after(el);
  return true;
}

function isSettingsPage(): boolean {
  return window.location.pathname.startsWith("/settings");
}

export function initBranding(): void {
  function tryInject(): void {
    injectCopyrightBranding();
    if (isSettingsPage()) {
      injectMemberBadgeBranding();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryInject);
  } else {
    tryInject();
  }

  const observer = new MutationObserver(() => {
    if (!document.getElementById(BRAND_ID)) {
      injectCopyrightBranding();
    }
    if (isSettingsPage() && !document.getElementById(MEMBER_BRAND_ID)) {
      injectMemberBadgeBranding();
    }
  });

  const waitForBody = () => {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      requestAnimationFrame(waitForBody);
    }
  };
  waitForBody();
}
