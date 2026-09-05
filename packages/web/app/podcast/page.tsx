import Link from "next/link";
import { fetchPodcast } from "@/lib/api";

export const metadata = {
  title: "Podcast — No Caminho da Vida | Paróquia São Jorge",
  description:
    "Episódios do podcast da Paróquia São Jorge. Reflexões ortodoxas sobre a fé, tradição e vida espiritual.",
};

interface PodcastEpisode {
  guid: string;
  title: string;
  description: string | null;
  published_at: string;
  duration_sec: number | null;
  spotify_url: string | null;
  buzzsprout_url: string | null;
}

function formatDuration(sec: number | null): string {
  if (!sec || sec <= 0) return "";
  const min = Math.floor(sec / 60);
  const s = sec % 60;
  return `${min}:${s.toString().padStart(2, "0")} min`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

export default async function PodcastPage() {
  const response = await fetchPodcast();

  if (response.error || !response.data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-center text-lit-muted py-8">
          Não foi possível carregar os episódios do podcast no momento.
        </p>
      </div>
    );
  }

  const episodes = (response.data ?? []) as unknown as PodcastEpisode[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <header>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition mb-4"
        >
          ← Voltar à página inicial
        </Link>
        <h1 className="text-3xl font-display text-lit-gold">Podcast</h1>
        <p className="mt-2 text-lit-text-secondary">
          "No Caminho da Vida" — Reflexões ortodoxas semanais
        </p>
      </header>

      <div className="space-y-4">
        {episodes.map((ep) => (
          <article key={ep.guid} className="card-liturgical">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2">
              <h2 className="font-display text-lg text-white">{ep.title}</h2>
              <div className="flex items-center gap-4 text-xs text-stone-400">
                <time dateTime={ep.published_at}>
                  {new Date(ep.published_at).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                {ep.duration_sec && (
                  <span className="text-stone-500">{formatDuration(ep.duration_sec)}</span>
                )}
              </div>
            </div>

            {ep.description && (
              <p className="text-sm text-stone-300 mb-3 line-clamp-3">
                {stripHtml(ep.description)}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {ep.spotify_url && (
                <Link
                  href={ep.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs px-3 py-1 bg-[#1DB954] text-white rounded hover:opacity-90 transition"
                >
                  Spotify
                </Link>
              )}
              {ep.buzzsprout_url && (
                <Link
                  href={ep.buzzsprout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs px-3 py-1 bg-lit-gold text-lit-bg rounded hover:opacity-90 transition"
                >
                  Buzzsprout
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
