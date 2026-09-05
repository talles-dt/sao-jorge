import Link from "next/link";
import { fetchDay, fetchBulletins, fetchPosts, fetchPodcast } from "@/lib/api";
import BuzzsproutPlayer from "@/components/BuzzsproutPlayer";

const FAST_LABELS: Record<string, string> = {
  none: "Nenhum jejum",
  strict: "Jejum estrito",
  fish: "Peixe permitido",
  "wine-oil": "Vinho e azeite",
  xerophagy: "Xerofagia",
};

export default async function HomePage() {
  const [dayRes, bulletinsRes, postsRes, podcastRes] = await Promise.all([
    fetchDay(),
    fetchBulletins(3),
    fetchPosts(3),
    fetchPodcast(),
  ]);

  const day = dayRes.data;

  return (
    <div className="space-y-8 lit-grain">
      {/* Hero + Today&apos;s Liturgy */}
      <section className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-lit-parchment text-lit-bg rounded-lg p-6 relative overflow-hidden lit-card">
          {/* Gold accent bar */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${
              (day?.feast_level ?? 0) >= 4
                ? "bg-amber-400"
                : (day?.feast_level ?? 0) >= 2
                ? "bg-amber-700"
                : "bg-stone-600"
            }`}
          />

          {/* Decorative cross */}
          <div className="absolute top-3 right-4 text-2xl opacity-10 select-none">☩</div>

          <h2 className="text-sm uppercase tracking-widest text-stone-500 font-ui mb-2">
            Hoje litúrgico
          </h2>

          {day ? (
            <>
              <time className="text-xs text-stone-500 font-ui">
                {new Date(day.date + "T00:00:00").toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h1 className="text-2xl md:text-3xl font-display mt-2 leading-tight">
                {day.feast_name_pt ?? "Féria"}
              </h1>
              {day.feast_name_en && (
                <p className="text-sm text-stone-500 mt-1 italic">
                  {day.feast_name_en}
                </p>
              )}
              {day.feast_name_ar && (
                <p
                  className="text-right text-lg mt-1 leading-loose"
                  style={{
                    fontFamily: "'Noto Naskh Arabic', serif",
                    direction: "rtl",
                  }}
                >
                  {day.feast_name_ar}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-700 rounded-full text-xs font-semibold text-white">
                  Tom {day.tone_of_week}
                </span>
                <span className="text-sm text-stone-600">
                  {FAST_LABELS[day.fast_type] ?? "—"}
                </span>
                {typeof day.feast_level !== "undefined" && (
                  <span className="text-xs text-stone-500">
                    Nível {day.feast_level}
                  </span>
                )}
              </div>
              {(day.epistle_ref || day.gospel_ref) && (
                <div className="mt-4 text-sm text-stone-600 space-y-1">
                  {day.epistle_ref && <p>Epístola: {day.epistle_ref}</p>}
                  {day.gospel_ref && <p>Evangelho: {day.gospel_ref}</p>}
                </div>
              )}
              {day.saint_slug && (
                <p className="mt-2 text-xs text-stone-500">
                  Santo: {day.saint_slug}
                </p>
              )}
            </>
          ) : (
            <div className="text-stone-600 italic">
              Dados litúrgicos do dia em preparação…
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="w-full md:w-64 space-y-3">
          <Link
            href="/servicos/divina-liturgia-crisostomo"
            className="block w-full bg-lit-red hover:bg-lit-red-dark text-white text-center py-3 rounded-lg font-display transition-all duration-300 font-semibold lit-card"
          >
            ☩ Divina Liturgia
          </Link>
          <Link
            href="/servicos"
            className="block w-full bg-stone-700 hover:bg-stone-600 text-white text-center py-3 rounded-lg font-ui text-sm transition-all duration-300 lit-card"
          >
            Todos os serviços
          </Link>
          <Link
            href="/catequeses"
            className="block w-full bg-stone-800 hover:bg-stone-700 text-white text-center py-3 rounded-lg font-ui text-sm transition-all duration-300 lit-card"
          >
            Catequeses
          </Link>
        </div>
      </section>

      {/* Two-column: Bulletins + Blog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bulletins */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display text-amber-500">
              Avisos da Paróquia
            </h3>
            <Link
              href="/boletim"
              className="text-sm text-stone-400 hover:text-white transition"
            >
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {bulletinsRes.data?.length ? (
              bulletinsRes.data.map((b: any) => (
                <div
                  key={b.id}
                  className="bg-stone-800/50 rounded-lg p-4 hover:bg-stone-800 transition-all duration-300 lit-card"
                >
                  <span className="text-xs text-stone-400 font-ui uppercase tracking-wide">
                    {b.category}
                  </span>
                  <h4 className="font-display mt-1 text-white">{b.title}</h4>
                  <p className="text-sm text-stone-300 mt-1 line-clamp-2">
                    {b.body}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-stone-400 italic text-sm">
                Nenhum aviso no momento.
              </p>
            )}
          </div>
        </section>

        {/* Blog */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display text-amber-500">Blog</h3>
            <Link
              href="/blog"
              className="text-sm text-stone-400 hover:text-white transition"
            >
              Ver artigos →
            </Link>
          </div>
          <div className="space-y-3">
            {postsRes.data?.length ? (
              postsRes.data.map((p: any) => (
                <Link
                  href={`/blog/${p.slug}`}
                  key={p.slug}
                  className="block bg-stone-800/50 rounded-lg p-4 hover:bg-stone-800 transition-all duration-300 lit-card"
                >
                  <span className="text-xs text-stone-400 font-ui uppercase tracking-wide">
                    {p.category}
                  </span>
                  <h4 className="font-display mt-1 text-white">{p.title}</h4>
                  <p className="text-sm text-stone-300 mt-1 line-clamp-2">
                    {p.excerpt}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-stone-400 italic text-sm">
                Nenhum artigo publicado ainda.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Podcast preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display text-amber-500">Podcast</h3>
          <Link
            href="/podcast"
            className="text-sm text-stone-400 hover:text-white transition"
          >
            Ver todos →
          </Link>
        </div>
        <div className="space-y-3">
          {podcastRes.data?.length ? (
            podcastRes.data.slice(0, 3).map((p: any) => (
              <div
                key={p.guid}
                className="bg-stone-800/50 rounded-lg p-4 hover:bg-stone-800 transition-all duration-300 lit-card"
              >
                <span className="text-xs text-stone-400 font-ui uppercase tracking-wide">
                  {new Date(p.published_at).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <h4 className="font-display mt-1 text-white">{p.title}</h4>
                {p.duration_sec && (
                  <span className="text-xs text-stone-500">
                    {(p.duration_sec / 60).toFixed(1)} min
                  </span>
                )}
                <div
                  className="text-sm text-stone-300 mt-1 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: (p.description ?? "").replace(/<[^>]+>/g, "").substring(0, 120) + "…",
                  }}
                />
              </div>
            ))
          ) : (
            <div className="bg-stone-800/30 rounded-lg p-6 text-center text-stone-400">
              <p>Em breve: episódios do podcast &ldquo;No Caminho da Vida&rdquo;</p>
            </div>
          )}
        </div>

        {/* Buzzsprout player embed */}
        <div className="mt-6 pt-6 border-t border-stone-700">
          <BuzzsproutPlayer />
        </div>
      </section>
    </div>
  );
}
