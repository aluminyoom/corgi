import { definePlugin } from '../../api';

export const pillFiltersPlugin = definePlugin({
  name: 'corgi-polish/pill-filters',
  displayName: 'Pill Filters',
  version: '0.2.0',
  authors: ['aluminyoom'],
  description: 'Makes filter bar buttons pill-shaped to match the search bar curvature',
  group: 'corgi-polish',
  css: `
    ._0_filters-panel .dd-toggle-label {
      border-radius: 20px !important;
    }

    ._0_filters-panel .dropdown.filter-item .dd-toggle-label {
      border-radius: 20px !important;
    }

    ._0_filters-panel .filter-item-inner {
      border-radius: 20px !important;
    }

    ._0_filters-panel ._0_filters-clear-btn {
      border-radius: 20px !important;
    }

    ._0_filters-panel .dropdown.filter-item {
      border-radius: 20px !important;
    }
  `,
});
