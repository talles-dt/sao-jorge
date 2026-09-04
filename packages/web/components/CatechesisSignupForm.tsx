"use client";

import React, { useState } from "react";
import { submitCatechesisSignup } from "@/lib/api";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  birth_date: "",
  previous_religion: "",
  motivation: "",
  agreed_to_terms: false,
};

export default function CatechesisSignupForm({ unitSlug }: { unitSlug: string }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const response = await submitCatechesisSignup({
      unit_slug: unitSlug,
      ...form,
    });

    if (response.error) {
      setStatus("error");
      setErrorMsg(response.error);
      return;
    }

    setStatus("success");
    setForm(initialForm);
  }

  if (status === "success") {
    return (
      <div className="card-liturgical text-center py-10">
        <h3 className="font-display text-xl mb-2">Inscrição recebida ☩</h3>
        <p className="text-lit-text-secondary">
          Obrigado pelo seu interesse. O catequista entrará em contato para os próximos passos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-liturgical space-y-4">
      <h3 className="font-display text-xl mb-2">Inscrição</h3>

      <div>
        <label className="block text-sm font-ui mb-1">Nome Completo *</label>
        <input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="w-full bg-stone-700 border border-stone-600 rounded-lg px-3 py-2 text-lit-text focus:outline-none focus:border-lit-gold"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-ui mb-1">E-mail *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-stone-700 border border-stone-600 rounded-lg px-3 py-2 text-lit-text focus:outline-none focus:border-lit-gold"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-ui mb-1">Telefone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-stone-700 border border-stone-600 rounded-lg px-3 py-2 text-lit-text focus:outline-none focus:border-lit-gold"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-ui mb-1">Data de Nascimento</label>
        <input
          type="date"
          value={form.birth_date}
          onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
          className="w-full bg-stone-700 border border-stone-600 rounded-lg px-3 py-2 text-lit-text focus:outline-none focus:border-lit-gold"
        />
      </div>

      <div>
        <label className="block text-sm font-ui mb-1">Religião Anterior</label>
        <input
          value={form.previous_religion}
          onChange={(e) => setForm({ ...form, previous_religion: e.target.value })}
          className="w-full bg-stone-700 border border-stone-600 rounded-lg px-3 py-2 text-lit-text focus:outline-none focus:border-lit-gold"
          placeholder="Ex.: Católica, Protestante, Nenhuma..."
        />
      </div>

      <div>
        <label className="block text-sm font-ui mb-1">Motivo para buscar a Ortodoxia</label>
        <textarea
          value={form.motivation}
          onChange={(e) => setForm({ ...form, motivation: e.target.value })}
          rows={4}
          className="w-full bg-stone-700 border border-stone-600 rounded-lg px-3 py-2 text-lit-text focus:outline-none focus:border-lit-gold"
        />
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.agreed_to_terms}
          onChange={(e) => setForm({ ...form, agreed_to_terms: e.target.checked })}
          className="mt-1"
          required
        />
        <span>
          Concordo em participar regularmente dos encontros e observar os jejuns prescritos.
        </span>
      </label>

      {status === "error" ? (
        <p className="text-lit-red text-sm">{errorMsg || "Erro ao enviar. Tente novamente."}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-lit-gold text-lit-bg font-semibold px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {status === "sending" ? "Enviando..." : "Enviar Inscrição"}
      </button>
    </form>
  );
}
