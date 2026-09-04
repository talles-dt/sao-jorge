"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

// ===== COLORS (liturgical theme) =====
const c = {
  p: "var(--lit-bg)",
  s: "var(--lit-red)",
  a: "var(--lit-gold)",
  l: "#f8f9fa",
  d: "#0f0f1a",
  t: "#d6c8b4",
  b: "var(--lit-accent-border)",
  ok: "#28a745",
  err: "#dc3545",
  info: "#17a2b8",
};

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
  { i: "bem-vindo", t: "Bem-Vindo", st: "Início da jornada", ic: <IconChurch2 size={24} />, c: c.a, q: null },
  { i: "fundamentos", t: "Fundamentos da Fé", st: "Pilares da Ortodoxia", ic: <IconHeart2 size={24} />, c: c.p, q: "f" },
  { i: "sacramentos", t: "Vida Sacramental", st: "Santos Mistérios", ic: <IconChurch2 size={24} />, c: c.s, q: "sac" },
  { i: "espiritualidade", t: "Vida Espiritual", st: "Oração e ascese", ic: <IconBrain size={24} />, c: c.a, q: "e" },
  { i: "liturgia", t: "Ciclo Litúrgico", st: "Festas e jejuns", ic: <IconCalendar size={24} />, c: c.p, q: null },
  { i: "historia", t: "História e Tradição", st: "Igreja Apostólica", ic: <IconBook size={24} />, c: c.s, q: null },
  { i: "paroxia", t: "Vida na Paróquia", st: "Comunidade São Jorge", ic: <IconUsers2 size={24} />, c: c.a, q: null },
  { i: "leituras", t: "Leituras", st: "Recursos para estudo", ic: <IconBook size={24} />, c: c.p, q: null },
];

// ===== SECTION COMPONENTS =====

const BemVindo = ({ onStart }: { onStart: () => void }) => (
  <div className="space-y-8">
    <motion.div
      className="text-center"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h1 className="font-display text-3xl md:text-4xl text-lit-gold mb-4 flex items-center justify-center gap-3">
        <IconHouse size={32} color="#d4af37" /> Bem-Vindo ao Guia Catecumenal
      </h1>
      <p className="text-stone-400 italic">Início da sua jornada espiritual na Paróquia São Jorge</p>
    </motion.div>

    <motion.div
      className="bg-stone-900/50 rounded-xl p-8 lit-card"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="text-2xl font-display text-lit-gold mb-4">Querido Catecúmeno,</h2>
      <p className="text-lg text-lit-text-secondary leading-relaxed mb-4">
        Seja bem-vindo a este caminho de <strong className="text-lit-gold">descoberta, cura e transformação</strong> na
        Santa Igreja Ortodoxa. Este guia interativo foi preparado para acompanhá-lo em sua jornada catecumenal.
      </p>
      <p className="text-lg text-lit-text-secondary leading-relaxed mb-4">
        Aqui você encontrará:
      </p>
      <ul className="list-disc list-inside space-y-2 text-lit-text-secondary mb-4">
        <li><strong>Fundamentos da Fé:</strong> Ensinamentos essenciais</li>
        <li><strong>Vida Sacramental:</strong> Santos Mistérios</li>
        <li><strong>Práticas Espirituais:</strong> Oração, jejum, ascese</li>
        <li><strong>Quizzes Interativos:</strong> Teste seus conhecimentos</li>
        <li><strong>Recursos:</strong> Leituras e materiais</li>
      </ul>
    </motion.div>

    <motion.div
      className="bg-stone-900/30 border-l-4 border-lit-gold rounded-xl p-6"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-xl font-display text-lit-gold mb-4">Como usar este guia:</h3>
      <ol className="list-decimal list-inside space-y-3 text-lit-text-secondary">
        <li><strong>Navegue</strong> pelo menu lateral</li>
        <li><strong>Responda</strong> aos quizzes</li>
        <li><strong>Acompanhe</strong> seu progresso</li>
        <li><strong>Interaja</strong> com os elementos</li>
        <li><strong>Ative</strong> o modo escuro</li>
      </ol>
    </motion.div>

    <motion.div
      className="text-center"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.button
        className="bg-lit-gold text-lit-bg px-8 py-4 rounded-lg font-display text-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
        onClick={onStart}
        whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
        whileTap={{ scale: 0.95 }}
      >
        Iniciar Jornada <IconChevronRight size={20} />
      </motion.button>
    </motion.div>

    <motion.div
      className="text-lit-red italic text-lg border-l-4 border-lit-gold pl-4 py-3 bg-stone-900/20 rounded-r-lg"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      "O caminho para Deus não é um caminho de teorias, mas de amor."
      <footer className="block font-normal text-sm text-stone-500 mt-2">
        — Santo Inácio de Antiochia
      </footer>
    </motion.div>
  </div>
);

