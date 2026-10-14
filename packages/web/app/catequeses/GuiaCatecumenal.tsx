"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCheck,
  IconBan,
  IconChevronRight,
  IconChevronLeft,
  IconBook,
  IconChurch2,
  IconHeart2,
  IconBrain,
  IconCalendar,
  IconUsers2,
  IconCircleInfo,
  IconAward,
} from "@/components/ParishIcons";
import { BemVindo } from "./SecoesCatecumenal";

export type GuideSectionId = "intro" | "fundamentos" | "sacramentos" | "espiritualidade" | "liturgia" | "historia" | "paroxia" | "proximos-passos";
export type GuideCalloutTone = "guardar" | "praticar" | "rezar";
export interface GuideQuestion { q: string; o: string[]; c: number; e: string }
export interface GuideQuiz { t: string; d: string; q: GuideQuestion[] }
export interface GuideSection { i: GuideSectionId; t: string; st: string; ic: React.ReactNode; q?: keyof typeof Q | null }

// Revisões opcionais: o guia é uma experiência de formação, não uma prova.
const Q = {
  f: {
    t: "Quiz: Fundamentos",
    d: "Teste sobre os pilares.",
    q: [
      { q: "Quantas Pessoas na Trindade?", o: ["1", "2", "3", "4"], c: 2, e: "Um Deus em Três Pessoas: Pai, Filho, Espírito Santo." },
      { q: "Qual sacramento marca entrada na Igreja?", o: ["Eucaristia", "Batismo", "Confissão", "Crismação"], c: 1, e: "O Batismo nos torna membros do Corpo de Cristo." },
      { q: "O que significa Theotokos?", o: ["Mãe de Deus", "Mãe de Cristo", "Mãe da Igreja", "Mãe dos Santos"], c: 0, e: "Theotokos = Mãe de Deus (em grego: Θεοτόκος)." },
    ],
  },
  sac: {
    t: "Quiz: Sacramentos",
    d: "Teste sobre os Santos Mistérios.",
    q: [
      { q: "Quantos Sacramentos?", o: ["5", "7", "10", "12"], c: 1, e: "7 Santos Mistérios: Batismo, Crismação, Eucaristia, Confissão, Unção, Ordenação, Matrimônio." },
      { q: "Centro da vida litúrgica?", o: ["Batismo", "Eucaristia", "Confissão", "Matrimônio"], c: 1, e: "A Divina Liturgia (Eucaristia) é o coração da vida da Igreja." },
      { q: "O que é necessário para comungar?", o: ["Jejuar", "Confessar", "Estar em graça", "Todas"], c: 3, e: "Jejum eucarístico, confissão (se necessário), estado de graça." },
    ],
  },
  e: {
    t: "Quiz: Espiritualidade",
    d: "Teste sobre práticas espirituais.",
    q: [
      { q: "Oração mais importante?", o: ["Oração de Jesus", "Pai Nosso", "Ave Maria", "Credo"], c: 0, e: '"Senhor Jesus Cristo, Filho de Deus, tem misericórdia de mim, pecador"' },
      { q: "O que é hesiquia?", o: ["Silêncio interior", "Canto litúrgico", "Jejum", "Peregrinação"], c: 0, e: "Hesiquia = silêncio interior, paz do coração." },
      { q: "Propósito do jejum?", o: ["Perder peso", "Disciplinar corpo e alma", "Seguir lei", "Impressionar"], c: 1, e: "Ferramenta espiritual para disciplinar corpo e alma." },
    ],
  },
};

