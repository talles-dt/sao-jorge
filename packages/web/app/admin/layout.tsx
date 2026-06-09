"use client";

import Link from "next/link";

interface FormState {
  error?: string;
  success?: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