const Fundamentos = () => {
  const [exp, setExp] = useState<number | null>(null);
  const cards = [
    { i: 1, t: "O Credo Niceno-Constantinopolitano", desc: "O Credo é nossa confissão de fé, proclamada em cada Divina Liturgia.", icon: <IconBook size={28} color={c.a} /> },
    { i: 2, t: "Sagrada Tradição e Sagrada Escritura", desc: "A Tradição é a vida da Igreja. A Escritura é parte da Tradição.", icon: <IconChurch2 size={28} color={c.a} /> },
    { i: 3, t: "A Santíssima Trindade", desc: "Um Deus em Três Pessoas: Pai, Filho, Espírito Santo.", icon: <IconHeart2 size={28} color={c.a} /> },
    { i: 4, t: "Cristologia", desc: "Jesus Cristo é Verdadeiro Deus e Verdadeiro Homem.", icon: <IconCrosshairs2 size={28} color={c.a} /> },
  ];
  return (
    <div className="space-y-8">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 className="font-display text-3xl md:text-4xl text-lit-gold mb-2 flex items-center gap-3">
          <IconHeart2 size={32} color={c.a} /> Fundamentos da Fé Ortodoxa
        </h1>
        <p className="text-stone-400 italic">"Os pilares que sustentam a nossa fé"</p>
      </motion.div>
      <motion.p
        className="text-lg text-lit-text-secondary leading-relaxed"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        A fé ortodoxa é <strong className="text-lit-gold">apostólica, patrística e litúrgica</strong>. Não é uma invenção humana, mas a <strong className="text-lit-gold">Tradição viva</strong> transmitida por Cristo aos Apóstolos.
      </motion.p>

      <motion.h3
        className="text-xl font-display text-lit-gold"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Os Quatro Pilares
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.i}
            className="bg-stone-900/50 rounded-xl p-6 border border-stone-700/30 lit-card cursor-pointer transition-all duration-300"
            onClick={() => setExp(exp === card.i ? null : card.i)}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              {card.icon}
              <h3 className="text-white font-display text-sm">{card.t}</h3>
            </div>
            {exp === card.i && (
              <p className="text-sm text-stone-400 leading-relaxed">{card.desc}</p>
            )}
            <div className="mt-3 text-right">
              <motion.span
                className="inline-block text-lit-accent transition-transform duration-300"
                animate={{ rotate: exp === card.i ? 90 : 0 }}
              >
                <IconChevronRight size={18} />
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="bg-stone-900/30 border-l-4 border-lit-gold rounded-xl p-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-display text-lit-gold mb-3">A Santíssima Trindade</h3>
        <p className="text-center text-lit-red italic mb-4">
          "Um só Deus em Três Pessoas: Pai, Filho e Espírito Santo"
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { t: "Deus Pai", d: "Fonte da Divindade" },
            { t: "Deus Filho", d: "Verbo de Deus feito homem" },
            { t: "Deus Espírito Santo", d: "Dador de Vida, Santificador" },
          ].map((x, i) => (
            <div key={i} className="bg-stone-800/50 rounded-lg p-4 text-center">
              <h4 className="text-lit-gold font-display mb-2 flex items-center justify-center gap-2">
                <span className="w-8 h-8 bg-lit-gold/20 rounded-full flex items-center justify-center">{i + 1}</span>
                {x.t}
              </h4>
              <p className="text-sm text-stone-400">{x.d}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="text-lit-red italic text-lg border-l-4 border-lit-gold pl-4 py-3 bg-stone-900/20 rounded-r-lg"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        "A fé não é um assentimento intelectual abstrato, mas uma comunhão vivencial com Deus."
        <footer className="block font-normal text-sm text-stone-500 mt-2">— Tradição Patrística</footer>
      </motion.div>
    </div>
  );
};

