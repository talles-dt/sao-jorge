"use client";

import { useState, useEffect, useCallback } from "react";

export interface CelebrationModeProps {
  onToggle: (active: boolean) => void;
  isDark: boolean;
}

export default function CelebrationModeToggle({
  onToggle,
  isDark,
}: CelebrationModeProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    onToggle(active);
  }, [active, onToggle]);

  return (
    <button
      onClick={() => setActive(!active)}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-sm
        transition-all duration-200 border
        ${
          active
            ? "bg-lit-gold text-lit-bg border-lit-gold shadow-lg shadow-amber-900/20"
            : isDark
            ? "bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-500"
            : "bg-white text-stone-700 border-stone-300 hover:border-stone-500"
        }
      `}
      title={
        active
          ? "Modo celebração ativo — clique para voltar ao normal"
          : "Ativar modo celebração — texto grande para leitura no altar"
      }
    >
      <span className={`text-lg ${active ? "animate-pulse" : ""}`}>
        ☩
      </span>
      <span>{active ? "Celebração" : "Modo Celebração"}</span>
    </button>
  );
}
