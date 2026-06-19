import Link from "next/link";
import { fetchServiceTextsBySlug, fetchServices } from "@/lib/api";
import ServiceView from "./ServiceView";

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

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const response = await fetchServiceTextsBySlug(slug);
  const text = response.data as Record<string, unknown> | undefined;

  if (!text || response.error) {
    return (
      <div className="space-y-8">
        <header className="mb-8">
          <Link
            href="/servicos"
            className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition mb-4"
          >
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

  let sections: ServiceSection[] = [];
  try {
    sections = Array.isArray(text.sections)
      ? (text.sections as ServiceSection[])
      : (JSON.parse(String(text.sections)) as ServiceSection[]);
  } catch {
    sections = [];
  }

  const title = String(text.title_pt ?? text.titlePt ?? "Serviço Litúrgico");
  const titleAr = text.title_ar ?? text.titleAr;

  return <ServiceView title={title} titleAr={titleAr ? String(titleAr) : null} sections={sections} />;
}

export interface ServiceSection {
  type: string;
  textPt?: string;
  textAr?: string;
  textArTransliterated?: string;
  verseNumber?: string;
  speakerAr?: string;
  id?: string;
}
