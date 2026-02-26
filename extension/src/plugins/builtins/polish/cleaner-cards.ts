import { definePlugin } from "../../api";

export const cleanerCardsPlugin = definePlugin({
  name: "corgi-polish/cleaner-cards",
  displayName: "Cleaner Cards",
  version: "0.1.0",
  authors: ["aluminyoom"],
  description:
    "Softer shadows, consistent border-radius, and improved spacing on cards and boxes",
  group: "corgi-polish",
  css: `
    .search-result {
      border-radius: 8px;
    }

    .inline-content {
      border-radius: 8px;
    }

    .settings-row-box {
      border-radius: 8px;
    }
  `,
});
