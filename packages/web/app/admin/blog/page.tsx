"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://sao-jorge-api.talles-f1e.workers.dev";

export default function AdminBlogPage() {
  const [form, setForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    body: "",
    author: "",
    category: "parish-news",
    tags: "",
    status: "draft",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/admin/blog`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken") ?? ""}`,
      },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()),
      }),
    });
    if (!res.ok) {
      alert(`Erro: ${await res.text()}`);
    } else {
      alert("Publicado com sucesso!");
      setForm({ ...form, slug: "", title: "", excerpt: "", body: "" });
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-display mb-6">Novo Artigo — Blog</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-ui mb-1">Slug (URL)</label>
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-ui mb-1">Título</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-ui mb-1">Resumo</label>
          <input
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-ui mb-1">Conteúdo (Markdown)</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={12}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Autor</label>
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="catechesis">Catequesis</option>
              <option value="liturgical">Litúrgico</option>
              <option value="parish-news">Notícias</option>
              <option value="patristic">Patrístico</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Tags (vírgula)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-ui transition"
        >
          Publicar
        </button>
      </form>
    </div>
  );
}
