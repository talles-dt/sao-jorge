"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import CelebrationModeToggle from "./CelebrationToggle";
import type { ServiceSection } from "./page";
/* ── Speaker detection & colors ──────────────────────────────────────────── */

const SPEAKER_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  Sacerdote: { bg: "bg-amber-900/30", text: "text-amber-200", border: "border-amber-700/40", label: "Sacerdote" },
  "Diácono": { bg: "bg-emerald-900/30", text: "text-emerald-200", border: "border-emerald-700/40", label: "Diácono" },
  Coro: { bg: "bg-sky-900/30", text: "text-sky-200", border: "border-sky-700/40", label: "Coro" },
  Todos: { bg: "bg-violet-900/30", text: "text-violet-200", border: "border-violet-700/40", label: "Todos" },
};

function extractSpeaker(text: string): { speaker: string | null; body: string } {
  const match = text.match(/^\*\*(.+?):\*\*\s*(.*)/s);
  if (match) return { speaker: match[1].trim(), body: match[2] };
  return { speaker: null, body: text };
}

/* ── Inline markdown renderer ────────────────────────────────────────────── */

function inlineMarkdown(raw: string): string {
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const withItalic = withBold.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return withItalic;
}

/* ── Section renderers ───────────────────────────────────────────────────── */

function HeadingSection({ section, celebration }: { section: ServiceSection; celebration: boolean }) {
  return (
    <div className={`pt-8 pb-3 ${celebration ? "pt-14 pb-5" : ""}`}>
      <h2
        className={`font-display text-lit-gold leading-snug ${
          celebration ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
        }`}
      >
        {section.textPt}
      </h2>
    </div>
  );
}

function RubricSection({ section, celebration }: { section: ServiceSection; celebration: boolean }) {
  if (celebration) return null; // Hide rubrics in celebration mode
  return (
    <div className="py-3 pl-4 border-l-2 border-lit-rubric/40">
      <p
        className="text-lit-rubric italic font-ui text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: inlineMarkdown(section.textPt ?? "") }}
      />
    </div>
  );
}

function VerseSection({ section, celebration }: { section: ServiceSection; celebration: boolean }) {
  const { speaker, body } = extractSpeaker(section.textPt ?? "");
  const { speaker: speakerAr, body: bodyAr } = extractSpeaker(section.textAr ?? "");
  const speakerStyle = speaker ? SPEAKER_COLORS[speaker] : null;

  return (
    <div
      className={`py-3 ${
        celebration && speakerStyle
          ? `${speakerStyle.bg} ${speakerStyle.border} border-l-4 rounded-r-lg px-5 py-4 md:py-5`
          : celebration
          ? "px-2 py-4"
          : "px-1 py-3"
      }`}
    >
      {/* Speaker label */}
      {speaker && (
        <div
          className={`flex items-center gap-2 mb-2 ${
            celebration ? "mb-3" : ""
          }`}
        >
          <span
            className={`inline-flex items-center gap-1.5 font-ui uppercase tracking-wider ${
              celebration ? "text-xs font-bold" : "text-[10px] font-semibold"
            } ${
              speakerStyle
                ? `${speakerStyle.text}`
                : "text-stone-400"
            }`}
          >
            <span aria-hidden="true">
              {speaker === "Sacerdote" && "☨"}
              {speaker === "Diácono" && "✠"}
              {speaker === "Coro" && "♪"}
              {speaker === "Todos" && "◉"}
            </span>
            {speaker}
          </span>
        </div>
      )}

      {/* Columns: PT / AR / Transliteration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Portuguese */}
        <div className="min-w-0">
          {section.verseNumber && (
            <span
              className={`text-stone-500 font-ui shrink-0 ${
                celebration ? "text-sm" : "text-xs"
              }`}
            >
              [{section.verseNumber}]
            </span>
          )}
          <span
            className={`font-display leading-relaxed ${
              celebration ? "text-xl md:text-2xl leading-loose" : "text-base leading-relaxed"
            }`}
            dangerouslySetInnerHTML={{ __html: inlineMarkdown((body || section.textPt) ?? "") }}
          />
        </div>

        {/* Arabic */}
        {section.textAr && (
          <div
            className={`text-right leading-loose min-w-0 ${
              celebration ? "text-2xl md:text-3xl leading-[2.2]" : "text-xl"
            }`}
            style={{ fontFamily: "var(--font-arabic)", direction: "rtl" }}
            dangerouslySetInnerHTML={{
              __html: inlineMarkdown(speakerAr ? `**${speakerAr}:** ${bodyAr}` : section.textAr),
            }}
          />
        )}

        {/* Transliteration */}
        {section.textArTransliterated && (
          <p
            className={`italic font-ui leading-relaxed text-stone-500 min-w-0 ${
              celebration ? "text-base md:text-lg text-stone-400" : "text-sm"
            }`}
            dangerouslySetInnerHTML={{ __html: inlineMarkdown(section.textArTransliterated) }}
          />
        )}
      </div>
    </div>
  );
}

