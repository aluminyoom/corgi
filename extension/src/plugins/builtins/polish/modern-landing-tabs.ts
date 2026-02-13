import { definePlugin } from '../../api';
import type { PluginAPI } from '../../types';

export const modernLandingTabsPlugin = definePlugin({
  name: 'corgi-polish/modern-landing-tabs',
  displayName: 'Modern Landing Tabs',
  version: '0.2.0',
  authors: ['aluminyoom'],
  description:
    'Redesigns the landing page search options into a centered card with colorful category pills and cleaner filters',
  css: `
    /* ═══════════════════════════════════════════
       SECTION 1 — Card wrapper & centering
       ═══════════════════════════════════════════ */

    /* Center the entire search-options area below the search bar */
    .landing-category-select {
      position: relative !important;
      top: auto !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      margin-top: 16px !important;
      padding: 0 16px !important;
      width: 100% !important;
    }

    /* Card wrapper around the tab row */
    .landing-category-select .landing_cat_buttons {
      background: var(--modal-bg) !important;
      border: 1px solid var(--primary-100) !important;
      border-radius: 999px !important;
      box-shadow: 0 2px 12px 0 var(--box-shadow) !important;
      padding: 10px 14px !important;
      justify-content: center !important;
      gap: 8px !important;
      flex-wrap: wrap !important;
      width: auto !important;
      max-width: 100% !important;
    }

    /* Kill native border-bottom under category row */
    .landing-category-select .landing_cat_buttons,
    .landing-category-select {
      border-bottom: none !important;
    }

    /* ═══════════════════════════════════════════
       SECTION 2 — Colorful category pills
       ═══════════════════════════════════════════ */

    /* Base pill shape for ALL category buttons */
    .landing-category-select .button.btn-search.nav-item {
      border-radius: 999px !important;
      padding: 0 18px !important;
      height: 34px !important;
      font-size: 0.8125rem !important;
      font-weight: 600 !important;
      letter-spacing: 0.01em;
      border: none !important;
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        color 0.15s ease,
        box-shadow 0.15s ease,
        opacity 0.15s ease;
    }

    /* ── Per-category colors (inactive = transparent bg, active = solid fill) ── */

    /* All / Search — gold */
    .landing-category-select .button.btn-search.nav-item.n_se {
      background-color: transparent !important;
      color: color-mix(in srgb, var(--nav_n_se_line) 85%, var(--primary)) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_se:hover {
      background-color: color-mix(in srgb, var(--nav_n_se_line) 15%, transparent) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_se.--active {
      background-color: var(--nav_n_se_line) !important;
      color: #1a1a2e !important;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--nav_n_se_line) 35%, transparent) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_se.--active:hover {
      opacity: 0.9;
    }

    /* Images — blue */
    .landing-category-select .button.btn-search.nav-item.n_im {
      background-color: transparent !important;
      color: color-mix(in srgb, var(--nav_n_im_line) 85%, var(--primary)) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_im:hover {
      background-color: color-mix(in srgb, var(--nav_n_im_line) 15%, transparent) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_im.--active {
      background-color: var(--nav_n_im_line) !important;
      color: #fff !important;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--nav_n_im_line) 35%, transparent) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_im.--active:hover {
      opacity: 0.9;
    }

    /* Videos — red */
    .landing-category-select .button.btn-search.nav-item.n_vi {
      background-color: transparent !important;
      color: color-mix(in srgb, var(--nav_n_vi_line) 85%, var(--primary)) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_vi:hover {
      background-color: color-mix(in srgb, var(--nav_n_vi_line) 15%, transparent) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_vi.--active {
      background-color: var(--nav_n_vi_line) !important;
      color: #fff !important;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--nav_n_vi_line) 35%, transparent) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_vi.--active:hover {
      opacity: 0.9;
    }

    /* News / Podcasts — purple */
    .landing-category-select .button.btn-search.nav-item.n_ne {
      background-color: transparent !important;
      color: color-mix(in srgb, var(--nav_n_ne_line) 85%, var(--primary)) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_ne:hover {
      background-color: color-mix(in srgb, var(--nav_n_ne_line) 15%, transparent) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_ne.--active {
      background-color: var(--nav_n_ne_line) !important;
      color: #fff !important;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--nav_n_ne_line) 35%, transparent) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_ne.--active:hover {
      opacity: 0.9;
    }

    /* Maps — green */
    .landing-category-select .button.btn-search.nav-item.n_ma {
      background-color: transparent !important;
      color: color-mix(in srgb, var(--nav_n_ma_line) 85%, var(--primary)) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_ma:hover {
      background-color: color-mix(in srgb, var(--nav_n_ma_line) 15%, transparent) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_ma.--active {
      background-color: var(--nav_n_ma_line) !important;
      color: #fff !important;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--nav_n_ma_line) 35%, transparent) !important;
    }
    .landing-category-select .button.btn-search.nav-item.n_ma.--active:hover {
      opacity: 0.9;
    }

    /* ── Kill the native orange underline on any active tab ── */
    .landing-category-select .button.btn-search.nav-item::after,
    .landing-category-select .button.btn-search.nav-item::before {
      display: none !important;
    }

    /* ═══════════════════════════════════════════
       SECTION 3 — "More" dropdown & Close button
       ═══════════════════════════════════════════ */

    /* "More" dropdown trigger — neutral pill */
    .landing-category-select .nav-item.dd {
      border-radius: 999px !important;
      height: 34px !important;
      padding: 0 12px !important;
      font-size: 0.8125rem !important;
      font-weight: 500 !important;
      background-color: transparent !important;
      border: none !important;
      display: flex !important;
      align-items: center !important;
      position: relative !important;
      overflow: visible !important;
      transition:
        background-color 0.15s ease;
    }
    .landing-category-select .nav-item.dd:hover {
      background-color: color-mix(in srgb, var(--primary) 10%, transparent) !important;
    }

    /* Override nested k_ui_dropdown styles that bleed through */
    .landing-category-select .nav-item.dd .more_search_dropdown_box {
      display: flex !important;
      align-items: center !important;
      height: 100% !important;
      overflow: visible !important;
      padding: 0 !important;
    }
    .landing-category-select .nav-item.dd .k_ui_dropdown_first_item {
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      padding: 0 !important;
      height: auto !important;
    }
    .landing-category-select .nav-item.dd .k_ui_dropdown_first_item span {
      flex-grow: unset !important;
      text-align: center !important;
      font-size: 0.8125rem !important;
      font-weight: 500 !important;
    }

    /* Hide the dots icon in the More dropdown (DOM removal in onStart) */
    .landing-category-select .nav-item.dd .k_ui_dropdown_first_item i {
      display: none !important;
    }

    /* More dropdown panel */
    .landing-category-select .more_search_dropdown_box {
      border-radius: 16px;
      overflow: visible !important;
    }

    /* ── Hide the Close button inside the card ── */
    .landing_cat_buttons > .land_adv_search_btn,
    .landing-category-select > .landing_cat_buttons > label.land_adv_search_btn {
      display: none !important;
    }

    /* ═══════════════════════════════════════════
       SECTION 3b — Search Options toggle INSIDE search bar
       ═══════════════════════════════════════════ */

    /* Position toggle inside the search bar, left side (landing only) */
    [data-path="/"] .search-input-container ._0_land_adv_search_btn,
    [data-path="/"] .search-input-container .land_adv_search_btn {
      position: absolute !important;
      visibility: visible !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      right: auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      min-width: 36px !important;
      padding: 0 !important;
      margin: 0 !important;
      border-radius: 50% !important;
      background: transparent !important;
      cursor: pointer !important;
      z-index: 2 !important;
      transition: background-color 0.15s ease !important;
    }
    [data-path="/"] .search-input-container ._0_land_adv_search_btn:hover,
    [data-path="/"] .search-input-container .land_adv_search_btn:hover {
      background-color: var(--hover-bg) !important;
    }

    /* Shift the search input right to make room for the gear icon */
    [data-path="/"] .search-input-container .search-input {
      padding-left: 42px !important;
    }

    /* Hide the text label, show only the icon */
    [data-path="/"] .search-input-container .land_adv_search_btn span,
    [data-path="/"] .search-input-container ._0_land_adv_search_btn span {
      display: none !important;
    }

    /* Ensure the SVG icon is visible */
    [data-path="/"] .search-input-container .land_adv_search_btn svg,
    [data-path="/"] .search-input-container ._0_land_adv_search_btn svg {
      opacity: 0.6;
      transition: opacity 0.15s ease;
    }
    [data-path="/"] .search-input-container .land_adv_search_btn:hover svg,
    [data-path="/"] .search-input-container ._0_land_adv_search_btn:hover svg {
      opacity: 1;
    }

    /* Zero out the margin on the gear icon <i> */
    [data-path="/"] .search-input-container .land_adv_search_btn i,
    [data-path="/"] .search-input-container ._0_land_adv_search_btn i {
      margin-right: 0 !important;
    }

    /* When toggle is active (X icon state), give it a subtle active indicator */
    [data-path="/"] .search-input-container .land_adv_search_btn.__close,
    [data-path="/"] .search-input-container ._0_land_adv_search_btn.__close {
      background-color: color-mix(in srgb, var(--nav_n_se_line) 15%, transparent) !important;
    }
    [data-path="/"] .search-input-container .land_adv_search_btn.__close svg,
    [data-path="/"] .search-input-container ._0_land_adv_search_btn.__close svg {
      opacity: 0.9;
    }

    /* ═══════════════════════════════════════════
       SECTION 4 — Filter bar (centered below card)
       ═══════════════════════════════════════════ */

    /* Center the filter bar */
    ._0_landing_filters {
      display: flex !important;
      justify-content: center !important;
      margin-top: 10px !important;
    }

    ._0_landing_filters ._0_filters_box_all {
      justify-content: center !important;
      gap: 8px !important;
      flex-wrap: wrap !important;
    }

    /* Filter pills */
    ._0_landing_filters .filter-item {
      border-radius: 999px !important;
      height: 30px !important;
      border: 1px solid var(--primary-100) !important;
      transition:
        border-color 0.15s ease,
        background-color 0.15s ease;
    }
    ._0_landing_filters .filter-item:hover {
      border-color: var(--primary-200) !important;
      background-color: var(--hover-bg) !important;
    }

    ._0_landing_filters .filter-item > .dd-toggle-label,
    ._0_landing_filters .filter-item > .filter-item-inner,
    ._0_landing_filters .filter-item > .k_ui_dropdown_first_item {
      font-size: 0.8125rem;
      font-weight: 500;
    }

    /* Filter dropdown panels */
    ._0_landing_filters .k_ui_dropdown_data_list {
      border-radius: 14px;
      border: 1px solid var(--primary-100);
      box-shadow: 0 8px 32px 0 var(--box-shadow);
      overflow: hidden;
    }

    /* Lens toggle */
    ._0_landing_filters .main_lens_preselect_box {
      border-radius: 999px;
    }

    /* Advanced search link — centered */
    ._0_landing_filters #menu-advanced-search-toggle {
      font-size: 0.8125rem;
      opacity: 0.6;
      transition: opacity 0.15s ease;
    }
    ._0_landing_filters #menu-advanced-search-toggle:hover {
      opacity: 1;
    }
  `,
  onStart(_api: PluginAPI) {
    const dotsIcon = document.querySelector(
      '.landing-category-select .k_ui_dropdown_first_item i',
    );
    if (dotsIcon) dotsIcon.remove();
  },
});
