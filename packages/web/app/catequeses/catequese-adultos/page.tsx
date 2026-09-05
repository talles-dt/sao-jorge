import Link from "next/link";
import { useState } from "react";
import { fetchCatechesisUnit } from "@/lib/api";
import MarkdownBody from "@/components/MarkdownBody";
import CatechesisSignupForm from "@/components/CatechesisSignupForm";
import CurriculumToggle from "@/components/CurriculumToggle";

const UNIT_SLUG = "catequese-adultos";
const FASE_I_LAST_ORDER = 18;

export const metadata = {
  title: "Catequese de Adultos — Paróquia São Jorge",
  description:
    "Um caminho de cura da alma, iluminação do nous e transformação em Cristo.",
};

interface Lesson {
  slug: string;
  title: string;
  order_index: number;
  body: string;
  group_label: string | null;
}

function groupLessons(lessons: Lesson[]) {
  const groups: { label: string; lessons: Lesson[] }[] = [];
  for (const lesson of lessons) {
    const label = lesson.group_label ?? "Encontros";
    let group = groups.find((g) => g.label === label);
    if (!group) {
      group = { label, lessons: [] };
      groups.push(group);
    }
    group.lessons.push(lesson);
  }
  return groups;
}

export default async function CatequeseAdultosPage() {
  const response = await fetchCatechesisUnit(UNIT_SLUG);

  if (response.error || !response.data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-center text-lit-muted py-8">
          Não foi possível carregar a catequese no momento.
        </p>
      </div>
    );
  }

  const unit = response.data as Record<string, unknown>;
  const title = String(unit.title ?? "Catequese de Adultos");
  const description = String(unit.description ?? "");
  const body = String(unit.body ?? "");
  const lessons = (Array.isArray(unit.lessons) ? unit.lessons : []) as Lesson[];

  const faseI = lessons.filter((l) => l.order_index <= FASE_I_LAST_ORDER);
  const faseII = lessons.filter((l) => l.order_index > FASE_I_LAST_ORDER);
  const faseIGroups = groupLessons(faseI);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <Link
          href="/catequeses"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition mb-4"
        >
          ← Voltar às catequeses
        </Link>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <h1 className="text-3xl font-display text-lit-gold">{title}</h1>
        </div>
        {/* Toggle: Curriculum versus Interactive Guide */}
        <CurriculumToggle />
        {description ? <p className="mt-2 text-lit-text-secondary">{description}</p> : null}
      </header>

      {/* The interactive guide is rendered client-side only */}
      {body ? (
        <section className="card-liturgical">
          <h2 className="font-display text-xl text-lit-gold mb-4">Sobre</h2>
          <div className="text-lit-bg">
            <MarkdownBody body={body} />
          </div>
        </section>
      ) : null}

      {faseIGroups.length > 0 ? (
        <section className="space-y-6">
          <h2 className="font-display text-2xl text-lit-gold">
            Fase I: Fundamentos ({faseI.length} encontros)
          </h2>
          {faseIGroups.map((group) => (
            <div key={group.label} className="space-y-4">
              <h3 className="font-display text-lg text-white border-b border-stone-700 pb-2">
                {group.label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.lessons.map((lesson) => (
                  <details key={lesson.slug} className="card-liturgical">
                    <summary className="font-display text-base cursor-pointer">
                      {lesson.title}
                    </summary>
                    <div className="mt-3 text-sm">
                      <MarkdownBody body={lesson.body} />
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {faseII.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-lit-gold">
            Fase II: Catecumenato Intensivo Quaresmal ({faseII.length} encontros)
          </h2>
          <div className="space-y-3">
            {faseII.map((lesson) => (
              <details key={lesson.slug} className="card-liturgical">
                <summary className="font-display text-base cursor-pointer">
                  {lesson.title}
                </summary>
                <div className="mt-3 text-sm">
                  <MarkdownBody body={lesson.body} />
                </div>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <CatechesisSignupForm unitSlug={UNIT_SLUG} />
      </section>
    </div>
  );
}

