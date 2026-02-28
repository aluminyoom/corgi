import { describe, it, expect } from "vitest";
import { getThemeId } from "@/utils/types";
import type { Theme } from "@/utils/types";

function makeTheme(overrides: Partial<Theme> = {}): Theme {
  return {
    name: "test-theme",
    displayName: "Test Theme",
    version: "1.0.0",
    authors: ["tester"],
    description: "A test theme",
    tags: [],
    variables: {},
    css: "",
    ...overrides,
  };
}

describe("getThemeId", () => {
  it("returns the theme name", () => {
    const theme = makeTheme({ name: "my-dark-theme" });
    expect(getThemeId(theme)).toBe("my-dark-theme");
  });

  it("returns different ids for different theme names", () => {
    const a = makeTheme({ name: "alpha" });
    const b = makeTheme({ name: "beta" });
    expect(getThemeId(a)).not.toBe(getThemeId(b));
  });

  it("handles empty string name", () => {
    const theme = makeTheme({ name: "" });
    expect(getThemeId(theme)).toBe("");
  });
});
