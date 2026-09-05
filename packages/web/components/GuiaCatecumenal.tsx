"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconAward,
  IconBan,
  IconBook,
  IconBuildingChurch,
  IconCalendar,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCross,
  IconGift,
  IconHome,
  IconInfoCircle,
  IconMenu,
  IconMessageUser,
  IconMoon,
  IconSun,
  IconStar,
  IconX,
} from "@tabler/icons-react";

/* ===== COLORS (mapped to liturgical theme variables) ===== */
const c = {
  p: "var(--lit-bg)",        // background
  s: "var(--lit-red)",       // secondary / accent
  a: "var(--lit-gold)",      // gold
  l: "var(--lit-light)",     // light card
  d: "var(--lit-dark)",      // dark bg
  t: "var(--lit-text)",      // text
  b: "#3e342b",              // border
  ok: "#28a745",
  err: "#dc3545",
  info: "#17a2b8",
};

/* ===== QUIZZES ===== */
const Q = {
  f: {
    t: "Quiz: Fundamentos",
    d: "Teste sobre os pilares.",
    q: [
      {
        q: "Quantas Pessoas na Trindade?",
        o: ["1", "2", "3", "4"],
        ca: 2,
        e: "Um Deus em Três Pessoas: Pai, Filho, Espírito Santo.",
      },
      {
        q: "Qual sacramento marca entrada na Igreja?",
        o: ["Eucaristia", "Batismo", "Confissão", "Crismação"],
        ca: 1,
        e: "O Batismo nos torna membros do Corpo de Cristo.",
      },
      {
        q: "O que significa Theotokos?",
        o: ["Mãe de Deus", "Mãe de Cristo", "Mãe da Igreja", "Mãe dos Santos"],
        ca: 0,
        e: "Theotokos = Mãe de Deus (em grego: Θεοτόκος).",
      },
    ],
  },
  sac: {
    t: "Quiz: Sacramentos",
    d: "Teste sobre os Santos Mistérios.",
    q: [
      {
        q: "Quantos Sacramentos?",
        o: ["5", "7", "10", "12"],
        ca: 1,
        e: "7 Santos Mistérios: Batismo, Crismação, Eucaristia, Confissão, Unção, Ordenação, Matrimônio.",
      },
      {
        q: "Centro da vida litúrgica?",
        o: ["Batismo", "Eucaristia", "Confissão", "Matrimônio"],
        ca: 1,
        e: "A Divina Liturgia (Eucaristia) é o coração da vida da Igreja.",
      },
      {
        q: "O que é necessário para comungar?",
        o: ["Jejuar", "Confessar", "Estar em graça", "Todas"],
        ca: 3,
        e: "Jejum eucarístico, confissão (se necessário), estado de graça.",
      },
    ],
  },
  e: {
    t: "Quiz: Espiritualidade",
    d: "Teste sobre práticas espirituais.",
    q: [
      {
        q: "Oração mais importante?",
        o: ["Oração de Jesus", "Pai Nosso", "Ave Maria", "Credo"],
        ca: 0,
        e: '"Senhor Jesus Cristo, Filho de Deus, tem misericórdia de mim, pecador"',
      },
      {
        q: "O que é hesiquia?",
        o: ["Silêncio interior", "Canto litúrgico", "Jejum", "Peregrinação"],
        ca: 0,
        e: "Hesiquia = silêncio interior, paz do coração.",
      },
      {
        q: "Propósito do jejum?",
        o: ["Perder peso", "Disciplinar corpo e alma", "Seguir lei", "Impressionar"],
        ca: 1,
        e: "Ferramenta espiritual para disciplinar corpo e alma.",
      },
    ],
  },
};

/* ===== SECTIONS ===== */
const S = [
  { i: "bem-vindo" as const, t: "Bem-Vindo", st: "Início da jornada", ic: <IconBuildingChurch size={24} />, c: c.a, q: null },
  { i: "fundamentos" as const, t: "Fundamentos da Fé", st: "Pilares da Ortodoxia", ic: <IconStar size={24} />, c: c.p, q: "f" as const },
  { i: "sacramentos" as const, t: "Vida Sacramental", st: "Santos Mistérios", ic: <IconBuildingChurch size={24} />, c: c.s, q: "sac" as const },
  { i: "espiritualidade" as const, t: "Vida Espiritual", st: "Oração e ascese", ic: <IconMoon size={24} />, c: c.a, q: "e" as const },
  { i: "liturgia" as const, t: "Ciclo Litúrgico", st: "Festas e jejuns", ic: <IconCalendar size={24} />, c: c.p, q: null },
  { i: "historia" as const, t: "História e Tradição", st: "Igreja Apostólica", ic: <IconBook size={24} />, c: c.s, q: null },
  { i: "paroxia" as const, t: "Vida na Paróquia", st: "Comunidade São Jorge", ic: <IconMessageUser size={24} />, c: c.a, q: null },
  { i: "leituras" as const, t: "Leituras", st: "Recursos para estudo", ic: <IconBook size={24} />, c: c.p, q: null },
];

