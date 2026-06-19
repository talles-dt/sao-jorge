// ☩ São Jorge V2 — Scraper module
// Handles liturgical day scraping from orthocal.info and translation via Workers AI

import type { Env } from "../lib/types";

interface OrthocalResponse {
  titles?: string[];
  summary_title?: string;
  feast_level?: number;
  feast_level_description?: string;
  feasts?: string[] | null;
  tone?: number;
  fast_level?: number;
  fast_level_desc?: string;
  fast_exception?: number;
  saints?: string[];
  readings?: Array<{
    source: string;
    book: string;
    description: string;
    display: string;
    short_display: string;
  }>;
}

interface RawDayData {
  date: string;
  feastLevel: number;
  feastNameEn: string | null;
  titleEn: string | null;
  saintsList: string | null;
  epistleRef: string | null;
  gospelRef: string | null;
  tone: number;
  fastType: string;
}

// ─── Translation: EN → PT-BR via Workers AI ─────────────────────────────────

export async function translateToPtBr(
  env: Env,
  texts: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (!texts.length) return result;

  const prompt = `You are an expert translator for Eastern Orthodox Christian liturgical texts from English to Brazilian Portuguese (PT-BR).

Rules:
- Translate proper names of saints using their established Portuguese forms (e.g., "John" → "João", "Nicholas" → "Nicolau", "Basil" → "Basílio", "George" → "Jorge")
- Keep liturgical terminology in its Portuguese Orthodox form (e.g., "Hieromartyr" → "Hieromártir", "Venerable" → "Venerável", "Equal-to-the-Apostles" → "Igual-aos-Apóstolos")
- "Apostles Fast" → "Jejum dos Apóstolos", "Great Lent" → "Grande Quaresma"
- For feast descriptions like "Wednesday of the 2nd week after Pentecost" → "Quarta-feira da 2ª semana após Pentecostes"
- Preserve semicolons as separators when multiple saints are listed
- Do NOT add explanations or notes — output ONLY the translations

Translate each line below. Output one line per input line, in the same order:

${texts.join("\n")}`;

  try {
    const aiResult: unknown = await env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      { prompt, max_tokens: 512, temperature: 0.1 },
    );

    const responseText = (
      (aiResult as { response?: string; generated_text?: string }).response ??
      (aiResult as { generated_text?: string }).generated_text ??
      ""
    ).trim();
    const lines = responseText
      .split("\n")
      .map((l: string) => l.trim())
      .filter(Boolean);

    for (let i = 0; i < texts.length && i < lines.length; i++) {
      result.set(texts[i], lines[i]);
    }

    // If AI returned fewer lines than inputs, fill remaining with originals
    for (let i = lines.length; i < texts.length; i++) {
      result.set(texts[i], texts[i]);
    }
  } catch (e: unknown) {
    console.error("[translate] Workers AI error:", (e as Error).message);
    for (const t of texts) result.set(t, t);
  }

  return result;
}

// ─── Scraping: orthocal.info ──────────────────────────────────────────────────

async function fetchOrthocal(date: string): Promise<RawDayData> {
  const [year, month, day] = date.split("-");
  const url = `https://orthocal.info/api/gregorian/${year}/${month}/${day}/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`orthocal ${date}: ${res.status}`);
  const data = (await res.json()) as OrthocalResponse;

  const fastTypeMap: Record<number, string> = {
    0: "none",
    1: "wine-oil",
    2: "fish",
    3: "wine-oil",
    4: "strict",
    7: "xerophagy",
    11: "none",
    49: "none",
  };

  const feastLevel = data.feast_level ?? 0;
  const feastNameEn =
    data.feasts?.[0] ?? data.summary_title ?? data.titles?.[0] ?? null;
  const titleEn = data.titles?.[0] ?? null;
  const saintsList = data.saints?.length
    ? data.saints.join("; ")
    : null;

  const readings = data.readings || [];
  const epistleReading = readings.find(
    (r) => r.source.toLowerCase() === "epistle",
  );
  const gospelReading = readings.find(
    (r) => r.source.toLowerCase() === "gospel",
  );

  return {
    date,
    feastLevel,
    feastNameEn,
    titleEn,
    saintsList,
    epistleRef: epistleReading?.display ?? null,
    gospelRef: gospelReading?.display ?? null,
    tone: data.tone ?? 1,
    fastType: fastTypeMap[data.fast_exception ?? 0] ?? "none",
  };
}

// ─── Main scraper ─────────────────────────────────────────────────────────────

export async function runScraper(env: Env): Promise<void> {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
  const dates: string[] = [];
  for (let i = 0; i < 8; i++) {
    // Parse today's date in Brasília timezone to avoid UTC midnight edge case
    const [y, m, d] = today.split("-").map(Number);
    const date = new Date(y, m - 1, d + i); // local date construction, no UTC ambiguity
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    dates.push(dateStr);
  }

  // Fetch all orthocal data in parallel
  const fetchResults = await Promise.allSettled(
    dates.map((d) => fetchOrthocal(d)),
  );

  const rawDays: RawDayData[] = [];
  for (let i = 0; i < dates.length; i++) {
    const result = fetchResults[i];
    if (result.status === "rejected") {
      console.error(`[scraper] Failed ${dates[i]}:`, result.reason);
      continue;
    }
    rawDays.push(result.value);
  }

  // Batch-translate all feast names and saints in a single LLM call
  const allTexts: string[] = [];
  const textToDayIndex: Array<{
    textIdx: number;
    dayIdx: number;
    field: "feast" | "saints";
  }> = [];

  for (let i = 0; i < rawDays.length; i++) {
    const day = rawDays[i];
    if (day.feastNameEn) {
      textToDayIndex.push({
        textIdx: allTexts.length,
        dayIdx: i,
        field: "feast",
      });
      allTexts.push(day.feastNameEn);
    }
    if (day.saintsList) {
      textToDayIndex.push({
        textIdx: allTexts.length,
        dayIdx: i,
        field: "saints",
      });
      allTexts.push(day.saintsList);
    }
  }

  const translations =
    allTexts.length > 0
      ? await translateToPtBr(env, allTexts)
      : new Map<string, string>();

  // Assemble rows with translations
  const now = new Date().toISOString();
  for (let i = 0; i < rawDays.length; i++) {
    const day = rawDays[i];
    let feastNamePt = day.feastNameEn; // fallback
    let saintsPt = day.saintsList; // fallback

    for (const mapping of textToDayIndex) {
      if (mapping.dayIdx !== i) continue;
      const translated = translations.get(allTexts[mapping.textIdx]);
      if (mapping.field === "feast" && translated) feastNamePt = translated;
      if (mapping.field === "saints" && translated) saintsPt = translated;
    }

    await env.DB
      .prepare(
        `INSERT OR REPLACE INTO liturgical_days
      (date, tone_of_week, fast_type, feast_level, feast_name_pt, feast_name_en,
      epistle_ref, gospel_ref, enrichment, source, status, scraped_at, approved_at, approved_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        day.date,
        day.tone,
        day.fastType,
        day.feastLevel,
        feastNamePt,
        day.titleEn,
        day.epistleRef,
        day.gospelRef,
        saintsPt,
        "orthocal",
        "approved",
        now,
        now,
        "scraper-auto",
      )
      .run();
    console.log(`[scraper] ✓ ${day.date} — ${feastNamePt ?? "Féria"}`);
  }
}
