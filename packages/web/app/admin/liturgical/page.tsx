"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://sao-jorge-api.talles-f1e.workers.dev";

type LitDayForm = {
  date: string;
  tone_of_week: number;
  fast_type: string;
  feast_level: number;
  feast_name_pt: string;
  feast_name_ar: string;
  epistle_ref: string;
  gospel_ref: string;
  status: string;
};

export default function AdminLiturgicalPage() {
  const [form, setForm] = useState<LitDayForm>({
    date: new Date().toISOString().split("T")[0],
    tone_of_week: 1,
    fast_type: "none",
    feast_level: 0,
    feast_name_pt: "",
    feast_name_ar: "",
    epistle_ref: "",
    gospel_ref: "",
    status: "approved",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/admin/liturgical`, {
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
      alert("Salvo com sucesso!");
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-display mb-6">Editar Dia Litúrgico</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Data (YYYY-MM-DD)</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Tom da semana (1–8)</label>
            <input
              type="number"
              min={1}
              max={8}
              value={form.tone_of_week}
              onChange={(e) => setForm({ ...form, tone_of_week: parseInt(e.target.value) })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Tipo de jejum</label>
            <select
              value={form.fast_type}
              onChange={(e) => setForm({ ...form, fast_type: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="none">Nenhum</option>
              <option value="strict">Estrito</option>
              <option value="fish">Peixe permitido</option>
              <option value="wine-oil">Vinho e azeite</option>
              <option value="xerophagy">Xerofagia</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Nível da festa (0–6)</label>
            <input
              type="number"
              min={0}
              max={6}
              value={form.feast_level}
              onChange={(e) => setForm({ ...form, feast_level: parseInt(e.target.value) })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-ui mb-1">Festa (PT)</label>
          <input
            value={form.feast_name_pt}
            onChange={(e) => setForm({ ...form, feast_name_pt: e.target.value })}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-ui mb-1">Festa (AR)</label>
          <input
            dir="rtl"
            value={form.feast_name_ar}
            onChange={(e) => setForm({ ...form, feast_name_ar: e.target.value })}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white font-arabic"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Ref. Epístola</label>
            <input
              value={form.epistle_ref}
              onChange={(e) => setForm({ ...form, epistle_ref: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-ui mb-1">Ref. Evangelho</label>
            <input
              value={form.gospel_ref}
              onChange={(e) => setForm({ ...form, gospel_ref: e.target.value })}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-ui mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
          >
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="published">Publicado</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-ui transition"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
