"use client";

import { useEffect } from "react";

export default function BuzzsproutPlayer() {
  useEffect(() => {
    const container = document.getElementById("buzzsprout-large-player");
    if (!container) return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.charset = "utf-8";
    script.src =
      "https://www.buzzsprout.com/2599031.js?container_id=buzzsprout-large-player&player=large";
    container.appendChild(script);

    return () => {
      container.removeChild(script);
    };
  }, []);

  return <div id="buzzsprout-large-player" className="w-full max-w-3xl mx-auto" />;
}
