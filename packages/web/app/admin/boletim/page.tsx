"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://sao-jorge-api.talles-f1e.workers.dev";

export default function AdminBulletinPage() {
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "announcement",
    publish_date: new Date().toISOString().split("T")[0],
    expires_date: "",
    status: "pending",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/admin/bulletin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken") ?? ""}`,
      },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      alert(`Erro: ${await res.text()}`);
    } else {
      alert("Boletim publicado com sucesso!");
      setForm({
        ...form,
        title: "",
        body: "",
        expires_date: "",
      });
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-display mb-6">Novo Boletim</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block text-sm font-ui mb-1">Conteúdo</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={6}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="announcement">Aviso</option>
              <option value="event">Evento</option>
              <option value="pastoral">Pastoral</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Data de publicação</label>
            <input
              type="date"
              value={form.publish_date}
              onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Expira em</label>
            <input
              type="date"
              value={form.expires_date}
              onChange={(e) => setForm({ ...form, expires_date: e.target.value })}
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
              <option value="pending">Pendente</option>
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
