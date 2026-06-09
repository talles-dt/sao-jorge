import Link from "next/link";
import { fetchServiceCatalog } from "@/lib/api";



export default async function ServicesPage() {
 const services = await fetchServiceCatalog();

 return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-display text-center">Serviços Litúrgicos</h1>
        <p className="text-center text-stone-400 mt-2">
          Selecione um serviço para ver seus textos e estruturas
        </p>
      </header>

      {services.data && services.data.length > 0 ? (
        <div className="grid gap-6">
          {/* Grid layout: 1 column on mobile, 2 on tablet, 3 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.data.map((service: any) => (
              <Link
                key={service.slug}
                href={`/servicos/${service.slug}`}
                className="group"
              >
                <div
                  className="bg-lit-parchment rounded-lg p-6 hover:bg-lit-parchment/50 transition-transform duration-300 group-hover:-translate-y-1 border border-stone-700/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 bg-amber-700/20 rounded-full flex items-center justify-center"
                      >
                        {/* Service category icon could go here */}
                        <span className="text-amber-500 text-xs">{service.category
                          .split("-")
                          .map((s: string) => s[0])
                          .join("")}</span>
                      </div>
                      <h3 className="font-display text-lg">
                        {service.titlePt}
                      </h3>
                    </div>
                    {service.titleAr && (
                      <span className="text-sm" style={{ fontFamily: "'Noto Naskh Arabic', serif", direction: "rtl" }}>
                        {service.titleAr}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 text-sm">
                    {service.subcategory ?? "Serviço litúrgico"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-stone-500 text-center py-8">
          Nenhum serviço encontrado.
        </p>
      )}
    </div>
  );
}