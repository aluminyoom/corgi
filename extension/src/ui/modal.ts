export interface ModalButton {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'danger-secondary';
  action: () => void;
}

export interface ModalOptions {
  title: string;
  body: string | HTMLElement;
  buttons: ModalButton[];
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
}

export interface ModalHandle {
  close: () => void;
  element: HTMLDivElement;
}

let injectedCSS = false;

const MODAL_CSS = `
  .corgi-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 99998;
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
    pointer-events: none;
  }
  .corgi-modal-overlay.--active {
    opacity: 1;
    pointer-events: auto;
  }
  .corgi-modal {
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
  .corgi-modal.__0_show {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  .corgi-modal-title {
    font-family: var(--font-lufga, var(--font, sans-serif));
    font-size: 1.35rem;
    font-weight: 600;
    color: var(--color, var(--primary-800, #222));
    margin: 0;
  }
  .corgi-modal-body {
    font-size: 0.875rem;
    line-height: 1.7;
    color: var(--color, var(--primary-700, #444));
    margin-top: 16px;
  }
  .corgi-modal-body p {
    margin: 0 0 8px;
  }
  .corgi-modal-body p:last-child {
    margin-bottom: 0;
  }
  .corgi-modal-body a {
    color: var(--link-color, var(--accent, #4285f4));
    text-decoration: underline;
  }
  .corgi-modal-footer {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
`;

function ensureCSS(): void {
  if (injectedCSS) return;
  const style = document.createElement('style');
  style.setAttribute('data-corgi', 'modal');
  style.textContent = MODAL_CSS;
  (document.head ?? document.documentElement).appendChild(style);
  injectedCSS = true;
}

function variantClass(variant: ModalButton['variant']): string {
  switch (variant) {
    case 'danger': return 'btn --danger';
    case 'danger-secondary': return 'btn --danger-secondary';
    case 'secondary': return 'btn --secondary';
    default: return 'btn --primary';
  }
}

export function showModal(options: ModalOptions): ModalHandle {
  ensureCSS();

  const overlay = document.createElement('div');
  overlay.className = 'corgi-modal-overlay';
  document.body.appendChild(overlay);

  const dialog = document.createElement('div');
  dialog.className = 'corgi-modal';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');

  const titleEl = document.createElement('div');
  titleEl.className = 'corgi-modal-title';
  titleEl.textContent = options.title;
  dialog.setAttribute('aria-labelledby', 'corgi-modal-title');
  titleEl.id = 'corgi-modal-title';

  const bodyEl = document.createElement('div');
  bodyEl.className = 'corgi-modal-body';
  if (typeof options.body === 'string') {
    bodyEl.innerHTML = options.body;
  } else {
    bodyEl.appendChild(options.body);
  }

  const footer = document.createElement('div');
  footer.className = 'corgi-modal-footer';

  for (const btn of options.buttons) {
    const button = document.createElement('button');
    button.className = variantClass(btn.variant);
    button.type = 'button';
    button.textContent = btn.label;
    button.addEventListener('click', () => {
      btn.action();
    });
    footer.appendChild(button);
  }

  dialog.appendChild(titleEl);
  dialog.appendChild(bodyEl);
  dialog.appendChild(footer);
  document.body.appendChild(dialog);

  function close(): void {
    overlay.classList.remove('--active');
    dialog.classList.remove('__0_show');
    document.body.classList.remove('_0_no-scroll');

    const onEnd = (): void => {
      dialog.removeEventListener('transitionend', onEnd);
      overlay.remove();
      dialog.remove();
      document.removeEventListener('keydown', onKeydown, true);
    };
    dialog.addEventListener('transitionend', onEnd);
    setTimeout(onEnd, 200);
  }

  function onKeydown(e: Event): void {
    if ((e as KeyboardEvent).key === 'Escape' && options.closeOnEscape !== false) close();
  }

  if (options.closeOnOverlay !== false) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  document.addEventListener('keydown', onKeydown, true);

  requestAnimationFrame(() => {
    overlay.classList.add('--active');
    dialog.classList.add('__0_show');
    document.body.classList.add('_0_no-scroll');
  });

  return { close, element: dialog };
}

export function showConfirm(options: {
  title: string;
  body: string | HTMLElement;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ModalButton['variant'];
  onConfirm: () => void;
  onCancel?: () => void;
}): ModalHandle {
  let handle: ModalHandle;
  handle = showModal({
    title: options.title,
    body: options.body,
    buttons: [
      {
        label: options.cancelLabel ?? 'Cancel',
        variant: 'secondary',
        action() { handle.close(); options.onCancel?.(); },
      },
      {
        label: options.confirmLabel ?? 'Confirm',
        variant: options.confirmVariant ?? 'primary',
        action() { handle.close(); options.onConfirm(); },
      },
    ],
  });
  return handle;
}

export function showAlert(options: {
  title: string;
  body: string | HTMLElement;
  buttonLabel?: string;
  variant?: ModalButton['variant'];
  onDismiss?: () => void;
}): ModalHandle {
  let handle: ModalHandle;
  handle = showModal({
    title: options.title,
    body: options.body,
    buttons: [
      {
        label: options.buttonLabel ?? 'OK',
        variant: options.variant ?? 'primary',
        action() { handle.close(); options.onDismiss?.(); },
      },
    ],
  });
  return handle;
}
