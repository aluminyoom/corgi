import { definePlugin } from "../api";

export const hideFaviconsPlugin = definePlugin({
  name: "hide-favicons",
  displayName: "Hide Favicons",
  version: "0.1.0",
  authors: ["aluminyoom"],
  description: "Hide favicon icons next to search result URLs",
  defaultEnabled: false,

  css: `
    .__domain-favicon,
    .card_provider_favicon {
      display: none !important;
    }
  `,
});
