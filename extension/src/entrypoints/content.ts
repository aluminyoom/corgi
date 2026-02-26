import { injectScript } from "wxt/utils/inject-script";
import { startBridge, pushReady } from "@/bridge/isolated-side";
import { initSettingsIntegration } from "@/settings/inject";
import { initBranding } from "@/settings/branding";

const CLOAK_ID = "corgi-cloak";

function injectCloak(): void {
  const style = document.createElement("style");
  style.id = CLOAK_ID;
  style.textContent = `
    html.corgi-cloaked { opacity: 0 !important; }
    html { transition: opacity 80ms ease-out; }
  `;
  (document.head ?? document.documentElement).appendChild(style);
  document.documentElement.classList.add("corgi-cloaked");
}

export default defineContentScript({
  matches: ["*://*.kagi.com/*"],
  runAt: "document_start",

  async main() {
    injectCloak();
    setTimeout(() => {
      document.documentElement.classList.remove("corgi-cloaked");
      setTimeout(() => document.getElementById(CLOAK_ID)?.remove(), 100);
    }, 800);
    startBridge();
    await injectScript("/corgi-main.js", { keepInDom: true });
    pushReady();
    initSettingsIntegration();
    initBranding();
  },
});
