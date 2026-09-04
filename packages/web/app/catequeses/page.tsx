import Link from "next/link";
import { fetchCatechesis } from "@/lib/api";

export const metadata = {
  title: "Catequeses — Paróquia São Jorge",
  description: "Programa de Catequese de Adultos da Paróquia Ortodoxa Antioquina São Jorge.",
};

export default async function CatequesesPage() {
  const response = await fetchCatechesis();
  const units = response.error ? [] : (response.data ?? []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-display text-lit-gold">Catequeses</h1>
        <p className="mt-2 text-lit-text-secondary">
          Formação para adultos na fé ortodoxa
        </p>
      </header>

      {!units.length ? (
        <p className="text-center text-lit-muted py-8">
          Nenhuma unidade disponível no momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {units.map((unit: Record<string, unknown>) => {
            const slug = String(unit.slug ?? "");
            const title = String(unit.title ?? "");
            const description = String(unit.description ?? "");
            return (
              <Link
                key={slug}
                href={`/catequeses/${slug}`}
                className="card-liturgical block"
              >
                <h2 className="font-display text-xl text-lit-gold">{title}</h2>
                {description ? (
                  <p className="mt-2 text-sm text-lit-text-secondary">{description}</p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-2 text-sm text-lit-gold">
                  Ver conteúdo →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
