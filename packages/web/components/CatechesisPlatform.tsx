"use client";
import { useEffect, useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL ?? "https://sao-jorge-api.talles-f1e.workers.dev";
type Topic = { number:number; title:string; objective:string };
type Module = { slug:string; title:string; objective:string; topics:Topic[] };
type Cohort = { id:string; title:string; module_title:string };
export default function CatechesisPlatform(){
  const [modules,setModules]=useState<Module[]>([]),[cohorts,setCohorts]=useState<Cohort[]>([]),[message,setMessage]=useState("");
  const [form,setForm]=useState({cohort_id:"",full_name:"",email:"",phone:"",parish:"",attendance_preference:"presential",consent:false});
  useEffect(()=>{Promise.all([fetch(`${API}/api/catechesis-platform/modules`).then(r=>r.json()),fetch(`${API}/api/catechesis-platform/cohorts/open`).then(r=>r.json())]).then(([a,b])=>{setModules(a.data??[]);setCohorts(b.data??[])}).catch(()=>setMessage("Não foi possível carregar as turmas agora."));},[]);
  async function submit(e:React.FormEvent){e.preventDefault();setMessage("Enviando…");const r=await fetch(`${API}/api/catechesis-platform/applications`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();setMessage(r.ok?d.message:d.error??"Não foi possível enviar.");}
  return <div className="space-y-10">
    <section className="grid gap-6 lg:grid-cols-3">{modules.map(m=><article key={m.slug} className="card-liturgical"><h2 className="text-2xl font-display text-lit-gold">{m.title}</h2><p className="mt-2 text-sm text-stone-300">{m.objective}</p><ol className="mt-5 space-y-3">{m.topics.map(t=><li key={t.number} className="border-t border-stone-700 pt-3"><strong>{t.number}. {t.title}</strong><p className="mt-1 text-xs text-stone-400">{t.objective}</p></li>)}</ol></article>)}</section>
    <section className="card-liturgical"><h2 className="text-2xl font-display text-lit-gold">Inscrição em turma aberta</h2>{cohorts.length===0?<p className="mt-4 text-stone-300">Não há turma com inscrições abertas neste momento.</p>:<form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
      <label className="md:col-span-2 text-sm">Turma<select required className="mt-1 w-full rounded bg-stone-700 p-3" value={form.cohort_id} onChange={e=>setForm({...form,cohort_id:e.target.value})}><option value="">Selecione</option>{cohorts.map(c=><option key={c.id} value={c.id}>{c.module_title} — {c.title}</option>)}</select></label>
      <label className="text-sm">Nome completo<input required className="mt-1 w-full rounded bg-stone-700 p-3" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></label><label className="text-sm">E-mail<input required type="email" className="mt-1 w-full rounded bg-stone-700 p-3" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label className="text-sm">Telefone<input required className="mt-1 w-full rounded bg-stone-700 p-3" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label className="text-sm">Paróquia (opcional)<input className="mt-1 w-full rounded bg-stone-700 p-3" value={form.parish} onChange={e=>setForm({...form,parish:e.target.value})}/></label>
      <label className="text-sm">Participação<select className="mt-1 w-full rounded bg-stone-700 p-3" value={form.attendance_preference} onChange={e=>setForm({...form,attendance_preference:e.target.value})}><option value="presential">Presencial</option><option value="online">Online</option><option value="hybrid">Alternarei entre as duas</option></select></label>
      <label className="md:col-span-2 flex gap-3 text-sm"><input required type="checkbox" checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})}/><span>Autorizo o uso destes dados para administrar minha inscrição e acesso às aulas, conforme a <a className="text-lit-gold underline" href="/privacidade">política de privacidade</a>.</span></label><button className="w-fit rounded bg-lit-gold px-6 py-3 font-semibold text-lit-bg">Enviar inscrição</button>
    </form>}{message?<p className="mt-4 text-sm" role="status">{message}</p>:null}</section>
    <aside className="rounded-lg border border-stone-700 p-5 text-sm text-stone-300"><strong>Escopo:</strong> o curso apresenta doutrina, história, liturgia e teologia. Não prescreve regras pessoais de oração, jejum, confissão ou direção espiritual.</aside>
  </div>;
}
