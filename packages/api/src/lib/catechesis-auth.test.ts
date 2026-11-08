import { describe, expect, it } from "vitest";
import { randomToken, sessionCookie, sha256 } from "./catechesis-auth";

describe("catechesis authentication", () => {
  it("creates opaque unique tokens and stable hashes", async () => {
    const first = randomToken();
    const second = randomToken();
    expect(first).not.toBe(second);
    expect(first).not.toContain("=");
    expect(await sha256(first)).toHaveLength(64);
    expect(await sha256(first)).toBe(await sha256(first));
  });

  it("uses a secure restricted session cookie", () => {
    const cookie = sessionCookie("opaque", 60);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Max-Age=60");
  });
});