const Sacramentos = () => {
  const [tab, setTab] = useState("bat");
  const s = [
    { i: "bat", t: "Santo Batismo", ic: <IconGift size={32} color={c.a} />, d: "Entrada no Corpo de Cristo", det: "Tripla imersão na água em nome da Trindade.", v: '"Quem não nascer da água e do Espírito..." (Jo 3:5)' },
    { i: "euc", t: "Divina Eucaristia", ic: <IconChurch2 size={32} color={c.a} />, d: "Corpo e Sangue de Cristo", det: "Pão e vinho consagrados na Divina Liturgia.", v: '"Tomai, comei: isto é o meu Corpo..." (Mt 26:26-28)' },
    { i: "conf", t: "Santa Confissão", ic: <IconHeart2 size={32} color={c.a} />, d: "Sacramento da Metanoia", det: "Arrependimento e perdão dos pecados.", v: '"Os pecados que perdoardes, são-lhes perdoados." (Jo 20:23)' },
    { i: "cris", t: "Santa Crismação", ic: <IconStar size={32} color={c.a} />, d: "Selo do Espírito Santo", det: "Unção com o Santo Myron após o Batismo.", v: '"Recebereis a virtude do Espírito Santo." (At 1:8)' },
  ];
  return (
    <div className="space-y-8">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 className="font-display text-3xl md:text-4xl text-lit-gold mb-2 flex items-center gap-3">
          <IconChurch2 size={32} color={c.a} /> Vida Sacramental
        </h1>
        <p className="text-stone-400 italic">"Os Santos Mistérios da Igreja"</p>
      </motion.div>
      <motion.p
        className="text-lg text-lit-text-secondary leading-relaxed"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Os <strong className="text-lit-gold">Santos Mistérios</strong> são meios de graça pelos quais Deus age em nossas vidas.
      </motion.p>

      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {s.map((x, i) => (
          <motion.button
            key={x.i}
            className={`flex-1 min-w-[160px] px-4 py-3 rounded-lg font-ui text-sm font-semibold transition-all duration-300 ${
              tab === x.i
                ? "bg-lit-gold text-lit-bg"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
            onClick={() => setTab(x.i)}
          >
            <div className="flex flex-col items-center gap-2">
              {x.ic}
              <span>{x.t}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {s.map(
          (x) =>
            tab === x.i && (
              <motion.div
                key={x.i}
                className="bg-stone-900/30 border-l-4 border-lit-gold rounded-xl p-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-display text-lit-gold mb-3 flex items-center gap-3">
                  {x.ic} {x.t}
                </h3>
                <p className="text-lit-text-secondary mb-2">
                  <strong>Significado:</strong> {x.d}
                </p>
                <p className="text-lit-text-secondary mb-4">{x.det}</p>
                <div className="p-4 bg-stone-800/50 rounded-lg border-l-2 border-lit-gold">
                  <p className="font-italic text-lit-red">{x.v}</p>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      <motion.div
        className="bg-stone-900/50 rounded-xl p-6 lit-card"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-lg font-display text-lit-gold mb-4">Preparação para a Comunhão</h3>
        <ol className="space-y-3 text-lit-text-secondary">
          <li><strong>Confissão:</strong> Confessar-se regularmente</li>
          <li><strong>Jejum:</strong> Desde a meia-noite</li>
          <li><strong>Oração:</strong> Orações preparatórias</li>
          <li><strong>Vestimenta:</strong> Modéstia e respeito</li>
          <li><strong>Chegada:</strong> Antedência para a Liturgia</li>
        </ol>
      </motion.div>

      <motion.div
        className="text-lit-red italic text-lg border-l-4 border-lit-gold pl-4 py-3 bg-stone-900/20 rounded-r-lg"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        "A Eucaristia é o centro da vida da Igreja, o sacramento dos sacramentos."
        <footer className="block font-normal text-sm text-stone-500 mt-2">— São João Crisóstomo</footer>
      </motion.div>
    </div>
  );
};

const Espiritualidade = () => {
  const [exp, setExp] = useState<number | null>(null);
  const p = [
    { i: "or", t: "Oração", d: "O respiro da alma", det: "Conversa com Deus: litúrgica, pessoal, mental ou de intercessão.", tip: "Estabeleça regra diária: manhã e noite.", icon: <IconHeart2 size={32} color={c.a} /> },
    { i: "je", t: "Jejum", d: "Ferramenta espiritual", det: "Disciplina corpo e alma. Lembrança de que não só de pão vive o homem.", tip: "Principais: Grande Quaresma, Apóstolos, Dormição, Natal.", icon: <IconClock size={32} color={c.a} /> },
    { i: "he", t: "Hesiquia", d: "Silêncio interior", det: "Prática da Oração de Jesus com o coração, sincronizada com a respiração.", tip: "Use o komboskini (terço ortodoxo).", icon: <IconBrain size={32} color={c.a} /> },
    { i: "co", t: "Combate às Paixões", d: "Libertação do pecado", det: "Identifique, confesse, vigie, ore, jejue, pratique virtudes.", tip: "As paixões nos afastam de Deus.", icon: <IconCrosshairs2 size={32} color={c.a} /> },
  ];
  return (
    <div className="space-y-8">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 className="font-display text-3xl md:text-4xl text-lit-gold mb-2 flex items-center gap-3">
          <IconBrain size={32} color={c.a} /> Vida Espiritual e Ascese
        </h1>
        <p className="text-stone-400 italic">"Oração, jejum e combate às paixões"</p>
      </motion.div>
      <motion.p
        className="text-lg text-lit-text-secondary leading-relaxed"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        A vida cristã ortodoxa é uma <strong className="text-lit-gold">jornada de transformação</strong> (Theosis) na qual nos tornamos cada vez mais semelhantes a Cristo.
      </motion.p>

      <motion.h3
        className="text-xl font-display text-lit-gold"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        As Quatro Práticas
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {p.map((x, i) => (
          <motion.div
            key={x.i}
            className={`bg-stone-900/50 rounded-xl p-6 border lit-card cursor-pointer transition-all duration-300 ${
              exp === i ? "border-lit-gold" : "border-stone-700/30"
            }`}
            onClick={() => setExp(exp === i ? null : i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          >
            <div className="flex items-center gap-4 mb-3">
              {x.icon}
              <h3 className="text-xl font-display text-lit-gold">{x.t}</h3>
            </div>
            <p className="text-lit-text-secondary mb-2">{x.d}</p>
            {exp === i && (
              <>
                <p className="text-sm text-stone-400 leading-relaxed mb-3">{x.det}</p>
                <div className="p-3 bg-stone-800/50 rounded-lg border-l-2 border-lit-gold">
                  <strong className="text-lit-red text-xs">Dica:</strong>{" "}
                  <span className="text-xs text-stone-400">{x.tip}</span>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="bg-stone-900/30 border-l-4 border-lit-gold rounded-xl p-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-display text-lit-gold mb-3">A Oração de Jesus</h3>
        <div className="p-6 bg-gradient-to-r from-lit-gold/10 to-lit-red/5 rounded-lg text-center mb-4">
          <p className="text-xl italic">"Senhor Jesus Cristo, Filho de Deus,</p>
          <p className="text-xl italic">tem misericórdia de mim, pecador"</p>
        </div>
        <div className="space-y-2 text-sm text-lit-text-secondary">
          <p><strong>Origem:</strong> Baseada na oração do publicano (Lc 18:13).</p>
          <p><strong>Prática:</strong> Repetir com o coração, sincronizada com a respiração.</p>
          <p><strong>Benefícios:</strong> Purifica o coração, traz paz, protege, une a Cristo.</p>
        </div>
      </motion.div>

      <motion.div
        className="text-lit-red italic text-lg border-l-4 border-lit-gold pl-4 py-3 bg-stone-900/20 rounded-r-lg"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        "A alma que deseja aproximar-se de Deus deve primeiro purificar-se das paixões."
        <footer className="block font-normal text-sm text-stone-500 mt-2">— São Doroteu de Gaza</footer>
      </motion.div>
    </div>
  );
};

const Liturgia = () => {
  const [exp, setExp] = useState<number | null>(null);
  const festas = [
    { i: "pas", t: "Páscoa", d: "25 de Dezembro", det: "Celebração da Ressurreição de Cristo - a Festa das Festas.", icon: <IconCrosshairs2 size={32} color={c.a} /> },
    { i: "nat", t: "Natal", d: "25 de Dezembro", det: "Nascimento de Nosso Senhor Jesus Cristo.", icon: <IconGift size={32} color={c.a} /> },
    { i: "teo", t: "Teofania", d: "6 de Janeiro", det: "Batismo de Cristo e revelação da Trindade.", icon: <IconStar size={32} color={c.a} /> },
    { i: "pen", t: "Pentecostes", d: "50 dias após Páscoa", det: "Descida do Espírito Santo sobre os Apóstolos.", icon: <IconHeart2 size={32} color={c.a} /> },
  ];
  const jejuns = [
    { n: "Grande Quaresma", d: "40 dias", desc: "Preparação para a Páscoa" },
    { n: "Jejum dos Apóstolos", d: "Variável", desc: "De Pentecostes a 28 de Junho" },
    { n: "Jejum da Dormição", d: "14 dias", desc: "De 1 a 14 de Agosto" },
    { n: "Jejum do Natal", d: "40 dias", desc: "De 15 Nov a 24 Dez" },
  ];
  return (
    <div className="space-y-8">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 className="font-display text-3xl md:text-4xl text-lit-gold mb-2 flex items-center gap-3">
          <IconCalendar size={32} color={c.a} /> Ciclo Litúrgico
        </h1>
        <p className="text-stone-400 italic">"Festas, jejuns e celebrações"</p>
      </motion.div>
      <motion.p
        className="text-lg text-lit-text-secondary leading-relaxed"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        A Igreja vive segundo um <strong className="text-lit-gold">calendário litúrgico</strong> que nos ajuda a meditar os mistérios da salvação.
      </motion.p>

      <motion.h3
        className="text-xl font-display text-lit-gold"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        As Grandes Festas
      </motion.h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {festas.map((x, i) => (
          <motion.div
            key={x.i}
            className={`bg-stone-900/50 rounded-xl p-6 border lit-card cursor-pointer transition-all duration-300 ${
              exp === i ? "border-lit-gold" : "border-stone-700/30"
            }`}
            onClick={() => setExp(exp === i ? null : i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                {x.icon}
                <h3 className="text-lg font-display text-lit-gold">{x.t}</h3>
              </div>
              <span className="text-xs bg-lit-bg/10 text-lit-text-secondary px-2 py-1 rounded">
                {x.d}
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">{x.det}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="bg-stone-900/30 border-l-4 border-lit-gold rounded-xl p-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-display text-lit-gold mb-3">Períodos de Jejum</h3>
        <p className="text-lit-text-secondary mb-4">
          Os jejuns são <strong className="text-lit-gold">ferramentas espirituais</strong> para disciplinar corpo e alma.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[500px]">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 bg-lit-gold/10 text-lit-gold font-ui text-sm uppercase tracking-wider">Jejum</th>
                <th className="text-left py-3 px-4 bg-lit-gold/10 text-lit-gold font-ui text-sm uppercase tracking-wider">Duração</th>
                <th className="text-left py-3 px-4 bg-lit-gold/10 text-lit-gold font-ui text-sm uppercase tracking-wider">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {jejuns.map((x, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 border-b border-stone-700/30"><strong className="text-lit-gold">{x.n}</strong></td>
                  <td className="py-3 px-4 border-b border-stone-700/30 text-stone-400">{x.d}</td>
                  <td className="py-3 px-4 border-b border-stone-700/30 text-stone-400">{x.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-stone-800/50 rounded-lg border-l-2 border-lit-gold">
          <strong className="text-lit-red text-xs">Nota:</strong>{" "}
          <span className="text-xs text-stone-400">
            Crianças, idosos, doentes, grávidas e amamentando estão isentos.
          </span>
        </div>
      </motion.div>

      <motion.div
        className="text-lit-red italic text-lg border-l-4 border-lit-gold pl-4 py-3 bg-stone-900/20 rounded-r-lg"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        "O ano litúrgico é como uma grande sinfonia da salvação."
        <footer className="block font-normal text-sm text-stone-500 mt-2">— Tradição Litúrgica</footer>
      </motion.div>
    </div>
  );
};

const Historia = () => (
  <div className="space-y-8">
    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <h1 className="font-display text-3xl md:text-4xl text-lit-gold mb-2 flex items-center gap-3">
        <IconBook size={32} color={c.a} /> História e Tradição
      </h1>
      <p className="text-stone-400 italic">"A Igreja Apostólica"</p>
    </motion.div>
    <motion.p
      className="text-lg text-lit-text-secondary leading-relaxed"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      Conhecer a <strong className="text-lit-gold">história da Igreja</strong> nos ajuda a compreender que a fé ortodoxa é a <strong className="text-lit-gold">Tradição Apostólica</strong> preservada ao longo de 2000 anos.
    </motion.p>

    <motion.div
      className="bg-stone-900/50 rounded-xl p-6 lit-card"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-xl font-display text-lit-gold mb-4">Linha do Tempo</h3>
      <div className="relative pl-8 border-l-2 border-lit-gold/40 space-y-8">
        {[
          { y: "Século I", t: "Era Apostólica", desc: "Os Apóstolos pregam e fundam comunidades." },
          { y: "Século II", t: "Pais Apostólicos", desc: "Discípulos dos Apóstolos escrevem cartas." },
          { y: "325 d.C.", t: "I Concílio de Niceia", desc: "Condena o arianismo." },
          { y: "1054 d.C.", t: "Grande Cisma", desc: "Separação entre Ortodoxa e Católica." },
          { y: "Século XX", t: "Ortodoxia no Brasil", desc: "Chegada dos imigrantes sírios e libaneses." },
        ].map((x, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-4 top-1 w-8 h-8 bg-lit-gold rounded-full border-2 border-lit-bg flex items-center justify-center text-xs font-bold">
              {i + 1}
            </div>
            <div className="bg-stone-800/30 rounded-lg p-4 border border-stone-700/30">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-lit-gold font-bold text-sm">{x.y}</span>
                <h4 className="font-display text-white">{x.t}</h4>
              </div>
              <p className="text-sm text-stone-400">{x.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>

    <motion.div
      className="bg-stone-900/30 border-l-4 border-lit-gold rounded-xl p-6"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-lg font-display text-lit-gold mb-3">A Sé Apostólica de Antioquia</h3>
      <p className="text-lit-text-secondary mb-3">
        A <strong className="text-lit-gold">Igreja Ortodoxa Grega de Antioquia</strong> é uma das <strong className="text-lit-gold">quatro Igrejas Autocéfalas mais antigas</strong>.
      </p>
      <ul className="list-disc list-inside space-y-2 text-sm text-stone-400">
        <li><strong>Fundação:</strong> Apóstolos Pedro e Paulo (Atos 11:26)</li>
        <li><strong>Primeiro Nome:</strong> "Cristãos" pela primeira vez</li>
        <li><strong>Sé Apostólica:</strong> Uma das três sedes petrinas</li>
        <li><strong>Atual Patriarca:</strong> Sua Beatitude João X</li>
      </ul>
    </motion.div>

    <motion.div
      className="text-lit-red italic text-lg border-l-4 border-lit-gold pl-4 py-3 bg-stone-900/20 rounded-r-lg"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      "A Igreja é apostólica porque é fundamentada nos Apóstolos."
      <footer className="block font-normal text-sm text-stone-500 mt-2">— Tradição Ortodoxa</footer>
    </motion.div>
  </div>
);

const Paroxia = () => (
  <div className="space-y-8">
    <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <h1 className="font-display text-3xl md:text-4xl text-lit-gold mb-2 flex items-center gap-3">
        <IconUsers2 size={32} color={c.a} /> Vida na Paróquia
      </h1>
      <p className="text-stone-400 italic">"Comunidade de São Jorge"</p>
    </motion.div>
    <motion.p
      className="text-lg text-lit-text-secondary leading-relaxed"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      A <strong className="text-lit-gold">Paróquia São Jorge</strong> é sua <strong className="text-lit-gold">família espiritual</strong>.
    </motion.p>

    <motion.div
      className="bg-stone-900/50 rounded-xl p-6 lit-card"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-xl font-display text-lit-gold mb-4">Nossa Comunidade</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-stone-800/30 rounded-lg p-4 border border-stone-700/30">
          <h4 className="text-lit-gold mb-2">
            <strong>Pároco:</strong> Pe. Samaan
          </h4>
          <p className="text-sm text-stone-400">Orientação espiritual da paróquia.</p>
        </div>
        <div className="bg-stone-800/30 rounded-lg p-4 border border-stone-700/30">
          <h4 className="text-lit-gold mb-2">
            <strong>Catequista:</strong> Talles Tonatto
          </h4>
          <p className="text-sm text-stone-400">Formação catecumenal.</p>
        </div>
      </div>
    </motion.div>

    <motion.div
      className="bg-stone-900/30 border-l-4 border-lit-gold rounded-xl p-6"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-lg font-display text-lit-gold mb-3">Ofícios Divinos</h3>
      <p className="text-lit-text-secondary mb-4">
        Os <strong className="text-lit-gold">Ofícios Divinos</strong> são o <strong className="text-lit-gold">coração da vida paroquial</strong>.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { t: "Vésperas", d: "Sábado à tarde", desc: "Preparação para o Domingo" },
          { t: "Divina Liturgia", d: "Domingo de manhã", desc: "Celebração central" },
          { t: "Encontros", d: "[Dia da semana]", desc: "Formação catecumenal" },
        ].map((x, i) => (
          <div key={i} className="bg-gradient-to-r from-lit-gold/10 to-lit-red/5 rounded-xl p-4 border border-stone-700/30">
            <h4 className="text-lit-gold font-display mb-2">{x.t}</h4>
            <p className="text-sm text-stone-300 mb-1">{x.d}</p>
            <p className="text-xs text-stone-400">{x.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-stone-800/50 rounded-lg border-l-2 border-lit-gold">
        <strong className="text-lit-red text-xs">Dica:</strong>{" "}
        <span className="text-xs text-stone-400">Tente participar de pelo menos um ofício por semana.</span>
      </div>
    </motion.div>

    <motion.div
      className="text-lit-red italic text-lg border-l-4 border-lit-gold pl-4 py-3 bg-stone-900/20 rounded-r-lg"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      "A paróquia é a família espiritual onde crescemos juntos."
      <footer className="block font-normal text-sm text-stone-500 mt-2">— Pe. Samaan</footer>
    </motion.div>
  </div>
);

const Leituras = () => {
  const [cat, setCat] = useState("pat");
  const cats = [
    {
      i: "pat",
      t: "Antologia Patrística",
      ic: <IconBook size={32} color={c.a} />,
      d: "Obras dos Santos Padres",
      it: [
        { a: "Santo Inácio", w: "Cartas", th: "Fé, amor, unidade" },
        { a: "São Doroteu", w: "Instruções", th: "Combate às paixões" },
        { a: "São João Clímaco", w: "A Escada", th: "Ascese espiritual" },
        { a: "São Isaac", w: "Discursos", th: "Oração, amor" },
      ],
    },
    {
      i: "ini",
      t: "Livros para Iniciantes",
      ic: <IconGraduationCap size={32} color={c.a} />,
      d: "Introdução à fé ortodoxa",
      it: [
        { a: "Pe. Thomas Hopko", w: "A Fé Ortodoxa", th: "Visão geral" },
        { a: "Kallistos Ware", w: "O Caminho Ortodoxo", th: "Introdução" },
        { a: "Kallistos Ware", w: "A Igreja Ortodoxa", th: "História e teologia" },
        { a: "Pe. John Main", w: "Oração do Coração", th: "Oração de Jesus" },
      ],
    },
    {
      i: "rec",
      t: "Recursos Online",
      ic: <IconStar size={32} color={c.a} />,
      d: "Sites e aplicativos úteis",
      it: [
        { n: "Ortodoxia.org", t: "Site", l: "Português" },
        { n: "Ancient Faith", t: "Site/Podcasts", l: "Inglês" },
        { n: "Orthodox Calendar", t: "App", l: "Calendário litúrgico" },
        { n: "Orthodox Prayer Book", t: "App", l: "Orações diárias" },
      ],
    },
  ];
  return (
    <div className="space-y-8">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 className="font-display text-3xl md:text-4xl text-lit-gold mb-2 flex items-center gap-3">
          <IconBook size={32} color={c.a} /> Leituras Recomendadas
        </h1>
        <p className="text-stone-400 italic">"Recursos para estudo e crescimento"</p>
      </motion.div>
      <motion.p
        className="text-lg text-lit-text-secondary leading-relaxed"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        A leitura espiritual é <strong className="text-lit-gold">alimento para a alma</strong>.
      </motion.p>

      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {cats.map((x, i) => (
          <motion.button
            key={x.i}
            className={`flex-1 min-w-[180px] px-4 py-3 rounded-lg font-ui text-sm font-semibold transition-all duration-300 ${
              cat === x.i
                ? "bg-lit-gold text-lit-bg"
                : "bg-stone-800 text-stone-300 hover:bg-stone-700"
            }`}
            onClick={() => setCat(x.i)}
          >
            <div className="flex flex-col items-center gap-2">
              {x.ic}
              <span>{x.t}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {cats.map(
          (x) =>
            cat === x.i && (
              <motion.div
                key={x.i}
                className="bg-stone-900/30 border-l-4 border-lit-gold rounded-xl p-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-display text-lit-gold mb-3 flex items-center gap-3">
                  {x.ic} {x.t}
                </h3>
                <p className="text-lit-text-secondary mb-4">{x.d}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {x.it.map((y, j) => (
                    <motion.div
                      key={j}
                      className="bg-stone-800/30 rounded-lg p-4 border border-stone-700/30"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * j }}
                    >
                      <h4 className="text-lit-gold font-display text-sm mb-1">
                        {(y as any).a || (y as any).n}
                      </h4>
                      <p className="text-xs text-stone-400">
                        <strong>{(y as any).w || (y as any).t}:</strong> {(y as any).th || (y as any).l}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      <motion.div
        className="text-lit-red italic text-lg border-l-4 border-lit-gold pl-4 py-3 bg-stone-900/20 rounded-r-lg"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        "A leitura dos Santos Padres é como um banquete espiritual."
        <footer className="block font-normal text-sm text-stone-500 mt-2">— São João Clímaco</footer>
      </motion.div>
    </div>
  );
};

export { Fundamentos, Sacramentos, Espiritualidade, Liturgia, Historia, Paroxia, Leituras, BemVindo };
