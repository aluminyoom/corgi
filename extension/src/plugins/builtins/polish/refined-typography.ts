import { definePlugin } from "../../api";

export const refinedTypographyPlugin = definePlugin({
  name: "corgi-polish/refined-typography",
  displayName: "Refined Typography",
  version: "0.1.0",
  authors: ["aluminyoom"],
  description:
    "Tighter line heights, improved font weights on headings, better text spacing",
  group: "corgi-polish",
  css: `
    .__sri_title_link {
      font-weight: 500;
      line-height: 1.35;
    }

    .__sri-desc {
      line-height: 1.5;
    }

    .__sri-url {
      letter-spacing: -0.01em;
    }

    .__sri-time {
      letter-spacing: 0.02em;
    }
  `,
});
