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
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  useEffect(() => {
    onToggle(active);
  }, [active, onToggle]);

  // Keep screen awake during celebration mode
  useEffect(() => {
    if (!active) {
      setWakeLockActive(false);
      return;
    }

    if (!("wakeLock" in navigator)) {
      setWakeLockSupported(false);
      return;
    }

    setWakeLockSupported(true);

    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        wakeLock = await (navigator as any).wakeLock.request("screen");
        setWakeLockActive(true);
      } catch {
        setWakeLockActive(false);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && active) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
      setWakeLockActive(false);
    };
  }, [active]);

  const handleToggle = useCallback(() => {
    setActive((prev) => !prev);
  }, []);

  return (
    <button
      onClick={handleToggle}
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
      {active && wakeLockSupported && (
        <span
          className="ml-1 inline-flex h-2 w-2 rounded-full bg-green-400"
          title="Tela ativa"
        />
      )}
    </button>
  );
}
