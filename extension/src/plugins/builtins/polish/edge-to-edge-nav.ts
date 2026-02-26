import { definePlugin } from "../../api";

export const edgeToEdgeNavPlugin = definePlugin({
  name: "corgi-polish/edge-to-edge-nav",
  displayName: "Edge-to-Edge Nav",
  version: "0.1.0",
  authors: ["aluminyoom"],
  description:
    "Extends the SERP navigation border to stretch edge-to-edge across the full browser width",
  group: "corgi-polish",
  css: `
    header.app-header {
      border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent);
    }

    header.app-header nav#tonav ._0_nav-items.serp-nav {
      border-bottom: none;
    }
  `,
});
