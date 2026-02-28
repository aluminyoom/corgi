import { bridgeRequest, onBridgePush } from "@/bridge/main-side";
import { trapGlobal } from "@/hooks/traps";
import {
  applyThemes,
  clearThemes,
  interceptKagiStylesheets,
} from "@/styles/injector";
import {
  registerPlugin,
  startPlugin,
  stopPlugin,
  stopAllPlugins,
  listPlugins,
} from "@/plugins/registry";
import { builtinPlugins } from "@/plugins/builtins/discover";
import { injectControlCenterLink } from "@/settings/control-center";
import type { Theme } from "@/utils/types";

const win = window as unknown as Record<string, unknown>;

export default defineUnlistedScript(() => {
  const cleanups: (() => void)[] = [];

  trapGlobal("client", (client: unknown) => {
    if (client && typeof client === "object") {
      win.__corgi_client = client;
    }
  });

  trapGlobal("kagiSettings", (settings: unknown) => {
    if (settings && typeof settings === "object") {
      win.__corgi_settings = settings;
    }
  });

  cleanups.push(interceptKagiStylesheets());

  async function loadThemes(): Promise<void> {
    try {
      const result = await bridgeRequest<{
        enabled: boolean;
        themes: Theme[];
      }>("theme:apply");

      if (!result.enabled) {
        clearThemes();
        return;
      }

      const pagePath = document.documentElement.getAttribute("data-path");
      applyThemes(result.themes, pagePath);
    } catch (error) {
      // bridge may not be ready yet, themes will apply on push
      console.debug("[corgi] theme load error (non-fatal):", error);
    }
  }

  async function getDisabledPlugins(): Promise<Set<string>> {
    try {
      const states = await bridgeRequest<{ disabled: string[] }>(
        "plugin:state",
      );
      return new Set(states?.disabled ?? []);
    } catch (error) {
      console.debug("[corgi] plugin state error (non-fatal):", error);
      return new Set();
    }
  }

  onBridgePush("ready", async () => {
    loadThemes();

    for (const plugin of builtinPlugins) registerPlugin(plugin);

    const disabled = await getDisabledPlugins();
    for (const instance of listPlugins()) {
      if (!disabled.has(instance.definition.name)) {
        startPlugin(instance.definition.name);
      }
    }

    injectControlCenterLink();

    document.documentElement.classList.remove("corgi-cloaked");
  });

  onBridgePush("theme:apply", () => {
    loadThemes();
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-path"
      ) {
        loadThemes();
        break;
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-path", "class"],
  });

  cleanups.push(() => observer.disconnect());

  win.__corgi = {
    hooks: {
      trapGlobal: () => import("@/hooks/traps").then((m) => m.trapGlobal),
      wrapFunction: () => import("@/hooks/wrap").then((m) => m.wrapFunction),
      events: () => import("@/hooks/events"),
      fetch: () => import("@/hooks/fetch"),
      observer: () => import("@/hooks/observer"),
    },
    plugins: {
      define: () => import("@/plugins/api").then((m) => m.definePlugin),
      install: () => import("@/plugins/api").then((m) => m.installPlugin),
      registry: () => import("@/plugins/registry"),
      list: listPlugins,
    },
    styles: {
      variables: () => import("@/styles/variables"),
      injector: () => import("@/styles/injector"),
    },
    ui: {
      modal: () => import("@/ui/modal"),
    },
    destroy() {
      stopAllPlugins();
      clearThemes();
      for (const cleanup of cleanups.reverse()) {
        try {
          cleanup();
        } catch (error) {
          /* noop */
          console.debug("[corgi] destroy cleanup error (non-fatal):", error);
        }
      }
    },
  };
});
