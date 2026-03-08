import { describe, it, expect } from "vitest";
import { escapeRegex, escapeHtml } from "@/utils/strings";

describe("escapeRegex", () => {
  it("escapes all special regex characters", () => {
    const special = ".*+?^${}()|[]\\";
    const escaped = escapeRegex(special);
    expect(escaped).toBe("\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\");
  });

  it("returns empty string unchanged", () => {
    expect(escapeRegex("")).toBe("");
  });

  it("returns normal string with no special chars unchanged", () => {
    expect(escapeRegex("hello world")).toBe("hello world");
  });

  it("escapes special chars mixed with normal text", () => {
    expect(escapeRegex("price is $5.00")).toBe("price is \\$5\\.00");
  });

  it("produces a pattern that matches the literal input", () => {
    const literal = "file.(1)[2]";
    const re = new RegExp(escapeRegex(literal));
    expect(re.test(literal)).toBe(true);
    expect(re.test("fileX1Y2Z")).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("escapes < and >", () => {
    expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
  });

  it("escapes &", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("escapes all 5 HTML entities in one string", () => {
    expect(escapeHtml(`<a href="x" class='y'>&`)).toBe(
      "&lt;a href=&quot;x&quot; class=&#39;y&#39;&gt;&amp;",
    );
  });

  it("returns empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("returns already-safe string unchanged", () => {
    expect(escapeHtml("hello world 123")).toBe("hello world 123");
  });

  it("handles nested/double entities correctly", () => {
    expect(escapeHtml("&amp;")).toBe("&amp;amp;");
  });
});
