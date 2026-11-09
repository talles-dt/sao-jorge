import { describe, expect, it } from "vitest";

import { recordingPublication } from "./catechesis-recording";

const now = new Date("2026-11-09T12:00:00.000Z");

describe("recordingPublication", () => {
  it("preserves the original 30-day window when the recording is unchanged", () => {
    const result = recordingPublication({
      uid: "video-1",
      publishedAt: "2026-11-01T12:00:00.000Z",
      expiresAt: "2026-12-01T12:00:00.000Z",
    }, "video-1", now);

    expect(result).toEqual({
      publishedAt: "2026-11-01T12:00:00.000Z",
      expiresAt: "2026-12-01T12:00:00.000Z",
      changed: false,
    });
  });

  it("starts a new window only for a newly published recording", () => {
    expect(recordingPublication({ uid: "video-1", publishedAt: null, expiresAt: null }, "video-2", now)).toEqual({
      publishedAt: "2026-11-09T12:00:00.000Z",
      expiresAt: "2026-12-09T12:00:00.000Z",
      changed: true,
    });
  });

  it("clears the publication window when the recording is removed", () => {
    expect(recordingPublication({ uid: "video-1", publishedAt: "a", expiresAt: "b" }, null, now)).toEqual({
      publishedAt: null,
      expiresAt: null,
      changed: true,
    });
  });
});
