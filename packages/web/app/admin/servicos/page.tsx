"use client";

import React, { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://sao-jorge-api.talles-f1e.workers.dev";

interface Section {
 type: string;
 textPt?: string;
 textAr?: string;
 textArTransliterated?: string;
 verseNumber?: string;
 speakerAr?: string;
 id?: string;
}

const EMPTY_SECTION: Section = { type: "heading", textPt: "", textAr: "", textArTransliterated: "" };

const SECTION_TYPES = [
 { value: "heading", label: "Título" },
 { value: "rubric", label: "Rúbrica" },
 { value: "verse", label: "Verso" },
 { value: "note", label: "Nota" },
 { value: "dynamic-slot", label: "Slot Dinâmico" },
];

interface ServiceEntry {
 id: number;
 slug: string;
 title_pt: string;
 status: string;
 version: number;
 updated_at: string;
 catalog_title_pt?: string;
}

export default function AdminServicosPage() {
 const [form, setForm] = useState({
  slug: "",
  title_pt: "",
  title_ar: "",
  title_ar_transliterated: "",
  category: "liturgia",
  subcategory: "",
  status: "pending",
  source_booklet_pages: "",
 });
 const [sections, setSections] = useState<Section[]>([{ ...EMPTY_SECTION }]);
 const [existingTexts, setExistingTexts] = useState<ServiceEntry[]>([]);
 const [loading, setLoading] = useState(false);
 const [jsonMode, setJsonMode] = useState(false);
 const [jsonInput, setJsonInput] = useState("");

 const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") ?? "" : "";

 const fetchExisting = useCallback(async () => {
  if (!token) return;
  try {
   const res = await fetch(`${API_URL}/api/admin/service-texts`, {
    headers: { Authorization: `Bearer ${token}` },
   });
   if (res.ok) {
    const data = await res.json();
    setExistingTexts(Array.isArray(data) ? data : []);
   }
  } catch {}
 }, [token]);

 useEffect(() => { fetchExisting() }, [fetchExisting]);

 function addSection() {
  setSections([...sections, { ...EMPTY_SECTION }]);
 }

 function removeSection(index: number) {
  setSections(sections.filter((_, i) => i !== index));
 }

 function updateSection(index: number, field: keyof Section, value: string) {
  const updated = [...sections];
  updated[index] = { ...updated[index], [field]: value };
  setSections(updated);
 }

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  try {
   const res = await fetch(`${API_URL}/api/admin/service-texts`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
     Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...form, sections }),
   });
   if (!res.ok) {
    alert(`Erro: ${await res.text()}`);
   } else {
    const result = await res.json();
    alert(`Salvo com sucesso! Versão: ${result.version}`);
    fetchExisting();
   }
  } finally {
   setLoading(false);
  }
 }

 async function handleJsonSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  try {
   const parsed = JSON.parse(jsonInput);
   const payload = {
    slug: parsed.slug || form.slug,
    title_pt: parsed.title_pt || form.title_pt,
    title_ar: parsed.title_ar || form.title_ar,
    title_ar_transliterated: parsed.title_ar_transliterated || form.title_ar_transliterated,
    category: parsed.category || form.category,
    subcategory: parsed.subcategory || form.subcategory,
    status: parsed.status || form.status,
    source_booklet_pages: parsed.source_booklet_pages || form.source_booklet_pages,
    sections: parsed.sections || [],
   };
   const res = await fetch(`${API_URL}/api/admin/service-texts`, {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
     Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
   });
   if (!res.ok) {
    alert(`Erro: ${await res.text()}`);
   } else {
    const result = await res.json();
    alert(`Salvo via JSON! Versão: ${result.version}`);
    fetchExisting();
   }
  } catch (err: any) {
   alert(`JSON inválido: ${err.message}`);
  } finally {
   setLoading(false);
  }
 }

 return (
  <div className="max-w-4xl">
   <h2 className="text-2xl font-display mb-6">Textos Litúrgicos — Serviços</h2>

   {/* Existing texts list */}
   {existingTexts.length > 0 && (
    <div className="mb-8 bg-stone-800/50 rounded-lg p-4">
     <h3 className="text-lg font-display text-stone-300 mb-3">Textos existentes</h3>
     <div className="space-y-2">
      {existingTexts.map((t) => (
       <div key={t.id} className="flex items-center gap-3 text-sm">
        <span className="text-amber-500 font-mono">v{t.version}</span>
        <span className="text-white">{t.catalog_title_pt || t.title_pt}</span>
        <span className="text-stone-400">({t.slug})</span>
        <span className={`px-2 py-0.5 rounded text-xs ${t.status === "published" ? "bg-green-900 text-green-300" : "bg-stone-700 text-stone-400"}`}>
         {t.status}
        </span>
       </div>
      ))}
     </div>
    </div>
   )}

   {/* Toggle between form and JSON mode */}
   <div className="flex gap-2 mb-6">
    <button
     onClick={() => setJsonMode(false)}
     className={`px-4 py-2 rounded-lg text-sm font-ui transition ${!jsonMode ? "bg-amber-600 text-white" : "bg-stone-800 text-stone-400 hover:text-white"}`}
    >
     Formulário
    </button>
    <button
     onClick={() => setJsonMode(true)}
     className={`px-4 py-2 rounded-lg text-sm font-ui transition ${jsonMode ? "bg-amber-600 text-white" : "bg-stone-800 text-stone-400 hover:text-white"}`}
    >
     Importar JSON
    </button>
   </div>

   {jsonMode ? (
    /* JSON import mode — paste full service text JSON */
    <form onSubmit={handleJsonSubmit} className="space-y-4">
     <div>
      <label className="block text-sm font-ui mb-1">JSON completo</label>
      <textarea
       value={jsonInput}
       onChange={(e) => setJsonInput(e.target.value)}
       rows={20}
       className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white font-mono text-xs"
       placeholder='{ "slug": "divina-liturgia-crisostomo", "title_pt": "...", "sections": [...] }'
       required
      />
     </div>
     <button
      type="submit"
      disabled={loading}
      className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-ui transition disabled:opacity-50"
     >
      {loading ? "Salvando..." : "Importar JSON"}
     </button>
    </form>
   ) : (
    /* Form mode — structured editor */
    <form onSubmit={handleSubmit} className="space-y-4">
     {/* Service selector */}
     <div>
      <label className="block text-sm font-ui mb-1">Serviço (slug)</label>
      <select
       value={form.slug}
       onChange={(e) => setForm({ ...form, slug: e.target.value })}
       className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
       required
      >
       <option value="">— Selecionar serviço —</option>
       <option value="divina-liturgia-crisostomo">Divina Liturgia de S. João Crisóstomo</option>
       <option value="divina-liturgia">Divina Liturgia (genérica)</option>
       <option value="divina-liturgia-basilio">Divina Liturgia de S. Basílio</option>
       <option value="liturgia-pre-santificados">Liturgia dos Pré-Santificados</option>
       <option value="paraklesis">Paraklesis</option>
       <option value="grandes-completas">Grandes Completas</option>
       <option value="akathist-theotokos">Akathist à Theotokos</option>
       <option value="akathist-sao-jorge">Akathist a São Jorge</option>
       <option value="visita-ao-santissimo">Visita ao Santíssimo</option>
       <option value="hora-prima">Hora Prima</option>
       <option value="hora-tercia">Hora Tércia</option>
       <option value="hora-sexta">Hora Sexta</option>
       <option value="hora-nona">Hora Nona</option>
       <option value="oracoes-manha">Orações da Manhã</option>
       <option value="oracoes-noite">Orações da Noite</option>
       <option value="domingo-ramos">Domingo de Ramos</option>
       <option value="grande-quinta">Grande Quinta-feira</option>
       <option value="grande-sexta">Grande Sexta-feira</option>
       <option value="sabado-santo">Sábado Santo</option>
       <option value="pascoa">Páscoa</option>
      </select>
     </div>

     {/* Three-column titles */}
     <div className="grid grid-cols-3 gap-3">
      <div>
       <label className="block text-sm font-ui mb-1">Título (PT)</label>
       <input
        value={form.title_pt}
        onChange={(e) => setForm({ ...form, title_pt: e.target.value })}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
        required
       />
      </div>
      <div>
       <label className="block text-sm font-ui mb-1">Título (Árabe)</label>
       <input
        value={form.title_ar}
        onChange={(e) => setForm({ ...form, title_ar: e.target.value })}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
        dir="rtl"
       />
      </div>
      <div>
       <label className="block text-sm font-ui mb-1">Título (Árabe translit.)</label>
       <input
        value={form.title_ar_transliterated}
        onChange={(e) => setForm({ ...form, title_ar_transliterated: e.target.value })}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
       />
      </div>
     </div>

     {/* Category + Status */}
     <div className="grid grid-cols-3 gap-3">
      <div>
       <label className="block text-sm font-ui mb-1">Categoria</label>
       <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
       >
        <option value="liturgia">Liturgia</option>
        <option value="completas">Completas</option>
        <option value="horas">Horas</option>
        <option value="ortros">Ortros</option>
        <option value="vesperas">Vésperas</option>
        <option value="akathistos">Akathistos</option>
        <option value="semana-santa">Semana Santa</option>
        <option value="oracoes">Orações</option>
        <option value="sacramentos">Sacramentos</option>
        <option value="paraklesis">Paraklesis</option>
        <option value="preparacao">Preparação</option>
       </select>
      </div>
      <div>
       <label className="block text-sm font-ui mb-1">Subcategoria</label>
       <input
        value={form.subcategory}
        onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
        className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
       />
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
     </div>

     {/* Source booklet pages */}
     <div>
      <label className="block text-sm font-ui mb-1">Páginas do folheto (referência)</label>
      <input
       value={form.source_booklet_pages}
       onChange={(e) => setForm({ ...form, source_booklet_pages: e.target.value })}
       className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-white"
       placeholder="ex: 3–15"
      />
     </div>

     {/* Sections editor */}
     <div className="border-t border-stone-700 pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
       <h3 className="text-lg font-display text-stone-300">Seções do texto</h3>
       <button
        type="button"
        onClick={addSection}
        className="bg-stone-700 hover:bg-stone-600 text-white px-3 py-1 rounded text-sm font-ui transition"
       >
        + Adicionar seção
       </button>
      </div>

      <div className="space-y-4">
       {sections.map((sec, i) => (
        <div key={i} className="bg-stone-900/50 rounded-lg p-4 border border-stone-700/50">
         <div className="flex items-center gap-3 mb-3">
          <select
           value={sec.type}
           onChange={(e) => updateSection(i, "type", e.target.value)}
           className="bg-stone-800 border border-stone-700 rounded px-2 py-1 text-white text-sm"
          >
           {SECTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
           ))}
          </select>
          <span className="text-stone-500 text-xs">#{i + 1}</span>
          {sections.length > 1 && (
           <button
            type="button"
            onClick={() => removeSection(i)}
            className="ml-auto text-red-400 hover:text-red-300 text-xs font-ui"
           >
            Remover
           </button>
          )}
         </div>

         <div className="grid grid-cols-3 gap-2">
          <div>
           <label className="block text-xs text-stone-400 mb-1">Português</label>
           {sec.type === "heading" || sec.type === "rubric" || sec.type === "note" ? (
            <textarea
             value={sec.textPt || ""}
             onChange={(e) => updateSection(i, "textPt", e.target.value)}
             rows={2}
             className="w-full bg-stone-800 border border-stone-700 rounded px-2 py-1 text-white text-sm"
            />
           ) : (
            <textarea
             value={sec.textPt || ""}
             onChange={(e) => updateSection(i, "textPt", e.target.value)}
             rows={3}
             className="w-full bg-stone-800 border border-stone-700 rounded px-2 py-1 text-white text-sm font-mono"
            />
           )}
          </div>
          <div>
           <label className="block text-xs text-stone-400 mb-1">Árabe</label>
           <textarea
            value={sec.textAr || ""}
            onChange={(e) => updateSection(i, "textAr", e.target.value)}
            rows={3}
            dir="rtl"
            className="w-full bg-stone-800 border border-stone-700 rounded px-2 py-1 text-white text-sm font-mono"
           />
          </div>
          <div>
           <label className="block text-xs text-stone-400 mb-1">Árabe transliterado</label>
           <textarea
            value={sec.textArTransliterated || ""}
            onChange={(e) => updateSection(i, "textArTransliterated", e.target.value)}
            rows={3}
            className="w-full bg-stone-800 border border-stone-700 rounded px-2 py-1 text-white text-sm font-mono italic"
           />
          </div>
         </div>

         {sec.type === "verse" && (
          <div className="mt-2">
           <label className="block text-xs text-stone-400 mb-1">Número do verso</label>
           <input
            value={sec.verseNumber || ""}
            onChange={(e) => updateSection(i, "verseNumber", e.target.value)}
            className="w-24 bg-stone-800 border border-stone-700 rounded px-2 py-1 text-white text-sm"
           />
          </div>
         )}

         {sec.type === "dynamic-slot" && (
          <div className="mt-2">
           <label className="block text-xs text-stone-400 mb-1">ID do slot</label>
           <input
            value={sec.id || ""}
            onChange={(e) => updateSection(i, "id", e.target.value)}
            className="w-48 bg-stone-800 border border-stone-700 rounded px-2 py-1 text-white text-sm font-mono"
            placeholder="ex: troparion, kontakion"
           />
          </div>
         )}
        </div>
       ))}
      </div>
     </div>

     <button
      type="submit"
      disabled={loading}
      className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-ui transition disabled:opacity-50"
     >
      {loading ? "Salvando..." : "Salvar texto litúrgico"}
     </button>
    </form>
   )}
  </div>
 );
}
