"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://sao-jorge-api.talles-f1e.workers.dev";
const ADMIN_URL = "https://sao-jorge-iota.vercel.app/admin";

function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "authorized" | "login">("checking");
  const checkUrl = `${API_URL}/api/admin/catechesis-signups`;
  const loginUrl = `${checkUrl}?return_to=${encodeURIComponent(ADMIN_URL)}`;

  useEffect(() => {
    let active = true;
    fetch(checkUrl, { credentials: "include", headers: { Accept: "application/json" } })
      .then((response) => {
        if (active) setState(response.ok ? "authorized" : "login");
      })
      .catch(() => {
        if (active) setState("login");
      });
    return () => { active = false; };
  }, [checkUrl]);

  if (state === "checking") {
    return <main className="min-h-screen bg-stone-950 text-stone-200 p-8">Verificando acesso administrativo…</main>;
  }
  if (state === "login") {
    return (
      <main className="min-h-screen bg-stone-950 text-stone-200 p-8 max-w-xl">
        <h1 className="text-2xl font-display text-amber-500">Login administrativo necessário</h1>
        <p className="mt-3 text-stone-300">Entre pelo Cloudflare Access para habilitar as operações do painel.</p>
        <a
          href={loginUrl}
          className="inline-block mt-6 rounded-lg bg-amber-600 px-4 py-3 font-ui text-white hover:bg-amber-700"
        >
          Entrar com Cloudflare Access
        </a>
        <p className="mt-4 text-sm text-stone-500">Depois do login, volte a esta página e ela verificará a sessão novamente.</p>
      </main>
    );
  }
  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAccessGate>
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col">
        <div className="p-4 border-b border-stone-800">
          <h1 className="text-lg font-display text-amber-500">☩ Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="block px-3 py-2 rounded-lg hover:bg-stone-800 text-sm transition"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/liturgical"
            className="block px-3 py-2 rounded-lg hover:bg-stone-800 text-sm transition"
          >
            Dia Litúrgico
          </Link>
          <Link
            href="/admin/blog"
            className="block px-3 py-2 rounded-lg hover:bg-stone-800 text-sm transition"
          >
            Blog
          </Link>
          <Link
            href="/admin/boletim"
            className="block px-3 py-2 rounded-lg hover:bg-stone-800 text-sm transition"
          >
            Boletim
          </Link>
          <Link
            href="/admin/servicos"
            className="block px-3 py-2 rounded-lg hover:bg-stone-800 text-sm transition"
          >
            Serviços
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
    </AdminAccessGate>
  );
}
