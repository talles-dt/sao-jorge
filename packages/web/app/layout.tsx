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
            <Link
              href="/"
              className="font-serif text-lg font-bold tracking-wide flex items-center gap-2"
            >
              <span className="text-xl">☩</span>
              <span>São Jorge</span>
            </Link>
            <div className="flex gap-4 text-sm">
              {[
                { href: "/", label: "Início" },
                { href: "/servicos", label: "Serviços" },
                { href: "/catequeses", label: "Catequeses" },
                { href: "/blog", label: "Blog" },
                { href: "/boletim", label: "Boletim" },
                { href: "/podcast", label: "Podcast" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-white transition-colors duration-200 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#f0e6d2] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mt-12 border-t border-stone-700 bg-[#12100e] py-6">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-500">
            <p className="font-serif">Paróquia São Jorge</p>
            <p className="mt-1">Igreja Ortodoxa Antioquena de Curitiba · ☩</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
