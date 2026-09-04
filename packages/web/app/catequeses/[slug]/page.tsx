import Link from "next/link";
import { fetchCatechesisUnit } from "@/lib/api";

const FALLBACK_PARAMS = [{ slug: "_placeholder" }];

export async function generateStaticParams() {
  try {
    const response = await fetchCatechesisUnit("catequese-adultos");
    if (response.error || !response.data) {
      return FALLBACK_PARAMS;
    }
    return [{ slug: "catequese-adultos" }];
  } catch {
    return FALLBACK_PARAMS;
  }
}

function renderBody(body: string) {
  const lines = body.split("\n").filter((line) => line.trim() !== "");
  return (
    <div className="space-y-3 text-lit-text leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("- ")) {
          return (
            <li key={idx} className="list-disc ml-6">
              {trimmed.slice(2)}
            </li>
          );
        }
        if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed) || /^\d{1,2}º/.test(trimmed)) {
          return (
            <p key={idx} className="text-sm text-lit-gold">
              {trimmed}
            </p>
          );
        }
        return (
          <p key={idx} className={trimmed.endsWith(":") ? "font-display text-lg text-white mt-4" : ""}>
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export default async function CatechesisUnitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "_placeholder") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-center text-lit-muted py-8">
          Nenhuma unidade de catequese disponível no momento.
        </p>
      </div>
    );
  }

  const response = await fetchCatechesisUnit(slug);
  if (response.error || !response.data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-center text-lit-muted py-8">Unidade não encontrada.</p>
      </div>
    );
  }

  const unit = response.data as Record<string, unknown>;
  const title = String(unit.title ?? "Catequese");
  const description = String(unit.description ?? "");
  const body = String(unit.body ?? "");
  const lessons = Array.isArray(unit.lessons) ? (unit.lessons as Record<string, unknown>[]) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <header className="mb-2">
        <Link href="/catequeses" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition mb-4">
          ← Voltar às catequeses
        </Link>
        <h1 className="text-3xl font-display text-lit-gold">{title}</h1>
        {description ? (
          <p className="mt-2 text-lit-text-secondary">{description}</p>
        ) : null}
      </header>

      {body ? (
        <section className="card-liturgical">
          <h2 className="font-display text-xl text-lit-gold mb-4">Sobre</h2>
          {renderBody(body)}
        </section>
      ) : null}

      {lessons.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-lit-gold">Conteúdo</h2>
          <div className="space-y-4">
            {lessons.map((lesson) => {
              const lessonTitle = String(lesson.title ?? "");
              const lessonBody = String(lesson.body ?? "");
              return (
                <div key={String(lesson.slug)} className="card-liturgical">
                  <h3 className="font-display text-lg text-white">{lessonTitle}</h3>
                  {lessonBody ? <div className="mt-3">{renderBody(lessonBody)}</div> : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