function NoteSection({ section, celebration }: { section: ServiceSection; celebration: boolean }) {
  if (celebration) return null;
  return (
    <div className="py-3 pl-4 border-l-2 border-stone-600/40">
      <p
        className="text-sm text-stone-500 italic font-ui"
        dangerouslySetInnerHTML={{ __html: "Nota: " + inlineMarkdown(section.textPt ?? "") }}
      />
    </div>
  );
}

function DynamicSlotSection({ section }: { section: ServiceSection }) {
  return (
    <div className="py-3 text-stone-500 italic text-sm font-ui">
      [Slot dinâmico: {section.id}]
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

interface ServiceViewProps {
  title: string;
  titleAr: string | null;
  sections: ServiceSection[];
}

export default function ServiceView({ title, titleAr, sections }: ServiceViewProps) {
  const [celebration, setCelebration] = useState(false);

  const handleToggle = useCallback((active: boolean) => {
    setCelebration(active);
    if (active) {
      document.documentElement.classList.add("celebration-mode");
    } else {
      document.documentElement.classList.remove("celebration-mode");
    }
  }, []);

  return (
    <div className={`space-y-0 ${celebration ? "celebration-active" : ""}`}>
      {/* Header */}
      <header className={`mb-8 ${celebration ? "text-center mb-12" : ""}`}>
        <div className={`flex items-center justify-between flex-wrap gap-3 ${celebration ? "justify-center" : ""}`}>
          {!celebration && (
            <Link
              href="/servicos"
              className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition text-sm font-ui"
            >
              ← Serviços
            </Link>
          )}
          <div className="flex items-center gap-3">
            {celebration && (
              <span className="text-xs font-ui text-stone-500 uppercase tracking-wider">
                Modo Celebração
              </span>
            )}
            <CelebrationModeToggle onToggle={handleToggle} isDark={true} />
          </div>
        </div>

        <h1
          className={`font-display text-lit-text leading-tight ${
            celebration
              ? "text-4xl md:text-5xl mt-8"
              : "text-3xl md:text-4xl mt-4"
          }`}
        >
          {title}
        </h1>
        {titleAr && (
          <p
            className={`text-lit-text/70 leading-loose ${
              celebration ? "text-2xl md:text-3xl mt-3" : "text-lg mt-2"
            }`}
            style={{ fontFamily: "var(--font-arabic)", direction: "rtl" }}
          >
            {titleAr}
          </p>
        )}
      </header>

      {/* Sections */}
      <div
        className={`rounded-xl ${
          celebration
            ? "bg-transparent"
            : "bg-stone-800/40 border border-stone-700/30"
        } ${celebration ? "" : "p-6 md:p-8"}`}
      >
        {/* Celebration mode: scrollable with max-width for readability */}
        <div className={celebration ? "max-w-3xl mx-auto" : ""}>
          {sections.map((section, index) => {
            switch (section.type) {
              case "heading":
                return <HeadingSection key={index} section={section} celebration={celebration} />;
              case "rubric":
                return <RubricSection key={index} section={section} celebration={celebration} />;
              case "verse":
                return <VerseSection key={index} section={section} celebration={celebration} />;
              case "note":
                return <NoteSection key={index} section={section} celebration={celebration} />;
              case "dynamic-slot":
                return <DynamicSlotSection key={index} section={section} />;
              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* Footer navigation */}
      {!celebration && (
        <div className="mt-8 pt-6 border-t border-stone-700/40 flex justify-center">
          <Link
            href="/servicos"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition font-ui text-sm"
          >
            ← Voltar aos serviços
          </Link>
        </div>
      )}
    </div>
  );
}
