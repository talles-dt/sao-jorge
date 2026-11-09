import { describe, expect, it } from "vitest";

import { corsHeaders } from "./types";

describe("corsHeaders", () => {
  it("accepts the origin configured for the current environment", () => {
    const stagingOrigin = "https://preview.example.test";
    const request = new Request("https://api.example.test/modules", {
      headers: { Origin: stagingOrigin },
    });

    expect(corsHeaders(request, stagingOrigin)["Access-Control-Allow-Origin"]).toBe(stagingOrigin);
  });

  it("falls back to the configured origin for an untrusted request", () => {
    const stagingOrigin = "https://preview.example.test";
    const request = new Request("https://api.example.test/modules", {
      headers: { Origin: "https://untrusted.example.test" },
    });

    expect(corsHeaders(request, stagingOrigin)["Access-Control-Allow-Origin"]).toBe(stagingOrigin);
  });
});
