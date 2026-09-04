"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  IconStar,
  IconCircleInfo,
  IconAward,
  IconClock,
  IconHouse,
  IconGraduationCap,
  IconMoon,
  IconSunCloud,
  IconGift,
  IconCrosshairs2,
} from "nucleo-sharp";
import { BemVindo, Fundamentos, Sacramentos, Espiritualidade, Liturgia, Historia, Paroxia, Leituras } from "./SecoesCatecumenal";

// ===== QUIZZES =====
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

// ===== SECTIONS =====
const S = [
  { i: "bem-vindo", t: "Bem-Vindo", st: "Início da jornada", ic: <IconChurch2 size={24} />, q: null },
  { i: "fundamentos", t: "Fundamentos da Fé", st: "Pilares da Ortodoxia", ic: <IconHeart2 size={24} />, q: "f" },
  { i: "sacramentos", t: "Vida Sacramental", st: "Santos Mistérios", ic: <IconChurch2 size={24} />, q: "sac" },
  { i: "espiritualidade", t: "Vida Espiritual", st: "Oração e ascese", ic: <IconBrain size={24} />, q: "e" },
  { i: "liturgia", t: "Ciclo Litúrgico", st: "Festas e jejuns", ic: <IconCalendar size={24} />, q: null },
  { i: "historia", t: "História e Tradição", st: "Igreja Apostólica", ic: <IconBook size={24} />, q: null },
  { i: "paroxia", t: "Vida na Paróquia", st: "Comunidade São Jorge", ic: <IconUsers2 size={24} />, q: null },
  { i: "leituras", t: "Leituras", st: "Recursos para estudo", ic: <IconBook size={24} />, q: null },
] as const;

const sectionComponents: Record<string, React.ComponentType<any>> = {
  "bem-vindo": BemVindo as React.ComponentType<any>,
  fundamentos: Fundamentos,
  sacramentos: Sacramentos,
  espiritualidade: Espiritualidade,
  liturgia: Liturgia,
  historia: Historia,
  paroxia: Paroxia,
  leituras: Leituras,
};

// ===== MAIN APP =====
const GuiaCatecumenal = () => {
  const [sec, setSec] = useState("fundamentos");
  const [pg, setPg] = useState(0);
  const [cq, setCq] = useState<Record<string, boolean>>({});
  const [showQ, setShowQ] = useState(false);
  const [curQ, setCurQ] = useState<any>(null);
  const [qIdx, setQIdx] = useState(0);
  const [selA, setSelA] = useState<number | null>(null);
  const [showFb, setShowFb] = useState(false);
  const [score, setScore] = useState(0);
  const [qDone, setQDone] = useState(false);
  const [notif, setNotif] = useState<Array<{ id: number; m: string; t: string }>>([]);

  const idx = S.findIndex((s) => s.i === sec);
  const sd = S.find((s) => s.i === sec);

  useEffect(() => {
    setPg(((idx + 1) / S.length) * 100);
  }, [idx]);

  useEffect(() => {
    if (sd?.q) setCurQ(Q[sd.q as keyof typeof Q]);
  }, [sd]);

  const addN = useCallback((m: string, t = "info") => {
    const id = Date.now();
    setNotif((prev) => [...prev, { id, m, t }]);
    setTimeout(() => setNotif((prev) => prev.filter((n) => n.id !== id)), 5000);
  }, []);

  const hAnswer = useCallback(
    (i: number) => {
      if (selA !== null) return;
      setSelA(i);
      const isC = i === curQ.q[qIdx].c;
      if (isC) {
        setScore((s) => s + 1);
        addN("Correto! ✓", "ok");
      } else addN("Incorreto. Tente novamente!", "err");
      setShowFb(true);
    },
    [selA, curQ, qIdx, addN]
  );

  const hNext = useCallback(() => {
    if (qIdx < curQ.q.length - 1) {
      setQIdx((i) => i + 1);
      setSelA(null);
      setShowFb(false);
    } else hFinish();
  }, [qIdx, curQ, score]);

  const hFinish = useCallback(() => {
    setQDone(true);
    setCq((prev) => ({ ...prev, [sec]: true }));
    const pct = Math.round((score / curQ.q.length) * 100);
    addN(`Quiz concluído! ${pct}% de acertos!`, "ok");
  }, [sec, score, curQ, addN]);

  const hRestart = () => {
    setQIdx(0);
    setSelA(null);
    setScore(0);
    setQDone(false);
    setShowFb(false);
    setShowQ(false);
  };

  const hStartQ = () => {
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
    <div className="flex min-h-screen bg-lit-bg text-lit-text">
      {/* SIDEBAR */}
      <motion.nav
        className="w-64 md:w-80 bg-stone-900 text-stone-200 p-4 overflow-y-auto fixed h-screen z-40"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="text-center mb-6 pb-4 border-b border-lit-gold/20">
          <div
            className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, var(--lit-gold), var(--lit-red))` }}
          >
            <IconChurch2 size={32} color="white" />
          </div>
          <h2 className="font-display text-lg text-lit-gold">Guia Catecumenal</h2>
          <p className="text-xs text-stone-500">São Jorge</p>
        </div>

        <nav className="space-y-1">
          {S.map((s, i) => {
            const isA = sec === s.i;
            const isC = cq[s.i] ?? false;
            return (
              <motion.button
                key={s.i}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm font-ui ${
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

        <div className="mt-6 space-y-2">
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
          <motion.button
            className="w-full bg-stone-700 text-stone-300 hover:bg-stone-600 px-3 py-2 rounded-lg font-ui text-sm flex items-center justify-center gap-2 transition-all"
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <IconMoon size={16} /> Modo Escuro
          </motion.button>
        </div>
      </motion.nav>

      {/* MAIN */}
      <div className="flex-1 ml-64 md:ml-80 p-6 md:ml-80">
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-stone-800/50 backdrop-blur-sm p-4 mb-6 border-b border-stone-700/30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <IconChurch2 size={24} color="#d4af37" />
            <div>
              <h1 className="font-display text-xl text-lit-gold">Guia Catecumenal Interativo</h1>
              <p className="text-xs text-stone-500">{sd?.st}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">
              {idx + 1} / {S.length}
            </span>
            <div className="w-16 h-2 bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-lit-gold transition-all"
                style={{ width: `${pg}%` }}
              />
            </div>
            <button
              onClick={goP}
              disabled={idx === 0}
              className="p-1 rounded text-stone-400 hover:text-lit-gold disabled:opacity-30"
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              onClick={goN}
              disabled={idx === S.length - 1}
              className="p-1 rounded text-stone-400 hover:text-lit-gold disabled:opacity-30"
            >
              <IconChevronRight size={20} />
            </button>
          </div>
        </header>

        {/* SECTION CONTENT */}
        <main className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={sec}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {React.createElement(CurrentSection)}
            </motion.div>
          </AnimatePresence>
        </main>

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
      </div>
  );
};

export default GuiaCatecumenal;
