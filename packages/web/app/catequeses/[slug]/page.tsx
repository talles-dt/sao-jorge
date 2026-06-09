import Link from "next/link";
import { fetchCatechesis, fetchCatechesisLessonsByUnitSlug } from "@/lib/api";

/* Next.js 15.5 with output: 'export' treats generateStaticParams returning []
   as "missing generateStaticParams". Never return [] — use a placeholder instead. */
const FALLBACK_PARAMS = [{ slug: "_placeholder" }];

export async function generateStaticParams() {
 try {
  const response = await fetchCatechesis();
  if (response.error || !response.data || response.data.length === 0) {
   return FALLBACK_PARAMS;
  }
  return response.data.map((unit: Record<string, unknown>) => ({
   slug: String(unit.slug),
  }));
 } catch {
  return FALLBACK_PARAMS;
 }
}

interface CatechesisSection {
 type: string;
 textPt?: string;
 textAr?: string;
 textArTransliterated?: string;
 verseNumber?: string;
 speakerAr?: string;
 id?: string;
}

export default async function CatechesisUnitPage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 const { slug } = await params;

 if (slug === "_placeholder") {
  return (
   <div className="space-y-8">
    <header className="mb-8">
     <Link href="/catequeses" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition mb-4">
      ← Voltar às catequeses
     </Link>
     <h1 className="text-3xl font-display text-center">Catequese</h1>
    </header>
    <p className="text-stone-500 text-center py-8">
     Nenhuma unidade de catequese disponível no momento.
    </p>
   </div>
  );
 }

 const response = await fetchCatechesisLessonsByUnitSlug(slug);
 const lessons: Record<string, unknown>[] = (response.data as Record<string, unknown>[] | undefined) ?? [];

 if (!lessons.length) {
  return (
   <div className="space-y-8">
    <header className="mb-8">
     <Link href="/catequeses" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition mb-4">
      ← Voltar às catequeses
     </Link>
     <h1 className="text-3xl font-display text-center">Catequese</h1>
    </header>
    <p className="text-stone-500 text-center py-8">
     Nenhuma lição encontrada para esta unidade.
    </p>
   </div>
  );
 }

 return (
  <div className="space-y-8">
   <header className="mb-8">
    <Link href="/catequeses" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition mb-4">
     ← Voltar às catequeses
    </Link>
    <h1 className="text-3xl font-display text-center">Catequese</h1>
   </header>

   <div className="bg-stone-800/50 rounded-lg p-6">
    {lessons.map((lesson, index) => {
     let sections: CatechesisSection[] = [];
     try {
      sections = Array.isArray(lesson.sections)
       ? (lesson.sections as CatechesisSection[])
       : (JSON.parse(String(lesson.sections)) as CatechesisSection[]);
     } catch {
      sections = [];
     }

     return (
      <div key={index} className="mb-6 last:mb-0 border-b border-stone-700 pb-6 last:border-0 last:pb-0">
       {typeof lesson.title === "string" && lesson.title.length > 0 && (
        <h2 className="font-display text-white mb-3">{lesson.title}</h2>
       )}
       {sections.map((section, sIndex) => (
        <div key={sIndex} className="mb-3 last:mb-0">
         {section.type === "heading" && (
          <h3 className="font-display text-white">{String(section.textPt)}</h3>
         )}
         {section.type === "rubric" && (
          <p className="text-sm text-stone-400 italic">{String(section.textPt)}</p>
         )}
         {section.type === "verse" && (
          <>
           {section.verseNumber && (
            <span className="text-xs text-stone-500 mr-2">[{String(section.verseNumber)}]</span>
           )}
           <span className="font-mono" dir={section.speakerAr ? "rtl" : "ltr"}>
            {String(section.textPt)}
           </span>
           {section.textAr && (
            <div className="mt-2 text-right" style={{ fontFamily: "'Noto Naskh Arabic', serif", direction: "rtl" }}>
             {String(section.textAr)}
            </div>
           )}
           {section.textArTransliterated && (
            <p className="text-sm text-stone-400 italic mt-1">
             {String(section.textArTransliterated)}
            </p>
           )}
          </>
         )}
         {section.type === "note" && (
          <p className="text-sm text-stone-500 italic">Nota: {String(section.textPt)}</p>
         )}
        </div>
       ))}
      </div>
     );
    })}
   </div>
  </div>
 );
}
