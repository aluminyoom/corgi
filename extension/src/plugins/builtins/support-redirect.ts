import { definePlugin } from '../api';
import { showConfirm } from '@/ui/modal';
import type { ModalHandle } from '@/ui/modal';

const INTERCEPT_PATTERNS = [
  'kagifeedback.org',
  'mailto:support@kagi.com',
];

function matchesIntercept(href: string): boolean {
  return INTERCEPT_PATTERNS.some((p) => href.includes(p));
}

function bodyForHref(href: string): string {
  if (href.startsWith('mailto:')) {
    return (
      '<p>You are about to contact <strong>Kagi Support</strong>.</p>' +
      '<p>If your issue is related to <strong>Corgi</strong> (themes, plugins, or the extension itself), ' +
      'please report it on the <a href="https://github.com/aluminyoom/corgi/issues" target="_blank" rel="noopener">Corgi issue tracker</a> instead.</p>' +
      '<p>Kagi\'s team cannot help with Corgi-related issues.</p>'
    );
  }
  return (
    '<p>You are about to visit <strong>Kagi Feedback</strong>.</p>' +
    '<p>If you are reporting a bug or issue caused by <strong>Corgi</strong> (themes, plugins, or the extension itself), ' +
    'please use the <a href="https://github.com/aluminyoom/corgi/issues" target="_blank" rel="noopener">Corgi issue tracker</a> instead.</p>' +
    '<p>Please make sure any bug you report to Kagi is not caused by Corgi.</p>'
  );
}

export const supportRedirectPlugin = definePlugin({
  name: 'support-redirect',
  version: '0.1.0',
  author: 'corgi',
  description: 'Warns users not to report Corgi issues to Kagi when visiting support links',

  onStart() {
    let activeModal: ModalHandle | null = null;

    function onClick(e: Event): void {
      const anchor = (e.target as Element)?.closest?.('a');
      if (!anchor) return;
      const href = (anchor as HTMLAnchorElement).href;
      if (!href || !matchesIntercept(href)) return;
      e.preventDefault();
      e.stopPropagation();

      activeModal?.close();
      activeModal = showConfirm({
        title: 'Hold on a moment',
        body: bodyForHref(href),
        cancelLabel: 'Go back',
        confirmLabel: 'I understand, continue',
        onConfirm() {
          activeModal = null;
          if (href.startsWith('mailto:')) {
            window.location.href = href;
          } else {
            window.open(href, '_blank', 'noopener');
          }
        },
        onCancel() {
          activeModal = null;
        },
      });
    }

    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('click', onClick, true);
      activeModal?.close();
      activeModal = null;
    };
  },
});
