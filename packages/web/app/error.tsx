"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto max-w-6xl px-4 py-16 text-center" role="alert"><p className="text-stone-300">Não foi possível carregar esta página.</p><button onClick={reset} className="mt-4 rounded bg-amber-700 px-4 py-2 text-white">Tentar novamente</button></main>;
}
