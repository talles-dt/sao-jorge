import { describe, expect, it } from "vitest";
import { boundedText, isBoundedStringArray, isEmail, isIsoDate, isLiturgicalBounds, isOneOf, normalizeLimit } from "./validation";

describe("API validation", () => {
  it("clamps public limits", () => {
    expect(normalizeLimit("0", 10)).toBe(10);
    expect(normalizeLimit("999", 10)).toBe(50);
    expect(normalizeLimit("3", 10)).toBe(3);
  });

  it("accepts only ISO date shape and bounded liturgical values", () => {
    expect(isIsoDate("2026-10-13")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("13/10/2026")).toBe(false);
    expect(isLiturgicalBounds(1, 0, "none")).toBe(true);
    expect(isLiturgicalBounds(9, 0, "none")).toBe(false);
    expect(isLiturgicalBounds(1, 7, "none")).toBe(false);
  });

  it("bounds administrative text and enumerations", () => {
    expect(boundedText("title", 10)).toBe(true);
    expect(boundedText("", 10)).toBe(false);
    expect(boundedText("too long", 3)).toBe(false);
    expect(isOneOf("published", ["draft", "published"] as const)).toBe(true);
    expect(isOneOf("deleted", ["draft", "published"] as const)).toBe(false);
  });

  it("accepts only bounded email addresses", () => {
    expect(isEmail("person@example.org")).toBe(true);
    expect(isEmail("not-an-email")).toBe(false);
    expect(isEmail("x".repeat(321) + "@example.org")).toBe(false);
  });

  it("bounds structured string arrays", () => {
    expect(isBoundedStringArray(["orthodox", "parish"], 20, 3)).toBe(true);
    expect(isBoundedStringArray(["x".repeat(21)], 20, 3)).toBe(false);
    expect(isBoundedStringArray(["a", 2], 20, 3)).toBe(false);
  });
});
