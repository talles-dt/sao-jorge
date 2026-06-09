import Link from "next/link";

export default function AdminDashboard() {
  const cards = [
    { href: "/admin/liturgical", label: "Dia Litúrgico", desc: "Editar dados litúrgicos e leituras" },
    { href: "/admin/blog", label: "Blog", desc: "Novos artigos e catequesis" },
    { href: "/admin/boletim", label: "Boletim", desc: "Avisos e comunicados paroquiais" },
    { href: "/admin/servicos", label: "Serviços", desc: "Textos litúrgicos e serviços" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-display mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-stone-800 rounded-lg p-6 hover:bg-stone-700 transition border border-stone-700"
          >
            <h3 className="text-lg font-display text-amber-500">{c.label}</h3>
            <p className="text-sm text-stone-400 mt-2">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
