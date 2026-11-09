const RECORDING_ACCESS_MS = 30 * 86400000;

export type RecordingPublication = {
  publishedAt: string | null;
  expiresAt: string | null;
  changed: boolean;
};

export function recordingPublication(
  current: { uid: string | null; publishedAt: string | null; expiresAt: string | null },
  nextUid: string | null,
  now = new Date(),
): RecordingPublication {
  if (!nextUid) return { publishedAt: null, expiresAt: null, changed: current.uid !== null };

  if (current.uid === nextUid && current.publishedAt && current.expiresAt) {
    return { publishedAt: current.publishedAt, expiresAt: current.expiresAt, changed: false };
  }

  return {
    publishedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + RECORDING_ACCESS_MS).toISOString(),
    changed: current.uid !== nextUid || !current.publishedAt || !current.expiresAt,
  };
}
