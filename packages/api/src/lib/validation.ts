export function normalizeLimit(raw: string | null, fallback: number, maximum = 50): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Math.min(Math.max(Number.isFinite(parsed) && parsed > 0 ? parsed : fallback, 1), maximum);
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function isLiturgicalBounds(tone: number, feastLevel: number, fastType: string): boolean {
  return Number.isInteger(tone) && tone >= 1 && tone <= 8 && Number.isInteger(feastLevel) && feastLevel >= 0 && feastLevel <= 6 && ["none", "strict", "fish", "wine-oil", "xerophagy"].includes(fastType);
}

export function boundedText(value: unknown, max: number, required = true): value is string {
  return typeof value === "string" && (!required || value.trim().length > 0) && value.length <= max;
}

export function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
