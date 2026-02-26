import { definePlugin } from "../api";

const CLOUDS_SELECTOR = ".clouds";
const LOGO_SELECTOR = ".clouds .logo";

type FitMode = "contain" | "cover" | "fill" | "scale-down" | "none";

type LogoSettings = {
  url: string;
  file: string;
  maxWidth: string;
  maxHeight: string;
  fitMode: FitMode;
};

const DEFAULTS: LogoSettings = {
  url: "",
  file: "",
  maxWidth: "200px",
  maxHeight: "200px",
  fitMode: "contain",
};

const LOGO_ELEMENT_ID = "corgi-custom-logo";
const HIDDEN_ATTR = "data-corgi-logo-hidden";
const OVERFLOW_ATTR = "data-corgi-logo-overflow";

function applyLogo(settings: LogoSettings): boolean {
  const src = settings.file || settings.url;
  const clouds = document.querySelector<HTMLElement>(CLOUDS_SELECTOR);
  const logoDiv = document.querySelector<HTMLElement>(LOGO_SELECTOR);

  if (!clouds || !logoDiv) return false;

  const existing = document.getElementById(LOGO_ELEMENT_ID);

  for (const child of clouds.children) {
    const el = child as HTMLElement;
    if (!el.classList.contains("logo")) {
      el.style.display = "none";
      el.setAttribute(HIDDEN_ATTR, "");
    }
  }

  if (!logoDiv.hasAttribute(OVERFLOW_ATTR)) {
    logoDiv.style.overflow = "hidden";
    logoDiv.setAttribute(OVERFLOW_ATTR, "");
  }

  if (!src) {
    if (existing) existing.remove();
    return true;
  }

  for (const child of logoDiv.children) {
    const el = child as HTMLElement;
    if (el.id !== LOGO_ELEMENT_ID) {
      el.style.display = "none";
      el.setAttribute(HIDDEN_ATTR, "");
    }
  }

  let img = existing as HTMLImageElement | null;
  if (!img) {
    img = document.createElement("img");
    img.id = LOGO_ELEMENT_ID;
    logoDiv.appendChild(img);
  }

  img.src = src;
  const fit = settings.fitMode || DEFAULTS.fitMode;
  const expand = fit === "contain" || fit === "cover" || fit === "fill";
  img.style.cssText = [
    "display: block",
    "margin: 0 auto",
    `width: ${expand ? "100%" : "auto"}`,
    `height: ${expand ? "100%" : "auto"}`,
    "max-width: 100%",
    "max-height: 100%",
    `object-fit: ${fit}`,
  ].join(";");

  const userW = settings.maxWidth || DEFAULTS.maxWidth;
  const userH = settings.maxHeight || DEFAULTS.maxHeight;
  if (userW !== "100%") img.style.maxWidth = userW;
  if (userH !== "100%") img.style.maxHeight = userH;

  return true;
}

function restoreLogo(): void {
  const img = document.getElementById(LOGO_ELEMENT_ID);
  if (img) img.remove();

  for (const el of document.querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}]`)) {
    el.style.display = "";
    el.removeAttribute(HIDDEN_ATTR);
  }

  for (const el of document.querySelectorAll<HTMLElement>(
    `[${OVERFLOW_ATTR}]`,
  )) {
    el.style.overflow = "";
    el.removeAttribute(OVERFLOW_ATTR);
  }
}

export const customLogoPlugin = definePlugin({
  name: "custom-logo",
  displayName: "Custom Logo",
  version: "0.4.0",
  authors: ["aluminyoom"],
  description:
    "Replace the landing page logo with a custom image (URL or file upload)",

  settings: [
    { key: "url", label: "Logo image URL", type: "string", default: "" },
    {
      key: "file",
      label: "Or upload a logo image",
      type: "file",
      default: "",
      accept: "image/*",
    },
    {
      key: "fitMode",
      label: "Image fit mode",
      type: "select",
      default: "contain",
      options: [
        { label: "Contain (fit inside, keep aspect ratio)", value: "contain" },
        { label: "Cover (fill area, crop if needed)", value: "cover" },
        { label: "Fill (stretch to fit)", value: "fill" },
        {
          label: "Scale Down (shrink only, never enlarge)",
          value: "scale-down",
        },
        { label: "None (original size)", value: "none" },
      ],
    },
    {
      key: "maxWidth",
      label: "Max width (CSS value)",
      type: "string",
      default: "200px",
    },
    {
      key: "maxHeight",
      label: "Max height (CSS value)",
      type: "string",
      default: "200px",
    },
  ],

  onStart(api) {
    if (!api.isPage("/landing")) return;

    let settled = false;
    let cachedSettings: LogoSettings = { ...DEFAULTS };

    async function loadAndApply(): Promise<void> {
      cachedSettings = await api.loadSettings(DEFAULTS);
      settled = applyLogo(cachedSettings);
    }

    loadAndApply();

    const cleanup = api.observeElement(
      LOGO_SELECTOR,
      () => {
        if (settled) {
          applyLogo(cachedSettings);
        } else {
          loadAndApply();
        }
      },
      { childList: true, subtree: true },
    );

    return () => {
      cleanup();
      restoreLogo();
    };
  },
});
