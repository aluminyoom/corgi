import { defineExtensionMessaging } from "@webext-core/messaging";
import type { Theme } from "./types";

interface ProtocolMap {
  getActiveThemes(): Theme[];
  getEnabled(): boolean;
  setEnabled(data: { enabled: boolean }): void;
  addTheme(data: { theme: Theme }): void;
  removeTheme(data: { themeId: string }): void;
  setActiveThemes(data: { themeIds: string[] }): void;
  reloadThemes(): void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