/* ===== STYLES (Tailwind class names) ===== */
function cx(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

const st: Record<string, string> = {
  c: "min-h-screen bg-lit-bg font-serif flex overflow-hidden text-lit-text",
  sb: "w-[280px] text-white py-[20px] fixed h-screen overflow-y-auto z-[100] shadow-[2px_0_10px_rgba(0,0,0,0.1)]",
  m: "flex-1 ml-[280px] pt-[100px] px-[40px] pb-[40px] overflow-y-auto max-h-screen",
  h: "bg-lit-dark text-white px-[15px_40px] flex justify-between items-center fixed top-0 left-[280px] right-0 z-[99] shadow-[0_2px_10px_rgba(0,0,0,0.1)]",
  lg: "flex items-center gap-[10px] text-[18px] font-bold",
  pb: "h-[6px] bg-lit-bg rounded-[3px] overflow-hidden m-[0_20px]",
  pf: "h-full bg-gradient-to-r from-lit-gold to-lit-red rounded-[3px] transition-[width_0.5s_ease]",
  ni: "px-[12px_20px] m-[5px_15px] rounded-[8px] cursor-pointer transition-all-[all_0.3s_ease] flex items-center gap-[10px] text-[14px]",
  nia: "bg-lit-gold text-lit-dark font-bold",
  nih: "bg-[rgba(255,255,255,0.1)]",
  sc: "max-w-[1000px] mx-auto",
  sh: "mb-[30px] pb-[20px] border-b-[2px] border-lit-gold",
  st: "text-[32px] m-0 flex items-center gap-[15px]",
  sst: "text-[18px] italic mt-[10px_0_0_0]",
  card: "bg-lit-light rounded-[12px] p-[25px] m-[20px_0] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-lit-border transition-all-[all_0.3s_ease]",
  ch: "shadow-[0_8px_30px_rgba(0,0,0,0.15)] translate-y-[-2px]",
  hc: "bg-gradient-to-br from-lit-gold/15 to-lit-red/8 border-l-[4px] border-lit-gold rounded-[12px] p-[25px] m-[20px_0] shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
  qc: "bg-lit-light border-[2px] border-lit-gold rounded-[12px] p-[25px] m-[20px_0]",
  bt: "px-[12px_24px] rounded-[8px] border-none cursor-pointer text-[16px] font-bold transition-all-[all_0.3s_ease] inline-flex items-center gap-[8px]",
  btp: "bg-lit-dark text-lit-gold",
  bts: "bg-lit-red text-white",
  bta: "bg-lit-gold text-lit-dark",
  bth: "opacity-90 scale-102",
  quote: "italic text-lit-gold p-[20px_30px] border-l-[4px] border-lit-gold bg-lit-bg m-[25px_0] rounded-[0_8px_8px_0] text-[18px] leading-[1.8]",
  tl: "relative pl-[40px] m-[30px_0]",
  tll: "absolute left-[15px] top-0 bottom-0 w-[2px] bg-lit-dark",
  tli: "relative pl-[30px] mb-[30px]",
  td: "absolute left-[-40px] top-[8px] w-[24px] h-[24px] bg-lit-gold rounded-full flex items-center justify-center text-lit-dark text-[12px] font-bold",
  tt: "font-bold text-[16px] mb-[5px]",
  tc: "bg-lit-bg p-[12px] rounded-[8px] ml-[20px] text-[14px]",
  f: "text-center py-[30px] text-[14px] border-t-[1px] border-lit-border mt-[40px]",
};


/* ===== SECTION COMPONENTS ===== */
const BemVindo = ({ onStart }: { onStart: () => void }) => (
  <div className={st.sc}>
    <motion.div className={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <h1 className={st.st}>
        <IconHome size={32} color="var(--lit-gold)" /> Bem-Vindo ao Guia Catecumenal
      </h1>
      <p className={st.sst}>Início da sua jornada espiritual na Paróquia São Jorge</p>
    </motion.div>
    <motion.div className={st.card} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
      <h2 className="m-[0 0 15px 0] text-[22]">Querido Catecúmeno,</h2>
      <p className="leading-[1.8] mb-[20]">
        Seja bem-vindo a este caminho de <strong>descoberta, cura e transformação</strong> na Santa Igreja
        Ortodoxa. Este guia interativo foi preparado para acompanhá-lo em sua jornada catecumenal.
      </p>
      <p className="leading-[1.8] mb-[20]">Aqui você encontrará:</p>
      <ul className="pl-[25] mb-[20] leading-[1.8]">
        <li><strong>Fundamentos da Fé:</strong> Ensinamentos essenciais</li>
        <li><strong>Vida Sacramental:</strong> Santos Missérios</li>
        <li><strong>Práticas Espirituais:</strong> Oração, jejum, ascese</li>
        <li><strong>Quizzes Interativos:</strong> Teste seus conhecimentos</li>
        <li><strong>Recursos:</strong> Leituras e materiais</li>
      </ul>
    </motion.div>
    <motion.div className={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
      <h3 className="m-[0 0 15px 0] text-[20]">Como usar este guia:</h3>
      <ol className="pl-[25] leading-[1.8]">
        <li><strong>Navegue</strong> pelo menu lateral</li>
        <li><strong>Responda</strong> aos quizzes</li>
        <li><strong>Acompanhe</strong> seu progresso</li>
        <li><strong>Interaja</strong> com os elementos</li>
        <li><strong>Ative</strong> o modo escuro</li>
      </ol>
    </motion.div>
    <motion.div
      className="text-center mt-[40]"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.button
        className={cx(st.bt, st.btp, "p-[15px 40px]")}
        onClick={onStart}
        whileHover={{ opacity: 0.9, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Iniciar Jornada
        <IconChevronRight size={20} />
      </motion.button>
    </motion.div>
    <motion.div className={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
      "O caminho para Deus não é um caminho de teorias, mas de amor."
      <br />
      <footer className="mt-[10] text-[14]">— Santo Inácio de Antioquia</footer>
    </motion.div>
  </div>
);

const Fundamentos = () => {
  const [exp, setExp] = useState<number | null>(null);
  const cards: { i: number; t: string; c: string; ic: React.ReactNode }[] = [
    { i: 1, t: "O Credo Niceno-Constantinopolitano", c: "O Credo é nossa confissão de fé, proclamada em cada Divina Liturgia.", ic: <IconBook size={28} color="var(--lit-gold)" /> },
    { i: 2, t: "Sagrada Tradição e Sagrada Escritura", c: "A Tradição é a vida da Igreja. A Escritura é parte da Tradição.", ic: <IconBuildingChurch size={28} color="var(--lit-gold)" /> },
    { i: 3, t: "A Santíssima Trindade", c: "Um Deus em Três Pessoas: Pai, Filho, Espírito Santo.", ic: <IconStar size={28} color="var(--lit-gold)" /> },
    { i: 4, t: "Cristologia", c: "Jesus Cristo é Verdadeiro Deus e Verdadeiro Homem.", ic: <IconCross size={28} color="var(--lit-gold)" /> },
  ];
  return (
    <div className={st.sc}>
      <motion.div className={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 className={st.st}>
          <IconStar size={32} color="var(--lit-gold)" /> Fundamentos da Fé Ortodoxa
        </h1>
        <p className={st.sst}>Os pilares que sustentam a nossa fé</p>
      </motion.div>
      <motion.p
        className="text-[18] leading-[1.8] mb-[30]"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        A fé ortodoxa é <strong>apostólica, patrística e litúrgica</strong>. Não é uma invenção humana,
        mas a <strong>Tradição viva</strong> transmitida por Cristo aos Apóstolos.
      </motion.p>
      <motion.h3 className="m-[30px 0 20px 0] text-[22]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        Os Quatro Pilares
      </motion.h3>
      <div className="flex flex-wrap gap-20 mb-[40]">
        {cards.map((card, i) => (
          <motion.div
            key={card.i}
            className={cx(st.card, "flex-[1_1_calc(25%_-_20px)] cursor-pointer")}
            onClick={() => setExp(exp === card.i ? null : card.i)}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
          >
            <div className="flex items-center gap-15 mb-[15]">
              {card.ic}
              <h3 className="m-0 text-[16]">{card.t}</h3>
            </div>
            <AnimatePresence>
              {exp === card.i && (
                <motion.p
                  key={card.i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="leading-[1.6]"
                >
                  {card.c}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.div className="mt-[10] text-right">
              <motion.span animate={{ rotate: exp === card.i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <IconChevronRight size={18} color="var(--lit-gold)" />
              </motion.span>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <motion.div className={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
        <h3 className="m-[0 0 20px 0] text-[20]">A Santíssima Trindade</h3>
        <p className="text-center italic text-[color:var(--lit-red)] mb-[20]">
          "Um só Deus em Três Pessoas: Pai, Filho e Espírito Santo"
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-20">
          {[
            { t: "Deus Pai", d: "Fonte da Divindade" },
            { t: "Deus Filho", d: "Verbo de Deus feito homem" },
            { t: "Deus Espírito Santo", d: "Dador de Vida, Santificador" },
          ].map((x, i) => (
            <motion.div
              key={i}
              className={st.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <h4
                className="text-[color:var(--lit-red)] m-[0 0 10px 0] flex items-center gap-8"
              >
                <span
                  className="w-[30] h-30 bg-[color:var(--lit-dark)] rounded-full flex items-center justify-center mr-[10] text-[color:var(--lit-gold)]"
                >
                  {i + 1}
                </span>
                {x.t}
              </h4>
              <p className="m-0">{x.d}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div className={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        "A fé não é um assentimento intelectual abstrato, mas uma comunhão vivencial com Deus."
        <br />
        <footer className="mt-[10] text-[14]">— Tradição Patrística</footer>
      </motion.div>
    </div>
  );
};

const Sacramentos = () => {
  const [tab, setTab] = useState("bat");
  const s: { i: string; t: string; ic: React.ReactNode; d: string; det: string; v: string }[] = [
    {
      i: "bat",
      t: "Santo Batismo",
      ic: <IconGift size={32} color="var(--lit-gold)" />,
      d: "Entrada no Corpo de Cristo",
      det: "Tripla imersão na água em nome da Trindade.",
      v: '"Quem não nascer da água e do Espírito..." (Jo 3:5)',
    },
    {
      i: "euc",
      t: "Divina Eucaristia",
      ic: <IconBuildingChurch size={32} color="var(--lit-gold)" />,
      d: "Corpo e Sangue de Cristo",
      det: "Pão e vinho consagrados na Divina Liturgia.",
      v: '"Tomai, comei: isto é o meu Corpo..." (Mt 26:26-28)',
    },
    {
      i: "conf",
      t: "Santa Confissão",
      ic: <IconStar size={32} color="var(--lit-gold)" />,
      d: "Sacramento da Metanoia",
      det: "Arrependimento e perdão dos pecados.",
      v: '"Os pecados que perdoardes, são-lhes perdoados." (Jo 20:23)',
    },
    {
      i: "cris",
      t: "Santa Crismação",
      ic: <IconStar size={32} color="var(--lit-gold)" />,
      d: "Selo do Espírito Santo",
      det: "Unção com o Santo Myron após o Batismo.",
      v: '"Recebereis a virtude do Espírito Santo." (At 1:8)',
    },
  ];
  return (
    <div className={st.sc}>
      <motion.div className={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 className={st.st}>
          <IconBuildingChurch size={32} color="var(--lit-gold)" /> Vida Sacramental
        </h1>
        <p className={st.sst}>Os Santos Mistérios da Igreja</p>
      </motion.div>
      <motion.p className="text-[18] leading-[1.8] mb-[30]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        Os <strong>Santos Mistérios</strong> são meios de graça pelos quais Deus age em nossas vidas.
      </motion.p>
      <motion.div
        className="flex gap-10 mb-[30] flex-wrap"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {s.map((x, i) => (
          <motion.button
            key={x.i}
            className={cx(st.bt, "flex-[1_1_calc(25%_-_10px)] justify-center p-[15px 10px]")}
            onClick={() => setTab(x.i)}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div className="flex flex-col items-center gap-8">
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
                className={st.hc}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="m-[0 0 15px 0] text-[24] flex items-center gap-10">
                  {x.ic}
                  {x.t}
                </h3>
                <p className="text-[16] leading-[1.8] mb-[15]">
                  <strong>Significado:</strong> {x.d}
                </p>
                <p className="text-[16] leading-[1.8] mb-[20]">{x.det}</p>
                <motion.div
                  className="p-[15] bg-[color:var(--lit-bg)] rounded-[8] border-l-[4px solid var(--lit-gold)] text-[14] text-[color:var(--lit-red)] italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {x.v}
                </motion.div>
              </motion.div>
            ),
        )}
      </AnimatePresence>
      <motion.div className={st.card} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        <h3 className="m-[0 0 20px 0] text-[20]">Preparação para a Comunhão</h3>
        <ol className="pl-[25] leading-[1.8]">
          <li><strong>Confissão:</strong> Confessar-se regularmente</li>
          <li><strong>Jejum:</strong> Desde a meia-noite</li>
          <li><strong>Oração:</strong> Orações preparatórias</li>
          <li><strong>Vestimenta:</strong> Modéstia e respeito</li>
          <li><strong>Chegada:</strong> Antedência para a Liturgia</li>
        </ol>
      </motion.div>
      <motion.div className={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
        "A Eucaristia é o centro da vida da Igreja, o sacramento dos sacramentos."
        <br />
        <footer className="mt-[10] text-[14]">— São João Crisóstomo</footer>
      </motion.div>
    </div>
  );
};

const Espiritualidade = () => {
  const [exp, setExp] = useState<number | null>(null);
  const p: { i: number; t: string; ic: React.ReactNode; d: string; det: string; tip: string }[] = [
    { i: 0, t: "Oração", ic: <IconStar size={32} color="var(--lit-gold)" />, d: "O respiro da alma", det: "Conversa com Deus: litúrgica, pessoal, mental ou de intercessão.", tip: "Estabeleça regra diária: manhã e noite." },
    { i: 1, t: "Jejum", ic: <IconClock size={32} color="var(--lit-gold)" />, d: "Ferramenta espiritual", det: "Disciplina corpo e alma. Lembrança de que não só de pão vive o homem.", tip: "Principais: Grande Quaresma, Apóstolos, Dormição, Natal." },
    { i: 2, t: "Hesiquia", ic: <IconMoon size={32} color="var(--lit-gold)" />, d: "Silêncio interior", det: "Prática da Oração de Jesus com o coração, sincronizada com a respiração.", tip: "Use o komboskini (terço ortodoxo)." },
    { i: 3, t: "Combate às Paixões", ic: <IconCross size={32} color="var(--lit-gold)" />, d: "Libertação do pecado", det: "Identifique, confesse, vigie, ore, jejue, pratique virtudes.", tip: "As paixões nos afastam de Deus." },
  ];
  return (
    <div className={st.sc}>
      <motion.div className={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 className={st.st}>
          <IconMoon size={32} color="var(--lit-gold)" /> Vida Espiritual e Ascese
        </h1>
        <p className={st.sst}>Oração, jejum e combate às paixões</p>
      </motion.div>
      <motion.p className="text-[18] leading-[1.8] mb-[30]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        A vida cristã ortodoxa é uma <strong>jornada de transformação</strong> (Theosis) em que nos tornamos cada vez mais semelhantes a Cristo.
      </motion.p>
      <motion.h3 className="m-[30px 0 20px 0] text-[22]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        As Quatro Práticas
      </motion.h3>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-20 mb-[40]">
        {p.map((x, i) => (
          <motion.div
            key={x.i}
            className={cx(st.card, "cursor-pointer")}
            onClick={() => setExp(exp === x.i ? null : x.i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
          >
            <div className="flex items-center gap-15 mb-[15]">
              {x.ic}
              <h3 className="m-0 text-[18]">{x.t}</h3>
            </div>
            <p className="leading-[1.6] mb-[10]">{x.d}</p>
            <AnimatePresence>
              {exp === x.i && (
                <motion.div
                  key={x.i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="leading-[1.6] mb-[10]">{x.det}</p>
                  <div
                    className="p-[10] bg-[color:var(--lit-bg)] rounded-[6] border-l-[3px solid var(--lit-gold)] text-[14] text-[color:var(--lit-red)]"
                  >
                    <strong>Dica:</strong> {x.tip}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <motion.div className={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
        <h3 className="m-[0 0 20px 0] text-[20]">A Oração de Jesus</h3>
        <motion.div
          className="p-[20] rounded-[8] text-center mb-[20]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[20] italic m-0">
            "Senhor Jesus Cristo, Filho de Deus,
            <br />
            tem misericórdia de mim, pecador"
          </p>
        </motion.div>
        <p className="leading-[1.8] mb-[15]">
          <strong>Origem:</strong> Baseada na oração do publicano (Lc 18:13).
        </p>
        <p className="leading-[1.8] mb-[15]">
          <strong>Prática:</strong> Repetir com o coração, sincronizada com a respiração.
        </p>
        <p className="leading-[1.8] mb-[0]">
          <strong>Benefícios:</strong> Purifica o coração, traz paz, protege, une a Cristo.
        </p>
      </motion.div>
      <motion.div className={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        "A alma que deseja aproximar-se de Deus deve primeiro purificar-se das paixões."
        <br />
        <footer className="mt-[10] text-[14]">— São Doroteu de Gaza</footer>
      </motion.div>
    </div>
  );
};

const Liturgia = () => {
  const [exp, setExp] = useState<number | null>(null);
  const f: { i: number; t: string; d: string; ic: React.ReactNode; det: string }[] = [
    { i: 0, t: "Páscoa", d: "25 de Dezembro", ic: <IconCross size={32} color="var(--lit-gold)" />, det: "Celebração da Ressurreição de Cristo — a Festa das Festas." },
    { i: 1, t: "Natal", d: "25 de Dezembro", ic: <IconGift size={32} color="var(--lit-gold)" />, det: "Nascimento de Nosso Senhor Jesus Cristo." },
    { i: 2, t: "Teofania", d: "6 de Janeiro", ic: <IconStar size={32} color="var(--lit-gold)" />, det: "Batismo de Cristo e revelação da Trindade." },
    { i: 3, t: "Pentecostes", d: "50 dias após Páscoa", ic: <IconStar size={32} color="var(--lit-gold)" />, det: "Descida do Espírito Santo sobre os Apóstolos." },
  ];
  const j = [
    { n: "Grande Quaresma", d: "40 dias", desc: "Preparação para a Páscoa" },
    { n: "Jejum dos Apóstolos", d: "Variável", desc: "De Pentecostes a 28 de Junho" },
    { n: "Jejum da Dormição", d: "14 dias", desc: "De 1 a 14 de Agosto" },
    { n: "Jejum do Natal", d: "40 dias", desc: "De 15 Nov a 24 Dez" },
  ];
  return (
    <div className={st.sc}>
      <motion.div className={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 className={st.st}>
          <IconCalendar size={32} color="var(--lit-gold)" /> Ciclo Litúrgico
        </h1>
        <p className={st.sst}>Festas, jejuns e celebrações</p>
      </motion.div>
      <motion.p className="text-[18] leading-[1.8] mb-[30]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        A Igreja vive segundo um <strong>calendário litúrgico</strong> que nos ajuda a meditar os mistérios da salvação.
      </motion.p>
      <motion.h3 className="m-[30px 0 20px 0] text-[22]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        As Grandes Festas
      </motion.h3>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-20 mb-[40]">
        {f.map((x, i) => (
          <motion.div
            key={i}
            className={cx(st.card, "cursor-pointer")}
            onClick={() => setExp(exp === i ? null : i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
          >
            <div className="flex justify-between items-center mb-[15]">
              <div className="flex items-center gap-10">
                {x.ic}
                <h3 className="m-0 text-[16]">{x.t}</h3>
              </div>
              <span className="text-[12] text-[color:var(--lit-red)]">
                {x.d}
              </span>
            </div>
            <p className="leading-[1.6] mb-[10]">{x.det}</p>
            <AnimatePresence>
              {exp === i && (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="leading-[1.6] text-[14]"
                >
                  {x.det}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <motion.div className={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
        <h3 className="m-[0 0 20px 0] text-[20]">Períodos de Jejum</h3>
        <p className="leading-[1.8] mb-[20]">
          Os jejuns são <strong>ferramentas espirituais</strong> para disciplinar corpo e alma.
        </p>
        <div className="overflow-x-auto">
          <table className="w-[100%] min-w-[400]">
            <thead>
              <tr>
                <th className="text-left text-white border-lit-border border-lit-border">Jejuno</th>
                <th className="text-left text-white border-lit-border border-lit-border">Duração</th>
                <th className="text-left text-white border-lit-border border-lit-border">Descrição</th>
              </tr>
            </thead>
            <tbody>
              {j.map((x, i) => (
                <tr key={i}>
                  <td className="border-lit-border border-lit-border">
                    <strong>{x.n}</strong>
                  </td>
                  <td className="border-lit-border border-lit-border">{x.d}</td>
                  <td className="border-lit-border border-lit-border">{x.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <motion.div
          className="mt-[20] p-[10] bg-[color:var(--lit-bg)] rounded-[6] border-l-[3px solid var(--lit-gold)] text-[14] text-[color:var(--lit-red)]"
        >
          <strong>Nota:</strong> Crianças, idosos, doentes, grávidas e amamentando estão isentos.
        </motion.div>
      </motion.div>
      <motion.div className={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        "O ano litúrgico é como uma grande sinfonia da salvação."
        <br />
        <footer className="mt-[10] text-[14]">— Tradição Litúrgica</footer>
      </motion.div>
    </div>
  );
};

const Historia = () => (
  <div className={st.sc}>
    <motion.div className={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <h1 className={st.st}>
        <IconBook size={32} color="var(--lit-gold)" /> História e Tradição
      </h1>
      <p className={st.sst}>A Igreja Apostólica</p>
    </motion.div>
    <motion.p className="text-[18] leading-[1.8] mb-[30]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
      Conhecer a <strong>história da Igreja</strong> nos ajuda a entender que a fé ortodoxa é a{" "}
      <strong>Tradição Apostólica</strong> preservada ao longo de 2000 anos.
    </motion.p>
    <motion.div className={st.card} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
      <h3 className="m-[0 0 20px 0] text-[20]">Linha do Tempo</h3>
      <div className={st.tl}>
        <div className={st.tll} />
        {[
          { y: 0.5, t: "Século I — Era Apostólica", c: "Os Apóstolos pregam e fundam comunidades." },
          { y: 0.6, t: "Século II — Pais Apostólicos", c: "Discípulos dos Apóstolos escrevem cartas." },
          { y: 0.7, t: "325 d.C. — I Concílio de Niceia", c: "Condena o arianismo." },
          { y: 0.8, t: "1054 d.C. — Grande Cisma", c: "Separação entre Ortodoxa e Católica." },
          { y: 0.9, t: "Século XX — Ortodoxia no Brasil", c: "Chegada dos imigrantes sírios e libaneses." },
        ].map((x, i) => (
          <motion.div
            key={i}
            className={st.tli}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div className={st.td}>{i + 1}</div>
            <div className={st.tt}>{x.t}</div>
            <div className={st.tc}>{x.c}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
    <motion.div className={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
      <h3 className="m-[0 0 20px 0] text-[20]">A Sé Apostólica de Antioquia</h3>
      <p className="leading-[1.8] mb-[15]">
        A <strong>Igreja Ortodoxa Grega de Antioquia</strong> é uma das <strong>quatro Igrejas Autocéfalas mais antigas</strong>.
      </p>
      <ul className="pl-[25] leading-[1.8]">
        <li><strong>Fundação:</strong> Apóstolos Pedro e Paulo (Atos 11:26)</li>
        <li><strong>Primeiro Nome:</strong> "Cristãos" pela primeira vez</li>
        <li><strong>Sé Apostólica:</strong> Uma das três sedes petrinas</li>
        <li><strong>Atual Patriarca:</strong> Sua Beatitude João X</li>
      </ul>
      <motion.div className="mt-[20] p-[15] bg-[color:var(--lit-bg)] rounded-[8] border-l-[4px solid var(--lit-gold)]">
        <p className="m-0 text-[color:var(--lit-red)] italic">
          "Em Antioquia, os discípulos foram pela primeira vez chamados de cristãos."
        </p>
        <footer className="mt-[10] text-[12]">— Atos 11:26</footer>
      </motion.div>
    </motion.div>
    <motion.div className={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
      "A Igreja é apostólica porque é fundamentada nos Apóstolos."
      <br />
      <footer className="mt-[10] text-[14]">— Tradição Ortodoxa</footer>
    </motion.div>
  </div>
);

const Paroxia = () => (
  <div className={st.sc}>
    <motion.div className={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <h1 className={st.st}>
        <IconMessageUser size={32} color="var(--lit-gold)" /> Vida na Paróquia
      </h1>
      <p className={st.sst}>Comunidade São Jorge</p>
    </motion.div>
    <motion.p className="text-[18] leading-[1.8] mb-[30]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
      A <strong>Paróquia São Jorge</strong> é sua <strong>família espiritual</strong>.
    </motion.p>
    <motion.div className={st.card} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
      <h3 className="m-[0 0 20px 0] text-[20]">Nossa Comunidade</h3>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-20">
        <div className={st.card}>
          <h4 className="text-[color:var(--lit-red)] m-[0 0 10px 0]">
            <strong>Pároco:</strong> Pe. Samaan
          </h4>
          <p className="m-0">Orientação espiritual da paróquia.</p>
        </div>
        <div className={st.card}>
          <h4 className="text-[color:var(--lit-red)] m-[0 0 10px 0]">
            <strong>Catequista:</strong> Talles Diniz Tonatto
          </h4>
          <p className="m-0">Formação catecumenal.</p>
        </div>
      </div>
    </motion.div>
    <motion.div className={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
      <h3 className="m-[0 0 20px 0] text-[20]">Ofícios Divinos</h3>
      <p className="leading-[1.8] mb-[20]">
        Os <strong>Ofícios Divinos</strong> são o <strong>coração da vida paroquial</strong>.
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-15">
        {[
          { t: "Vésperas", d: "Sábado à tarde", desc: "Preparação para o Domingo" },
          { t: "Divina Liturgia", d: "Domingo de manhã", desc: "Celebração central" },
          { t: "Encontros", d: "[Dia da semana]", desc: "Formação catecumenal" },
        ].map((x, i) => (
          <div key={i} className={cx(st.card)}>
            <h4 className="text-[color:var(--lit-red)] m-[0 0 10px 0]">{x.t}</h4>
            <p className="m-[0 0 10px 0] text-[14]">{x.d}</p>
            <p className="m-0 text-[14]">{x.desc}</p>
          </div>
        ))}
      </div>
      <motion.div
        className="mt-[20] p-[10] bg-[color:var(--lit-bg)] rounded-[6] border-l-[3px solid var(--lit-gold)] text-[14] text-[color:var(--lit-red)]"
      >
        <strong>Dica:</strong> Tente participar de pelo menos um ofício por semana.
      </motion.div>
    </motion.div>
    <motion.div className={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
      "A paróquia é a família espiritual onde crescemos juntos."
      <br />
      <footer className="mt-[10] text-[14]">— Pe. Samaan</footer>
    </motion.div>
  </div>
);

const Leituras = () => {
  const [cat, setCat] = useState("pat");
  const cats: {
    i: string;
    t: string;
    ic: React.ReactNode;
    d: string;
    items: Array<{ a?: string; n?: string; w?: string; th?: string; t2?: string }>;
  }[] = [
    {
      i: "pat",
      t: "Antologia Patrística",
      ic: <IconBook size={32} color="var(--lit-gold)" />,
      d: "Obras dos Santos Padres",
      items: [
        { a: "Santo Inácio", w: "Cartas", th: "Fé, amor, unidade" },
        { a: "São Doroteu", w: "Instruções", th: "Combate às paixões" },
        { a: "São João Clímaco", w: "A Escada", th: "Ascese espiritual" },
        { a: "São Isaque", w: "Discursos", th: "Oração, amor" },
      ],
    },
    {
      i: "ini",
      t: "Livros para Iniciantes",
      ic: <IconMoon size={32} color="var(--lit-gold)" />,
      d: "Introdução à fé ortodoxa",
      items: [
        { a: "Pe. Thomas Hopko", w: "A Fé Ortodoxa", th: "Visão geral" },
        { a: "Kallistos Ware", w: "O Caminho Ortodoxo", th: "Introdução" },
        { a: "Kallistos Ware", w: "A Igreja Ortodoxa", th: "História e teologia" },
        { a: "Pe. John Main", w: "Oração do Coração", th: "Oração de Jesus" },
      ],
    },
    {
      i: "rec",
      t: "Recursos Online",
      ic: <IconStar size={32} color="var(--lit-gold)" />,
      d: "Sites e aplicativos úteis",
      items: [
        { n: "Orthodoxia.org", t2: "Português" },
        { n: "Ancient Faith", t2: "Site e podcasts (Inglês)" },
        { n: "Orthodox Calendar", t2: "App — calendário litúrgico" },
        { n: "Orthodox Prayer Book", t2: "App — orações diárias" },
      ],
    },
  ];
  const current = cats.find((x) => x.i === cat)!;
  return (
    <div className={st.sc}>
      <motion.div className={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 className={st.st}>
          <IconBook size={32} color="var(--lit-gold)" /> Leituras Recomendadas
        </h1>
        <p className={st.sst}>Recursos para estudo e crescimento</p>
      </motion.div>
      <motion.p className="text-[18] leading-[1.8] mb-[30]" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        A leitura espiritual é <strong>alimento para a alma</strong>.
      </motion.p>
      <motion.div
        className="flex gap-10 mb-[30] flex-wrap"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {cats.map((x, i) => (
          <motion.button
            key={x.i}
            className={cx(st.bt, "flex-[1_1_calc(33.333%_-_10px)] justify-center p-[15px 10px]")}
            onClick={() => setCat(x.i)}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div className="flex flex-col items-center gap-8">
              {x.ic}
              <span>{x.t}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.i}
          className={st.hc}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="m-[0 0 15px 0] text-[20] flex items-center gap-10">
            {current.ic}
            {current.t}
          </h3>
          <p className="leading-[1.8] mb-[20]">{current.d}</p>
          <div className="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-15">
            {current.items.map((y, j) => (
              <motion.div
                key={j}
                className={st.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * j }}
              >
                <h4 className="text-[color:var(--lit-red)] m-[0 0 10px 0] text-[16]">
                  {(y as { a?: string; n?: string }).a || (y as { n?: string }).n}
                </h4>
                <p className="m-[0 0 10px 0] text-[14]">
                  <strong>{(y as { w?: string }).w || "Recurso"}:</strong>{" "}
                  {(y as { th?: string }).th || (y as { t2?: string }).t2}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <motion.div className={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        "A leitura dos Santos Padres é como um banquete espiritual."
        <br />
        <footer className="mt-[10] text-[14]">— São João Clímaco</footer>
      </motion.div>
    </div>
  );
};

/* ===== MAIN APP ===== */
const GuiaCatecumenal = () => {
  const [sec, setSec] = useState("bem-vindo");
  const [pg, setPg] = useState(0);
  const [cq, setCq] = useState<Record<string, boolean>>({});
  const [showQ, setShowQ] = useState(false);
  const [curQ, setCurQ] = useState<(typeof Q)["f"] | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [selA, setSelA] = useState<number | null>(null);
  const [showFb, setShowFb] = useState(false);
  const [score, setScore] = useState(0);
  const [qDone, setQDone] = useState(false);
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState<Array<{ id: number; m: string; t: string }>>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const idx = S.findIndex((s) => s.i === sec);
  const sd = S.find((s) => s.i === sec);

  useEffect(() => {
    setPg(((idx + 1) / S.length) * 100);
  }, [idx]);

  useEffect(() => {
    if (sd?.q) setCurQ(Q[sd.q as keyof typeof Q]);
  }, [sd]);

  const addN = (m: string, t = "info") => {
    const id = Date.now();
    setNotif([...notif, { id, m, t }]);
    setTimeout(() => setNotif((n) => n.filter((x) => x.id !== id)), 5000);
  };

  const hAnswer = (i: number) => {
    if (selA !== null) return;
    setSelA(i);
    const isC = i === curQ!.q[qIdx].ca;
    if (isC) {
      setScore(score + 1);
      addN("Correto!", "ok");
    } else {
      addN("Incorreto. Tente novamente!", "err");
    }
    setShowFb(true);
  };

  const hNext = () => {
    if (qIdx < curQ!.q.length - 1) {
      setQIdx(qIdx + 1);
      setSelA(null);
      setShowFb(false);
    } else {
      hFinish();
    }
  };

  const hFinish = () => {
    setQDone(true);
    setCq({ ...cq, [sec]: true });
    const pct = Math.round((score / curQ!.q.length) * 100);
    addN(`Quiz concluído! ${pct}% de acertos!`, "ok");
  };

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

  const toggleD = () => {
    setDark(!dark);
    addN(dark ? "Modo claro" : "Modo escuro", "info");
  };

  const goN = () => {
    if (idx < S.length - 1) setSec(S[idx + 1].i);
  };
  const goP = () => {
    if (idx > 0) setSec(S[idx - 1].i);
  };

  const sectionComponents: Record<string, React.ReactNode> = {
    "bem-vindo": <BemVindo onStart={goN} />,
    fundamentos: <Fundamentos />,
    sacramentos: <Sacramentos />,
    espiritualidade: <Espiritualidade />,
    liturgia: <Liturgia />,
    historia: <Historia />,
    paroxia: <Paroxia />,
    leituras: <Leituras />,
  };

  return (
    <div
      className={cx(st.c)}
    >
      {/* Mobile overlay backdrop */}
      <div
        className={cx("md:hidden", mobileMenuOpen ? "block" : "hidden")}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile header with hamburger */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[90] bg-lit-dark text-white flex items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-10 text-[16] font-bold">
          <IconBuildingChurch size={24} /> Guia Catecumenal
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-transparent text-white cursor-pointer"
        >
          {mobileMenuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
        </button>
      </div>

      {/* SIDEBAR (desktop fixed, mobile slide-in) */}
      <motion.div
        className={cx(st.sb, "md:relative md:translate-x-0")}
        initial={{ x: -300 }}
        animate={{ x: mobileMenuOpen ? 0 : -300 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <motion.div
          className="p-[0 20px 20px] text-center mb-[20]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-[60] h-60 rounded-full m-[0 auto 15px] flex items-center justify-center shadow-[0_4px_15px_rgba(212_175_55_0.3)]"
            whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <IconBuildingChurch size={32} color="white" />
          </motion.div>
          <h2 className="m-0 text-[18] text-white">Guia Catecumenal</h2>
          <p className="m-[5px 0 0 0] text-[12]">São Jorge</p>
        </motion.div>
        <nav>
          {S.map((s) => {
            const isA = sec === s.i;
            const isC = cq[s.i];
            return (
              <motion.div
                key={s.i}
                className={cx(st.ni)}
                onClick={() => {
                  setSec(s.i);
                  setMobileMenuOpen(false);
                }}
                whileHover={{ opacity: 0.8 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * S.findIndex((x) => x.i === s.i) }}
              >
                <span className={cx(isA ? "text-[color:var(--lit-bg)]" : "text-white")}>{s.ic}</span>
                <span>{s.t}</span>
                {isC ? (
                  <motion.span
                    className="ml-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <IconCheck size={16} />
                  </motion.span>
                ) : null}
              </motion.div>
            );
          })}
        </nav>
        <div className="p-[20] mt-[20]">
          {sd?.q && (
            <motion.button
              className={cx(st.bt, st.bta, "w-[100%] justify-center")}
              onClick={hStartQ}
              whileHover={{ opacity: 0.9, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconAward size={18} /> Quiz da Seção
            </motion.button>
          )}
          <motion.button
            className={cx(st.bt, st.bts, "w-[100%] justify-center")}
            onClick={toggleD}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
            {dark ? "Modo Claro" : "Modo Escuro"}
          </motion.button>
        </div>
      </motion.div>

      {/* HEADER (desktop fixed, mobile relative) */}
      <motion.div
        className={cx(st.h, "md:static md:translate-x-0")}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={st.lg}>
          <IconBuildingChurch size={28} />
          <span>Guia Catecumenal Interativo</span>
        </div>
        <div className="flex items-center gap-20">
          <div className={st.pb}>
            <motion.div
              className={st.pf}
              initial={{ width: 0 }}
              animate={{ width: `${pg}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <span className="text-[14] text-white">{Math.round(pg)}% Concluído</span>
          <motion.button
            className={cx(st.bt, "bg-transparent text-[color:var(--lit-gold)]")}
            onClick={goP}
            disabled={idx === 0}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
          >
            <IconChevronLeft size={18} />
          </motion.button>
          <motion.button
            className={cx(st.bt, "bg-transparent text-[color:var(--lit-gold)]")}
            onClick={goN}
            disabled={idx === S.length - 1}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
          >
            <IconChevronRight size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* MAIN */}
      <main
        className={cx(st.m, "md:ml-[280px] md:pt-[90px] pt-[60px] w-full", dark ? "text-white" : "")}
      >
        <AnimatePresence mode="wait">
          {sectionComponents[sec] ?? sectionComponents["bem-vindo"]}
        </AnimatePresence>

        {/* NOTIFICATIONS */}
        <div
          className="fixed top-[100] right-[40] z-[1001] flex flex-col gap-10"
        >
          <AnimatePresence>
            {notif.map((n) => (
              <motion.div
                key={n.id}
                className="p-[12px 20px] rounded-[8] text-white shadow-[0_4px_15px_rgba(0_0_0_0.2)] flex items-center gap-10"
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {n.t === "ok" && <IconCheck size={18} />}
                {n.t === "err" && <IconBan size={18} />}
                {n.t === "info" && <IconInfoCircle size={18} />}
                <span>{n.m}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* QUIZ MODAL */}
        <AnimatePresence>
          {showQ && curQ && (
            <motion.div
              key="quiz-modal"
              className="fixed top-[0] left-[0] right-[0] bottom-[0] flex items-center justify-center z-[1000]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQ(false)}
            >
              <motion.div
                className={cx(st.qc, "text-white", dark ? "bg-[color:var(--lit-red)] text-white" : "")}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {!qDone ? (
                  <>
                    <motion.div
                      className="flex justify-between items-center mb-[20]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2
                        className="text-[color:var(--lit-gold)] m-0 flex items-center gap-10"
                      >
                        <IconInfoCircle size={24} color="var(--lit-gold)" />
                        {curQ.t}
                      </h2>
                      <motion.button
                        className={cx(st.bt, "bg-transparent text-[color:var(--lit-gold)] p-[8px 12px]")}
                        onClick={() => setShowQ(false)}
                        whileHover={{ opacity: 0.9, scale: 1.02 }}
                      >
                        <IconBan size={18} />
                      </motion.button>
                    </motion.div>
                    <p
                      className="text-[color:var(--lit-text-secondary)] mb-[20]"
                    >
                      {curQ.d}
                    </p>
                    <div
                      className="flex justify-between items-center mb-[20] p-[10px 15px] bg-[color:var(--lit-bg)] rounded-[8]"
                    >
                      <span className="text-[color:var(--lit-red)] font-bold">
                        Questão {qIdx + 1} de {curQ.q.length}
                      </span>
                      <span className="text-[color:var(--lit-gold)] font-bold">
                        Pontuação: {score}/{curQ.q.length}
                      </span>
                    </div>
                    <motion.p
                      className="text-[18] font-bold text-[color:var(--lit-gold)] mb-[20] p-[15] bg-[color:var(--lit-bg)] rounded-[8]"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {curQ.q[qIdx].q}
                    </motion.p>
                    <div className="flex flex-col gap-10">
                      {curQ.q[qIdx].o.map((o, i) => {
                        const isS = selA === i;
                        const isCorrect = i === curQ.q[qIdx].ca;
                        const isWrong = isS && !isCorrect;
                        return (
                          <motion.button
                            key={i}
                            className={cx(st.bt, "text-left justify-start")}
                            onClick={() => hAnswer(i)}
                            whileHover={{ scale: 1.02 }}
                            disabled={selA !== null}
                          >
                            <span className="mr-[10] font-bold">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {o}
                            {isS && isCorrect && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto"
                              >
                                <IconCheck size={20} />
                              </motion.span>
                            )}
                            {isWrong && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ml-auto"
                              >
                                <IconBan size={20} />
                              </motion.span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    {showFb && (
                      <motion.div
                        className="border-lit-border"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="m-0 italic">
                          <strong>Explicação:</strong> {curQ.q[qIdx].e}
                        </p>
                      </motion.div>
                    )}
                    <div className="flex justify-end gap-10 mt-[30]">
                      {qIdx > 0 && (
                        <motion.button
                          className={cx(st.bt, st.bts)}
                          onClick={() => {
                            setQIdx(qIdx - 1);
                            setSelA(null);
                            setShowFb(false);
                          }}
                          whileHover={{ opacity: 0.9, scale: 1.02 }}
                        >
                          <IconChevronLeft size={18} /> Voltar
                        </motion.button>
                      )}
                      <motion.button className={cx(st.bt, st.bta)} onClick={hNext} whileHover={{ opacity: 0.9, scale: 1.02 }}>
                        {qIdx < curQ.q.length - 1 ? "Próxima" : "Finalizar"}
                        <IconChevronRight size={18} />
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    className="text-center p-[40px 20px]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="w-[100] h-100 rounded-full flex items-center justify-center m-[0 auto 20px] shadow-[0_4px_20px_rgba(212_175_55_0.3)]"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 9999 }}
                    >
                      <IconAward size={48} color="var(--lit-bg)" />
                    </motion.div>
                    <h2 className="text-[color:var(--lit-gold)] m-[0 0 10px 0] text-[28]">Quiz Concluído!</h2>
                    <p className="text-[18] m-[0 0 20px 0]">
                      Sua pontuação: {score}/{curQ.q.length} ({Math.round((score / curQ.q.length) * 100)}%)
                    </p>
                    <motion.div
                      className="w-[100%] h-8 bg-[color:var(--lit-bg)] rounded-[4] m-[20px 0] overflow-hidden"
                    >
                      <motion.div
                        className="h-[100%] rounded-[4]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / curQ.q.length) * 100}%` }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      />
                    </motion.div>
                    <motion.button
                      className={cx(st.bt, st.bta, "p-[12px 30px]")}
                      onClick={hRestart}
                      whileHover={{ opacity: 0.9, scale: 1.02 }}
                    >
                      Reiniciar Quiz
                    </motion.button>
                    <motion.button
                      className={cx(st.bt, "bg-transparent text-[color:var(--lit-gold)]")}
                      onClick={() => setShowQ(false)}
                      whileHover={{ opacity: 0.9, scale: 1.02 }}
                    >
                      Fechar
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <motion.div
          className={cx(st.f)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>
            Paróquia Ortodoxa Antioquina São Jorge — Curitiba/PR
            <br />
            Elaborado por: Talles Diniz Tonatto | Supervisão: Pe. Samaan
            <br />
            Versão 1.0 — Setembro 2026
          </p>
          <motion.p
            className=""
            whileHover={{ scale: 1.05 }}
          >
            Que Deus abençoe sua jornada espiritual!
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
};

export default GuiaCatecumenal;
