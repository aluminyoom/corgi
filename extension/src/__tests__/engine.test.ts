import { describe, it, expect } from "vitest";
import { buildThemeCSS } from "@/utils/engine";
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

describe("buildThemeCSS", () => {
  it("returns empty string for empty themes array", () => {
    expect(buildThemeCSS([], null)).toBe("");
  });

  it("generates :root block with !important for variables", () => {
    const theme = makeTheme({
      variables: { "--bg": "#000", "--fg": "#fff" },
    });
    const css = buildThemeCSS([theme], null);
    expect(css).toContain(":root {");
    expect(css).toContain("--bg: #000 !important;");
    expect(css).toContain("--fg: #fff !important;");
    expect(css).toContain("}");
  });

  it("appends theme css after variables", () => {
    const theme = makeTheme({
      variables: { "--bg": "#000" },
      css: "body { color: red; }",
    });
    const css = buildThemeCSS([theme], null);
    const rootIdx = css.indexOf(":root {");
    const bodyIdx = css.indexOf("body { color: red; }");
    expect(rootIdx).toBeGreaterThanOrEqual(0);
    expect(bodyIdx).toBeGreaterThan(rootIdx);
  });

  it("outputs only css when theme has no variables", () => {
    const theme = makeTheme({
      variables: {},
      css: ".custom { display: none; }",
    });
    const css = buildThemeCSS([theme], null);
    expect(css).toBe(".custom { display: none; }");
    expect(css).not.toContain(":root");
  });

  it("merges page override variables over global variables", () => {
    const theme = makeTheme({
      variables: { "--bg": "#000", "--fg": "#fff" },
      pages: {
        "/search": {
          variables: { "--bg": "#111" },
        },
      },
    });
    const css = buildThemeCSS([theme], "/search");
    expect(css).toContain("--bg: #111 !important;");
    expect(css).toContain("--fg: #fff !important;");
    expect(css).not.toContain("--bg: #000");
  });

  it("appends page override css", () => {
    const theme = makeTheme({
      css: "/* global */",
      pages: {
        "/settings": {
          css: "/* page override */",
        },
      },
    });
    const css = buildThemeCSS([theme], "/settings");
    expect(css).toContain("/* global */");
    expect(css).toContain("/* page override */");
  });

  it("ignores page overrides when pagePath is null", () => {
    const theme = makeTheme({
      variables: { "--bg": "#000" },
      pages: {
        "/search": {
          variables: { "--bg": "#111" },
        },
      },
    });
    const css = buildThemeCSS([theme], null);
    expect(css).toContain("--bg: #000 !important;");
    expect(css).not.toContain("--bg: #111");
  });

  it("ignores page overrides for non-matching path", () => {
    const theme = makeTheme({
      variables: { "--bg": "#000" },
      pages: {
        "/search": {
          variables: { "--bg": "#111" },
        },
      },
    });
    const css = buildThemeCSS([theme], "/settings");
    expect(css).toContain("--bg: #000 !important;");
    expect(css).not.toContain("--bg: #111");
  });

  it("ensures !important is present on all variable declarations", () => {
    const theme = makeTheme({
      variables: { "--a": "1", "--b": "2", "--c": "3" },
    });
    const css = buildThemeCSS([theme], null);
    const lines = css.split("\n").filter((l) => l.includes("--"));
    expect(lines.length).toBe(3);
    for (const line of lines) {
      expect(line).toContain("!important;");
    }
  });

  it("concatenates multiple themes with double newline", () => {
    const t1 = makeTheme({ name: "t1", css: "/* theme 1 */" });
    const t2 = makeTheme({ name: "t2", css: "/* theme 2 */" });
    const css = buildThemeCSS([t1, t2], null);
    expect(css).toBe("/* theme 1 */\n\n/* theme 2 */");
  });

  it("handles theme with both variables and css for multiple themes", () => {
    const t1 = makeTheme({
      name: "t1",
      variables: { "--x": "1" },
      css: "/* t1 css */",
    });
    const t2 = makeTheme({
      name: "t2",
      variables: { "--y": "2" },
    });
    const css = buildThemeCSS([t1, t2], null);
    expect(css).toContain("--x: 1 !important;");
    expect(css).toContain("/* t1 css */");
    expect(css).toContain("--y: 2 !important;");
  });
});
