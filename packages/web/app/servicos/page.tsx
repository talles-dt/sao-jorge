import Link from "next/link";
import { fetchServiceCatalog } from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
  liturgia: "Liturgia",
  oficio: "Ofício Divino",
  oracoes: "Orações",
  sacramento: "Sacramento",
  devocao: "Devoção",
};

const CATEGORY_ICONS: Record<string, string> = {
  liturgia: "☩",
  oficio: "☩",
  oracoes: "✞",
  sacramento: "♱",
  devocao: "✞",
};

export default async function ServicesPage() {
  const services = await fetchServiceCatalog();

  const items = services.data && services.data.length > 0
    ? services.data
    : [];

  // Group by category
  const grouped = items.reduce((acc: Record<string, any[]>, service: any) => {
    const cat = service.category ?? service.categoria ?? "outros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {});

  // Sort order for categories
  const categoryOrder = ["liturgia", "oficio", "oracoes", "sacramento", "devocao", "outros"];
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <div className="space-y-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-display text-lit-text">Serviços Litúrgicos</h1>
        <p className="text-center text-stone-400 mt-2 font-ui">
          Selecione um serviço para ver seus textos e estruturas
        </p>
      </header>

      {sortedCategories.map((category) => (
        <section key={category}>
          <h2 className="text-xl font-display text-lit-gold mb-4 border-b border-stone-700/50 pb-2">
            {CATEGORY_ICONS[category] ?? "✞"} {CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[category].map((service: any) => {
              const title = service.title_pt ?? service.titlePt ?? service.slug;
              const titleAr = service.title_ar ?? service.titleAr;
              const subcategory = service.subcategory ?? service.subcategoria;

              return (
                <Link
                  key={service.slug}
                  href={`/servicos/${service.slug}`}
                  className="group"
                >
                  <div className="bg-lit-parchment/90 hover:bg-lit-parchment rounded-lg p-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg border border-stone-600/20 h-full flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-display text-lg text-lit-bg leading-snug">
                        {title}
                      </h3>
                      {titleAr && (
                        <span
                          className="text-sm text-lit-bg/60 shrink-0"
                          style={{ fontFamily: "'Noto Naskh Arabic', serif", direction: "rtl" }}
                        >
                          {titleAr}
                        </span>
                      )}
                    </div>
                    {subcategory && (
                      <p className="text-stone-500 text-sm mt-2 font-ui">
                        {subcategory}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {items.length === 0 && (
        <p className="text-stone-500 text-center py-8">
          Nenhum serviço encontrado.
        </p>
      )}
    </div>
  );
}
