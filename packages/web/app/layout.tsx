import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paróquia São Jorge — Igreja Ortodoxa Antioquena de Curitiba",
  description:
    "Aplicação litúrgica da Paróquia São Jorge, Igreja Ortodoxa Antioquena de Curitiba",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#1a1714] text-[#e8dcc8]">
        <nav className="sticky top-0 z-50 bg-[#8b1a1e] text-[#f0e6d2] shadow-lg">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-serif text-lg font-bold tracking-wide">
              ☩ São Jorge
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="hover:text-white transition">
                Início
              </Link>
              <Link href="/servicos" className="hover:text-white transition">
                Serviços
              </Link>
              <Link href="/catequeses" className="hover:text-white transition">
                Catequeses
              </Link>
              <Link href="/blog" className="hover:text-white transition">
                Blog
              </Link>
              <Link href="/boletim" className="hover:text-white transition">
                Boletim
              </Link>
              <Link href="/podcast" className="hover:text-white transition">
                Podcast
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-12 border-t border-stone-700 bg-[#12100e] py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-500">
            Paróquia São Jorge · Igreja Ortodoxa Antioquena de Curitiba · ☩
          </div>
        </footer>
      </body>
    </html>
  );
}
