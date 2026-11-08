import Link from "next/link";
import CatechesisPlatform from "@/components/CatechesisPlatform";

export const metadata = {
  title: "Catequese de Adultos — Paróquia São Jorge",
  description:
    "Três módulos quadrimestrais, presenciais e online, para formação na fé ortodoxa.",
};

export default function CatequeseAdultosPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/catequeses" className="text-stone-400 hover:text-white">← Voltar às catequeses</Link>
      <header className="mt-6 mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-lit-gold">Catecumenato São Jorge V3</p>
        <h1 className="mt-2 text-4xl font-display text-lit-gold">Catequese de Adultos</h1>
        <p className="mt-4 max-w-3xl text-lit-text-secondary">Três módulos independentes e objetivos, cada um com oito encontros quinzenais. A mesma turma participa presencialmente ou online.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/catequeses/area" className="rounded-lg bg-lit-gold px-5 py-3 font-semibold text-lit-bg">Área do aluno</Link>
          <span className="rounded-lg border border-stone-600 px-5 py-3 text-sm text-stone-300">Sem provas, certificados ou cobrança online</span>
        </div>
      </header>
      <CatechesisPlatform />
    </div>
  );
}
