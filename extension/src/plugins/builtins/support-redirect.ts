import { definePlugin } from '../api';

const INTERCEPT_PATTERNS = [
  'kagifeedback.org',
  'mailto:support@kagi.com',
];

function matchesIntercept(href: string): boolean {
  return INTERCEPT_PATTERNS.some((p) => href.includes(p));
}

function createOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.className = 'corgi-sr-overlay';
  document.body.appendChild(overlay);
  return overlay;
}

function createDialog(href: string, onDismiss: () => void, onContinue: () => void): HTMLDivElement {
  const box = document.createElement('div');
  box.className = '_0_confirm_dialog_box corgi-sr-dialog';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-labelledby', 'corgi-sr-title');

  const title = document.createElement('div');
  title.className = 'confirm_dialog_title';
  title.id = 'corgi-sr-title';
  title.textContent = 'Hold on a moment';

  const body = document.createElement('div');
  body.className = 'confirm_dialog_body';

  const isMailto = href.startsWith('mailto:');
  if (isMailto) {
    body.innerHTML =
      '<p>You are about to contact <strong>Kagi Support</strong>.</p>' +
      '<p>If your issue is related to <strong>Corgi</strong> (themes, plugins, or the extension itself), ' +
      'please report it on the <a href="https://github.com/aluminyoom/corgi/issues" target="_blank" rel="noopener">Corgi issue tracker</a> instead.</p>' +
      '<p>Kagi\'s team cannot help with Corgi-related issues.</p>';
  } else {
    body.innerHTML =
      '<p>You are about to visit <strong>Kagi Feedback</strong>.</p>' +
      '<p>If you are reporting a bug or issue caused by <strong>Corgi</strong> (themes, plugins, or the extension itself), ' +
      'please use the <a href="https://github.com/aluminyoom/corgi/issues" target="_blank" rel="noopener">Corgi issue tracker</a> instead.</p>' +
      '<p>Please make sure any bug you report to Kagi is not caused by Corgi.</p>';
  }

  const footer = document.createElement('div');
  footer.className = '_0_confirm_dialog_footer';

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'btn --secondary';
  dismissBtn.type = 'button';
  dismissBtn.textContent = 'Go back';
  dismissBtn.addEventListener('click', onDismiss);

  const continueBtn = document.createElement('button');
  continueBtn.className = 'btn --primary';
  continueBtn.type = 'button';
  continueBtn.textContent = 'I understand, continue';
  continueBtn.addEventListener('click', onContinue);

  footer.appendChild(dismissBtn);
  footer.appendChild(continueBtn);

  box.appendChild(title);
  box.appendChild(body);
  box.appendChild(footer);

  document.body.appendChild(box);
  return box;
}

export const supportRedirectPlugin = definePlugin({
  name: 'support-redirect',
  version: '0.1.0',
  author: 'corgi',
  description: 'Warns users not to report Corgi issues to Kagi when visiting support links',

  css: `
    .corgi-sr-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      z-index: 99998;
      opacity: 0;
      transition: opacity 0.15s ease-in-out;
      pointer-events: none;
    }
    .corgi-sr-overlay.--active {
      opacity: 1;
      pointer-events: auto;
    }
    .corgi-sr-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      max-width: 520px;
      width: calc(100% - 32px);
      background: var(--modal-bg, var(--secondary, #fff));
      border: 1px solid var(--primary-100, #e0e0e0);
      border-radius: 16px;
      padding: 28px 28px 24px;
      box-shadow: 0 4px 80px rgba(0, 0, 0, 0.12);
      z-index: 99999;
      opacity: 0;
      transition: opacity 0.15s ease-in-out, transform 0.15s ease-in-out;
    }
    .corgi-sr-dialog.__0_show {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    .corgi-sr-dialog .confirm_dialog_title {
      font-family: var(--font-lufga, var(--font, sans-serif));
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--color, var(--primary-800, #222));
      margin: 0;
    }
    .corgi-sr-dialog .confirm_dialog_body {
      font-size: 0.875rem;
      line-height: 1.7;
      color: var(--color, var(--primary-700, #444));
      margin-top: 16px;
    }
    .corgi-sr-dialog .confirm_dialog_body p {
      margin: 0 0 8px;
    }
    .corgi-sr-dialog .confirm_dialog_body p:last-child {
      margin-bottom: 0;
    }
    .corgi-sr-dialog .confirm_dialog_body a {
      color: var(--link-color, var(--accent, #4285f4));
      text-decoration: underline;
    }
    .corgi-sr-dialog ._0_confirm_dialog_footer {
      margin-top: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `,

  onStart() {
    let overlay: HTMLDivElement | null = null;
    let dialog: HTMLDivElement | null = null;
    let pendingHref: string | null = null;

    function open(href: string): void {
      pendingHref = href;

      if (!overlay) overlay = createOverlay();
      if (dialog) dialog.remove();

      dialog = createDialog(
        href,
        () => close(),
        () => {
          const target = pendingHref;
          close();
          if (target) {
            if (target.startsWith('mailto:')) {
              window.location.href = target;
            } else {
              window.open(target, '_blank', 'noopener');
            }
          }
        },
      );

      overlay.addEventListener('click', onOverlayClick);

      requestAnimationFrame(() => {
        overlay?.classList.add('--active');
        dialog?.classList.add('__0_show');
        document.body.classList.add('_0_no-scroll');
      });
    }

    function close(): void {
      pendingHref = null;
      overlay?.classList.remove('--active');
      dialog?.classList.remove('__0_show');
      document.body.classList.remove('_0_no-scroll');
    }

    function onClick(e: Event): void {
      const anchor = (e.target as Element)?.closest?.('a');
      if (!anchor) return;
      const href = (anchor as HTMLAnchorElement).href;
      if (!href || !matchesIntercept(href)) return;
      e.preventDefault();
      e.stopPropagation();
      open(href);
    }

    function onOverlayClick(e: Event): void {
      if (e.target === overlay) close();
    }

    function onKeydown(e: Event): void {
      if ((e as KeyboardEvent).key === 'Escape' && pendingHref) close();
    }

    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeydown, true);

    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeydown, true);
      overlay?.removeEventListener('click', onOverlayClick);
      overlay?.remove();
      dialog?.remove();
      document.body.classList.remove('_0_no-scroll');
      overlay = null;
      dialog = null;
    };
  },
});