const S: GuideSection[] = [
  { i: "intro", t: "Como caminhar", st: "Início do caminho", ic: <IconChurch2 size={20} /> },
  { i: "fundamentos", t: "Fundamentos da Fé", st: "Pilares da Ortodoxia", ic: <IconHeart2 size={24} />, q: "f" },
  { i: "sacramentos", t: "Vida Sacramental", st: "Santos Mistérios", ic: <IconChurch2 size={24} />, q: "sac" },
  { i: "espiritualidade", t: "Vida Espiritual", st: "Oração e ascese", ic: <IconBrain size={24} />, q: "e" },
  { i: "liturgia", t: "Ciclo Litúrgico", st: "Festas e jejuns", ic: <IconCalendar size={24} />, q: null },
  { i: "historia", t: "História e Tradição", st: "Igreja Apostólica", ic: <IconBook size={24} />, q: null },
  { i: "paroxia", t: "Vida na Paróquia", st: "Comunidade São Jorge", ic: <IconUsers2 size={24} />, q: null },
  { i: "proximos-passos", t: "Próximos passos", st: "A vida continua na Igreja", ic: <IconBook size={20} /> },
];

type ChapterProps = { onStart: () => void };

const GuideChapter = ({
  eyebrow,
  title,
  lead,
  body,
  keep,
  practice,
  onStart,
}: ChapterProps & { eyebrow: string; title: string; lead: string; body: string[]; keep: string; practice: string }) => (
  <article className="space-y-8">
    <header className="border-b border-stone-700/60 pb-8">
      <p className="mb-3 font-ui text-xs uppercase tracking-[0.2em] text-lit-gold">{eyebrow}</p>
      <h1 className="font-display text-3xl leading-tight text-lit-gold sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-xl leading-relaxed text-stone-300">{lead}</p>
    </header>
    <div className="max-w-3xl space-y-5 text-lg leading-loose text-lit-text-secondary">
      {body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </div>
    <div className="grid gap-4 border-y border-stone-700/50 py-6 sm:grid-cols-2">
      <aside className="border-l-2 border-lit-gold pl-4">
        <p className="font-ui text-xs uppercase tracking-wider text-lit-gold">Para guardar</p>
        <p className="mt-2 text-stone-300">{keep}</p>
      </aside>
      <aside className="border-l-2 border-lit-red pl-4">
        <p className="font-ui text-xs uppercase tracking-wider text-lit-red">Para praticar</p>
        <p className="mt-2 text-stone-300">{practice}</p>
      </aside>
    </div>
    <button type="button" onClick={onStart} className="inline-flex items-center gap-2 border-b border-lit-gold pb-1 font-ui text-sm text-lit-gold transition hover:text-white focus:outline-none focus:ring-2 focus:ring-lit-gold">
      Continuar o caminho <IconChevronRight size={18} />
    </button>
  </article>
);

const chapter = (props: Omit<React.ComponentProps<typeof GuideChapter>, "onStart">) => {
  const Chapter = (p: ChapterProps) => <GuideChapter {...props} {...p} />;
  Chapter.displayName = `GuideChapter(${props.title})`;
  return Chapter;
};

const sectionComponents: Record<GuideSectionId, React.ComponentType<ChapterProps>> = {
  intro: BemVindo,
  fundamentos: chapter({ eyebrow: "Capítulo 1", title: "Receber a fé como caminho", lead: "A fé cristã não começa com uma lista de respostas, mas com uma vida que aprendemos a receber e habitar.", body: ["A Igreja não oferece apenas ideias sobre Deus. Ela oferece um modo de viver: escutar a Escritura, rezar com a comunidade, receber os mistérios e aprender a amar concretamente.", "Por isso, a catequese é uma caminhada acompanhada. Este guia pode abrir perguntas, mas os encontros, a oração e a vida paroquial são onde essas perguntas ganham corpo."], keep: "A fé é uma relação viva antes de ser um sistema de conceitos.", practice: "Anote uma pergunta que você gostaria de levar ao próximo encontro." }),
  sacramentos: chapter({ eyebrow: "Capítulo 2", title: "A vida recebida nos mistérios", lead: "Na Igreja, Deus não permanece distante: sua graça alcança a vida concreta por meio dos Santos Mistérios.", body: ["Batismo, Crismação, Eucaristia, Confissão e os demais mistérios não são etapas de um formulário religioso. São maneiras pelas quais Cristo reúne, cura, alimenta e envia seu povo.", "A preparação sacramental pede atenção e acompanhamento. Não é uma corrida para completar conteúdos, mas uma aprendizagem paciente de comunhão."], keep: "Os mistérios são vida da Igreja, não apenas cerimônias que observamos.", practice: "Observe, na próxima celebração, um gesto litúrgico e pergunte o que ele comunica." }),
  espiritualidade: chapter({ eyebrow: "Capítulo 3", title: "Aprender a permanecer diante de Deus", lead: "A oração cristã forma em nós uma atenção nova: menos ansiedade por controlar e mais disponibilidade para escutar.", body: ["A tradição ortodoxa conhece a oração como trabalho do coração. Ela inclui palavras, silêncio, salmos, prostrações, jejum e a repetição humilde do nome de Jesus.", "Não se trata de fabricar uma sensação espiritual. Trata-se de voltar, muitas vezes, à presença de Deus com simplicidade, inclusive quando não sentimos nada extraordinário."], keep: "A constância humilde vale mais que a intensidade passageira.", practice: "Reserve cinco minutos por dia para permanecer em silêncio e dizer lentamente a Oração de Jesus." }),
  liturgia: chapter({ eyebrow: "Capítulo 4", title: "Entrar no tempo da Igreja", lead: "O ano litúrgico nos ensina a viver o tempo não como consumo de novidades, mas como memória e expectativa da obra de Cristo.", body: ["Festas, jejuns, vigílias e domingos dão forma ao calendário cristão. Eles nos retiram do improviso permanente e nos devolvem a uma história maior que nossa própria pressa.", "A liturgia não é uma apresentação para espectadores. É o povo reunido para agradecer, ouvir, oferecer e comungar."], keep: "O tempo da Igreja educa o desejo e torna a fé praticável.", practice: "Consulte o calendário litúrgico desta semana e escolha uma celebração ou oração para acompanhar." }),
  historia: chapter({ eyebrow: "Capítulo 5", title: "Receber uma memória viva", lead: "A tradição não é uma peça de museu: é a memória viva de um povo que continua aprendendo a seguir Cristo.", body: ["Os santos, os padres, os concílios e as comunidades cristãs nos ajudam a discernir. Eles não eliminam nossa responsabilidade; oferecem companhia e critérios para que não confundamos novidade com verdade.", "Conhecer a história da Igreja é aprender a reconhecer continuidades, feridas, testemunhos e a paciência de Deus ao longo das gerações."], keep: "Ninguém começa sozinho; recebemos uma herança para cuidar e transmitir.", practice: "Leia uma breve vida de santo e identifique uma prática concreta que pode ser imitada." }),
  paroxia: chapter({ eyebrow: "Capítulo 6", title: "Tornar-se presença entre pessoas", lead: "A paróquia é o lugar onde a fé deixa de ser apenas intenção pessoal e se torna convivência, serviço e responsabilidade.", body: ["Uma comunidade cristã reúne pessoas diferentes, com ritmos e histórias diferentes. Aprender a permanecer com elas também faz parte da conversão.", "Participar não significa apenas assistir à celebração. É aprender nomes, oferecer ajuda, respeitar o trabalho escondido e descobrir onde nossa presença pode servir."], keep: "A vida cristã amadurece em comunhão, não em isolamento.", practice: "Depois da próxima celebração, permaneça alguns minutos e conheça uma pessoa da comunidade." }),
  "proximos-passos": chapter({ eyebrow: "Capítulo 7", title: "O próximo passo é um encontro real", lead: "Este guia termina apontando para fora de si: para os encontros oficiais, o sacerdote, a comunidade e uma vida que continua sendo acompanhada.", body: ["Nenhuma leitura substitui a catequese presencial ou o discernimento pastoral. O conteúdo introdutório serve para orientar o primeiro passo e tornar as perguntas mais honestas.", "Abaixo desta experiência estão os encontros oficiais da Paróquia São Jorge. Leia-os no seu ritmo, leve dúvidas ao acompanhamento e permita que o caminho tenha tempo."], keep: "O guia é uma porta de entrada; a formação acontece em uma caminhada acompanhada.", practice: "Abra o primeiro encontro oficial e escolha uma data para começar." }),
};

// ===== MAIN APP =====
const GuiaCatecumenal = () => {
  const [sec, setSec] = useState<GuideSectionId>("intro");
  const [cq, setCq] = useState<Record<string, boolean>>({});
  const [showQ, setShowQ] = useState(false);
  const [curQ, setCurQ] = useState<GuideQuiz | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [selA, setSelA] = useState<number | null>(null);
  const [showFb, setShowFb] = useState(false);
  const [score, setScore] = useState(0);
  const [qDone, setQDone] = useState(false);
  const [notif, setNotif] = useState<Array<{ id: number; m: string; t: string }>>([]);

  const idx = Math.max(0, S.findIndex((s) => s.i === sec));
  const sd = S[idx];
  const pg = ((idx + 1) / S.length) * 100;
  const activeQuiz = sd?.q ? Q[sd.q] : null;

  const addN = useCallback((m: string, t = "info") => {
    const id = Date.now();
    setNotif((prev) => [...prev, { id, m, t }]);
    setTimeout(() => setNotif((prev) => prev.filter((n) => n.id !== id)), 5000);
  }, []);

  const hAnswer = useCallback(
    (i: number) => {
      if (selA !== null) return;
      setSelA(i);
    if (!curQ) return;
    const isC = i === curQ.q[qIdx].c;
      if (isC) {
        setScore((s) => s + 1);
        addN("Correto! ✓", "ok");
      } else addN("Incorreto. Tente novamente!", "err");
      setShowFb(true);
    },
    [selA, curQ, qIdx, addN]
  );

  const hFinish = useCallback(() => {
    if (!curQ) return;
    setQDone(true);
    setCq((prev) => ({ ...prev, [sec]: true }));
    const pct = Math.round((score / curQ.q.length) * 100);
    addN(`Revisão concluída: ${pct}% de acertos.`, "ok");
  }, [sec, score, curQ, addN]);

  const hNext = useCallback(() => {
    if (!curQ) return;
    if (qIdx < curQ.q.length - 1) {
      setQIdx((i) => i + 1);
      setSelA(null);
      setShowFb(false);
    } else hFinish();
  }, [qIdx, curQ, hFinish]);

  const hRestart = () => {
    setQIdx(0);
    setSelA(null);
    setScore(0);
    setQDone(false);
    setShowFb(false);
    setShowQ(false);
  };

  const hStartQ = () => {
    if (!activeQuiz) return;
    setCurQ(activeQuiz);
    setShowQ(true);
    setQIdx(0);
    setSelA(null);
    setScore(0);
    setQDone(false);
    setShowFb(false);
  };

  const goN = () => {
    if (idx < S.length - 1) setSec(S[idx + 1].i);
  };

  const goP = () => {
    if (idx > 0) setSec(S[idx - 1].i);
  };

  const CurrentSection = sectionComponents[sec] ?? BemVindo;

  return (
    <div className="flex min-h-screen flex-col bg-lit-bg text-lit-text">
      {/* Conteúdo primeiro; a navegação pertence ao rodapé do guia. */}
      <main className="min-w-0 flex-1 px-4 pb-8 pt-6 sm:px-6 md:px-10 md:pt-8">
        <div className="mx-auto w-full max-w-5xl">
          {/* HEADER */}
          <header className="sticky top-0 z-30 mb-6 flex items-center justify-between border-b border-stone-700/30 bg-stone-800/80 p-4 backdrop-blur-sm">
            <div className="flex min-w-0 items-center gap-3">
              <IconChurch2 size={24} color="#d4af37" />
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg text-lit-gold sm:text-xl">Guia Catecumenal Interativo</h1>
                <p className="text-xs text-stone-500">{sd?.st}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">{idx + 1} / {S.length}</span>
              <div className="hidden h-2 w-16 overflow-hidden rounded-full bg-stone-700 sm:block">
                <div className="h-full bg-lit-gold transition-all" style={{ width: `${pg}%` }} />
              </div>
              <button onClick={goP} disabled={idx === 0} className="rounded p-1 text-stone-400 hover:text-lit-gold disabled:opacity-30" aria-label="Seção anterior">
                <IconChevronLeft size={20} />
              </button>
              <button onClick={goN} disabled={idx === S.length - 1} className="rounded p-1 text-stone-400 hover:text-lit-gold disabled:opacity-30" aria-label="Próxima seção">
                <IconChevronRight size={20} />
              </button>
            </div>
          </header>
          <AnimatePresence mode="wait">
            <motion.div key={sec} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              {React.createElement(CurrentSection, { onStart: goN })}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* FOOTER DE NAVEGAÇÃO */}
      <motion.footer
        className="border-t border-stone-700/40 bg-stone-900 px-4 py-5 text-stone-200 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]"
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-700/50 pb-4">
            <div>
              <p className="font-ui text-xs uppercase tracking-[0.18em] text-lit-gold">Guia introdutório</p>
              <p className="mt-1 text-xs text-stone-500">Uma primeira leitura antes dos encontros oficiais</p>
            </div>
            <span className="font-ui text-xs text-stone-500">{Math.round(pg)}% do caminho</span>
          </div>

        <nav aria-label="Seções do guia" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {S.map((s, i) => {
            const isA = sec === s.i;
            const isC = cq[s.i] ?? false;
            return (
              <motion.button
                key={s.i}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-2 py-2 text-center text-xs font-ui transition-all ${
                  isA
                    ? "bg-lit-gold/20 text-lit-gold font-bold"
                    : "text-stone-300 hover:bg-stone-800 hover:text-white"
                }`}
                onClick={() => {
                  setSec(s.i);
                  setShowQ(false);
                }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
              >
                <span className="flex-shrink-0">{s.ic}</span>
                <span className="flex-1">{s.t}</span>
                {isC && <IconCheck size={16} className="text-lit-gold" />}
              </motion.button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          {sd?.q && (
            <motion.button
              className="w-full bg-lit-gold text-lit-bg px-3 py-2 rounded-lg font-ui text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              onClick={hStartQ}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconAward size={16} /> Quiz da Seção
            </motion.button>
          )}
        </div>
        </div>
      </motion.footer>

        {/* NOTIFICATIONS */}
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
          <AnimatePresence>
            {notif.map((n) => (
              <motion.div
                key={n.id}
                className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 shadow-lg ${
                  n.t === "ok" ? "bg-green-500" : n.t === "err" ? "bg-red-500" : "bg-blue-500"
                }`}
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {n.t === "ok" && <IconCheck size={18} />}
                {n.t === "err" && <IconBan size={18} />}
                {n.t === "info" && <IconCircleInfo size={18} />}
                <span>{n.m}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* QUIZ MODAL */}
        <AnimatePresence>{showQ && curQ && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQ(false)}
          >
            <motion.div
              className="bg-stone-900 text-stone-200 rounded-xl max-w-2xl w-11/12 max-h-[80vh] overflow-y-auto border border-lit-gold"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {!qDone ? (
                <>
                  <div className="p-6 border-b border-stone-700">
                    <div className="flex justify-between items-center">
                      <h2 className="font-display text-xl text-lit-gold flex items-center gap-2">
                        <IconCircleInfo size={24} />
                        {curQ.t}
                      </h2>
                      <button
                        onClick={() => setShowQ(false)}
                        className="text-stone-500 hover:text-white"
                      >
                        <IconBan size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-stone-400 mb-4">{curQ.d}</p>

                    <div className="flex justify-between items-center mb-4 p-3 bg-stone-800 rounded-lg">
                      <span className="text-lit-gold font-semibold">
                        Questão {qIdx + 1} de {curQ.q.length}
                      </span>
                      <span className="text-lit-gold font-semibold">
                        Pontuação: {score}/{curQ.q.length}
                      </span>
                    </div>

                    <p className="font-display text-lg text-lit-text mb-4 p-3 bg-stone-800/50 rounded-lg">
                      {curQ.q[qIdx].q}
                    </p>

                    <div className="space-y-2">
                      {curQ.q[qIdx].o.map((o: string, i: number) => {
                        const isS = selA === i;
                        const isC = i === curQ.q[qIdx].c;
                        const isW = isS && !isC;
                        return (
                          <button
                            key={i}
                            className={`w-full text-left px-4 py-3 rounded-lg font-ui text-sm transition-all ${
                              isS
                                ? isC
                                  ? "bg-green-500/20 border border-green-500 text-white"
                                  : "bg-red-500/20 border border-red-500 text-white"
                                : "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
                            }`}
                            onClick={() => hAnswer(i)}
                            disabled={selA !== null}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                            {o}
                            {isS && isC && <IconCheck size={20} className="float-right text-green-400" />}
                            {isW && <IconBan size={20} className="float-right text-red-400" />}
                          </button>
                        );
                      })}
                    </div>

                    {showFb && (
                      <motion.div
                        className={`mt-4 p-4 rounded-lg border-l-4 ${
                          selA === curQ.q[qIdx].c
                            ? "bg-green-500/10 border-green-500"
                            : "bg-red-500/10 border-red-500"
                        }`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-sm text-lit-text font-italic">
                          <strong>Explicação:</strong> {curQ.q[qIdx].e}
                        </p>
                      </motion.div>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                      {qIdx > 0 && (
                        <button
                          onClick={() => {
                            setQIdx((i) => i - 1);
                            setSelA(null);
                            setShowFb(false);
                          }}
                          className="px-4 py-2 bg-stone-700 rounded-lg font-ui text-sm flex items-center gap-1"
                        >
                          <IconChevronLeft size={18} /> Voltar
                        </button>
                      )}
                      <button
                        onClick={hNext}
                        className="px-4 py-2 bg-lit-gold text-lit-bg rounded-lg font-ui text-sm font-semibold flex items-center gap-1"
                      >
                        {qIdx < curQ.q.length - 1 ? "Próxima" : "Finalizar"}
                        <IconChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <motion.div
                    className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, var(--lit-gold), var(--lit-red))` }}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <IconAward size={48} color="white" />
                  </motion.div>
                  <h2 className="font-display text-2xl text-lit-gold mb-2">Quiz Concluído!</h2>
                  <p className="text-stone-300 mb-4">
                    Sua pontuação: {score}/{curQ.q.length} ({Math.round((score / curQ.q.length) * 100)}%)
                  </p>
                  <div className="w-full h-3 bg-stone-700 rounded-full mb-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-lit-gold to-lit-red"
                      initial={{ width: 0 }}
                      animate={{ width: `${(score / curQ.q.length) * 100}%` }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="flex justify-center gap-4 mt-6">
                    <button
                      onClick={hRestart}
                      className="px-6 py-2 bg-lit-gold text-lit-bg rounded-lg font-ui font-semibold"
                    >
                      Reiniciar Quiz
                    </button>
                    <button
                      onClick={() => setShowQ(false)}
                      className="px-6 py-2 border border-lit-gold text-lit-gold rounded-lg font-ui"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuiaCatecumenal;
