import Link from "next/link";
import { fetchDay, fetchBulletins, fetchPosts } from "@/lib/api";

const FAST_LABELS: Record<string, string> = {
  none: "Nenhum jejum",
  strict: "Jejum estrito",
  fish: "Peixe permitido",
  "wine-oil": "Vinho e azeite",
  xerophagy: "Xerofagia",
};

export default async function HomePage() {
  const [dayRes, bulletinsRes, postsRes] = await Promise.all([
    fetchDay(),
    fetchBulletins(3),
    fetchPosts(3),
  ]);

  const day = dayRes.data;

  return (
    <div className="space-y-8">
      {/* Hero + Today's Liturgy */}
      <section className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-lit-parchment text-lit-bg rounded-lg p-6 relative overflow-hidden">
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${
              (day?.feastLevel ?? 0) >= 4
                ? "bg-amber-400"
                : (day?.feastLevel ?? 0) >= 2
                ? "bg-amber-700"
                : "bg-stone-600"
            }`}
          />
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
                {day.feastNamePt ?? "Féria"}
              </h1>
              {day.feastNameAr && (
                <p className="text-right text-lg mt-1 leading-loose" style={{ fontFamily: "'Noto Naskh Arabic', serif", direction: "rtl" }}>
                  {day.feastNameAr}
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-700 rounded-full text-xs font-semibold text-white">
                  Tom {day.toneOfWeek}
                </span>
                <span className="text-sm text-stone-600">{FAST_LABELS[day.fastType]}</span>
              </div>
              {(day?.epistleRef || day?.gospelRef) && (
                <div className="mt-4 text-sm text-stone-600">
                  {day.epistleRef && <p>Epístola: {day.epistleRef}</p>}
                  {day.gospelRef && <p>Evangelho: {day.gospelRef}</p>}
                </div>
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
            href="/servicos/divina-liturgia-sao-joao-crisostomo"
            className="block w-full bg-lit-red hover:bg-lit-red-dark text-white text-center py-3 rounded-lg font-display transition font-semibold"
          >
            ☩ Divina Liturgia
          </Link>
          <Link
            href="/servicos"
            className="block w-full bg-stone-700 hover:bg-stone-600 text-white text-center py-3 rounded-lg font-ui text-sm transition"
          >
            Todos os serviços
          </Link>
          <Link
            href="/catequeses"
            className="block w-full bg-stone-800 hover:bg-stone-700 text-white text-center py-3 rounded-lg font-ui text-sm transition"
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
            <h3 className="text-lg font-display text-amber-500">Avisos da Paróquia</h3>
            <Link href="/boletim" className="text-sm text-stone-400 hover:text-white transition">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {bulletinsRes.data?.length ? (
              bulletinsRes.data.map((b: any) => (
                <div
                  key={b.id}
                  className="bg-stone-800/50 rounded-lg p-4 hover:bg-stone-800 transition"
                >
                  <span className="text-xs text-stone-400 font-ui uppercase tracking-wide">
                    {b.category}
                  </span>
                  <h4 className="font-display mt-1 text-white">{b.title}</h4>
                  <p className="text-sm text-stone-300 mt-1 line-clamp-2">{b.body}</p>
                </div>
              ))
            ) : (
              <p className="text-stone-400 italic text-sm">Nenhum aviso no momento.</p>
            )}
          </div>
        </section>

        {/* Blog */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display text-amber-500">Blog</h3>
            <Link href="/blog" className="text-sm text-stone-400 hover:text-white transition">
              Ver artigos →
            </Link>
          </div>
          <div className="space-y-3">
            {postsRes.data?.length ? (
              postsRes.data.map((p: any) => (
                <Link
                  href={`/blog/${p.slug}`}
                  key={p.slug}
                  className="block bg-stone-800/50 rounded-lg p-4 hover:bg-stone-800 transition"
                >
                  <span className="text-xs text-stone-400 font-ui uppercase tracking-wide">
                    {p.category}
                  </span>
                  <h4 className="font-display mt-1 text-white">{p.title}</h4>
                  <p className="text-sm text-stone-300 mt-1 line-clamp-2">{p.excerpt}</p>
                </Link>
              ))
            ) : (
              <p className="text-stone-400 italic text-sm">Nenhum artigo publicado ainda.</p>
            )}
          </div>
        </section>
      </div>

      {/* Podcast preview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-display text-amber-500">Podcast</h3>
          <Link href="/podcast" className="text-sm text-stone-400 hover:text-white transition">
            Ver todos →
          </Link>
        </div>
        <div className="bg-stone-800/30 rounded-lg p-6 text-center text-stone-400">
          <p>Em breve: episódios do podcast “No Caminho da Vida”</p>
        </div>
      </section>
    </div>
  );
}
