import Link from "next/link";
import { fetchServiceTextsBySlug, fetchServices } from "@/lib/api";

export async function generateStaticParams() {
 try {
  const response = await fetchServices();
  const services = response.data || [];
  if (services.length === 0) return [{ slug: "_placeholder" }];
  return services.map((service: Record<string, unknown>) => ({
   slug: String(service.slug),
  }));
 } catch {
  return [{ slug: "_placeholder" }];
 }
}

interface ServiceSection {
 type: string;
 textPt?: string;
 textAr?: string;
 textArTransliterated?: string;
 verseNumber?: string;
 speakerAr?: string;
 id?: string;
}

export default async function ServiceDetailPage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 const { slug } = await params;
 const response = await fetchServiceTextsBySlug(slug);
 const serviceTexts: Record<string, unknown>[] = (response.data as Record<string, unknown>[] | undefined) ?? [];

 if (!serviceTexts.length) {
 return (
 <div className="space-y-8">
 <header className="mb-8">
 <Link href="/servicos" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition mb-4">
 ← Voltar aos serviços
 </Link>
 <h1 className="text-3xl font-display text-center">
 Serviço Litúrgico
 </h1>
 </header>
 <p className="text-stone-500 text-center py-8">
 Nenhum texto encontrado para este serviço.
 </p>
 </div>
 );
 }

 const text = serviceTexts[0];
 let sections: ServiceSection[] = [];
 try {
 sections = Array.isArray(text.sections)
 ? (text.sections as ServiceSection[])
 : (JSON.parse(String(text.sections)) as ServiceSection[]);
 } catch {
 sections = [];
 }

 return (
 <div className="space-y-8">
 <header className="mb-8">
 <Link href="/servicos" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition mb-4">
 ← Voltar aos serviços
 </Link>
 <h1 className="text-3xl font-display text-center">
 {String(text.titlePt)}
 </h1>
 </header>

 <div className="bg-stone-800/50 rounded-lg p-6">
 {sections.map((section, index) => (
 <div key={index} className="mb-4 last:mb-0">
 {section.type === "heading" && (
 <h2 className="font-display text-white">{String(section.textPt)}</h2>
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
 {section.type === "dynamic-slot" && (
 <p className="text-sm text-stone-500 italic">[Slot dinâmico: {String(section.id)}]</p>
 )}
 </div>
 ))}
 </div>
 </div>
 );
}
