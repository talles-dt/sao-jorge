import Link from "next/link";

export default async function CatequesesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display text-center">Catequeses</h1>
      <p className="text-stone-400 text-center">Catequeses will be available here.</p>
      <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition">
        ← Voltar ao início
      </Link>
    </div>
  );
}
