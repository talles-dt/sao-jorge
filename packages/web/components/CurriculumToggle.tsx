"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const GuiaCatecumenal = dynamic(() => import("@/components/GuiaCatecumenal"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-lit-gold font-display text-lg">Carregando guia...</div>
    </div>
  ),
});

/**
 * Toggle between the database-backed curriculum (default) and the
 * interactive Guia Catecumenal with quizzes and dark mode.
 * Renders the curriculum by default; switches in the client-side guide
 * without a page reload.
 */
export default function CurriculumToggle() {
  const [mode, setMode] = useState<"curriculum" | "guide">("curriculum");

  if (mode === "guide") {
    return (
      <div className="fixed inset-0 z-50 bg-lit-bg overflow-auto pt-14 md:pt-0">
        <button
          onClick={() => setMode("curriculum")}
          className="fixed top-3 left-3 z-[200] bg-lit-gold text-lit-bg font-semibold px-4 py-2 rounded-lg shadow-lg"
        >
          Voltar ao currículo
        </button>
        <GuiaCatecumenal />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setMode("guide")}
        className="px-4 py-2 bg-lit-gold text-lit-bg font-semibold rounded-lg hover:opacity-90 transition"
      >
        Guia Catecumenal Interativo
      </button>
    </div>
  );
}
