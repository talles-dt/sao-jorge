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

/* ===== STYLES ===== */
const st: Record<string, React.CSSProperties> = {
  c: {
    minHeight: "100vh",
    background: "var(--lit-bg)",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    display: "flex",
    overflow: "hidden",
    color: "var(--lit-text)",
  },
  sb: {
    width: 280,
    color: "white",
    padding: "20px 0",
    position: "fixed",
    height: "100vh",
    overflowY: "auto",
    zIndex: 100,
    boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
  },
  m: {
    flex: 1,
    marginLeft: 280,
    padding: "100px 40px 40px",
    overflowY: "auto",
    maxHeight: "100vh",
  },
  h: {
    background: "var(--lit-dark)",
    color: "white",
    padding: "15px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "fixed",
    top: 0,
    left: 280,
    right: 0,
    zIndex: 99,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  lg: { display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: "bold" },
  pb: { height: 6, background: "var(--lit-bg)", borderRadius: 3, overflow: "hidden", margin: "0 20px" },
  pf: {
    height: "100%",
    background: "linear-gradient(90deg, var(--lit-gold), var(--lit-red))",
    borderRadius: 3,
    transition: "width 0.5s ease",
  },
  ni: {
    padding: "12px 20px",
    margin: "5px 15px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
  },
  nia: { background: "var(--lit-gold)", color: "var(--lit-dark)", fontWeight: "bold" },
  nih: { background: "rgba(255,255,255,0.1)" },
  sc: { maxWidth: 1000, margin: "0 auto" },
  sh: { marginBottom: 30, paddingBottom: 20, borderBottom: `2px solid var(--lit-gold)` },
  st: { fontSize: 32, margin: 0, display: "flex", alignItems: "center", gap: 15 },
  sst: { fontSize: 18, fontStyle: "italic", margin: "10px 0 0 0" },
  card: {
    background: "var(--lit-light)",
    borderRadius: 12,
    padding: 25,
    margin: "20px 0",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: `1px solid ${c.b}`,
    transition: "all 0.3s ease",
  },
  ch: { boxShadow: "0 8px 30px rgba(0,0,0,0.15)", transform: "translateY(-2px)" },
  hc: {
    background: "linear-gradient(135deg, var(--lit-gold)15, var(--lit-red)08)",
    borderLeft: `4px solid var(--lit-gold)`,
    borderRadius: 12,
    padding: 25,
    margin: "20px 0",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  qc: {
    background: "var(--lit-light)",
    border: `2px solid var(--lit-gold)`,
    borderRadius: 12,
    padding: 25,
    margin: "20px 0",
  },
  bt: {
    padding: "12px 24px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: "bold",
    transition: "all 0.3s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  btp: { background: "var(--lit-dark)", color: "var(--lit-gold)" },
  bts: { background: "var(--lit-red)", color: "white" },
  bta: { background: "var(--lit-gold)", color: "var(--lit-dark)" },
  bth: { opacity: 0.9, transform: "scale(1.02)" },
  quote: {
    fontStyle: "italic",
    color: "var(--lit-gold)",
    padding: "20px 30px",
    borderLeft: `4px solid var(--lit-gold)`,
    background: "var(--lit-bg)",
    margin: "25px 0",
    borderRadius: "0 8px 8px 0",
    fontSize: 18,
    lineHeight: 1.8,
  },
  tl: { position: "relative", paddingLeft: 40, margin: "30px 0" },
  tll: { position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: "var(--lit-dark)" },
  tli: { position: "relative", paddingLeft: 30, marginBottom: 30 },
  td: {
    position: "absolute",
    left: -40,
    top: 8,
    width: 24,
    height: 24,
    background: "var(--lit-gold)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--lit-dark)",
    fontSize: 12,
    fontWeight: "bold",
  },
  tt: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  tc: { background: "var(--lit-bg)", padding: 12, borderRadius: 8, marginLeft: 20, fontSize: 14 },
  f: { textAlign: "center", padding: "30px 0", fontSize: 14, borderTop: `1px solid ${c.b}`, marginTop: 40 },
};

/* ===== SECTION COMPONENTS ===== */
const BemVindo = ({ onStart }: { onStart: () => void }) => (
  <div style={st.sc}>
    <motion.div style={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <h1 style={st.st}>
        <IconHome size={32} color="var(--lit-gold)" /> Bem-Vindo ao Guia Catecumenal
      </h1>
      <p style={st.sst}>Início da sua jornada espiritual na Paróquia São Jorge</p>
    </motion.div>
    <motion.div style={st.card} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
      <h2 style={{ margin: "0 0 15px 0", fontSize: 22 }}>Querido Catecúmeno,</h2>
      <p style={{ lineHeight: 1.8, marginBottom: 20 }}>
        Seja bem-vindo a este caminho de <strong>descoberta, cura e transformação</strong> na Santa Igreja
        Ortodoxa. Este guia interativo foi preparado para acompanhá-lo em sua jornada catecumenal.
      </p>
      <p style={{ lineHeight: 1.8, marginBottom: 20 }}>Aqui você encontrará:</p>
      <ul style={{ paddingLeft: 25, marginBottom: 20, lineHeight: 1.8 }}>
        <li><strong>Fundamentos da Fé:</strong> Ensinamentos essenciais</li>
        <li><strong>Vida Sacramental:</strong> Santos Missérios</li>
        <li><strong>Práticas Espirituais:</strong> Oração, jejum, ascese</li>
        <li><strong>Quizzes Interativos:</strong> Teste seus conhecimentos</li>
        <li><strong>Recursos:</strong> Leituras e materiais</li>
      </ul>
    </motion.div>
    <motion.div style={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
      <h3 style={{ margin: "0 0 15px 0", fontSize: 20 }}>Como usar este guia:</h3>
      <ol style={{ paddingLeft: 25, lineHeight: 1.8 }}>
        <li><strong>Navegue</strong> pelo menu lateral</li>
        <li><strong>Responda</strong> aos quizzes</li>
        <li><strong>Acompanhe</strong> seu progresso</li>
        <li><strong>Interaja</strong> com os elementos</li>
        <li><strong>Ative</strong> o modo escuro</li>
      </ol>
    </motion.div>
    <motion.div
      style={{ textAlign: "center", marginTop: 40 }}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.button
        style={{ ...st.bt, ...st.btp, padding: "15px 40px", fontSize: 18 }}
        onClick={onStart}
        whileHover={{ opacity: 0.9, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Iniciar Jornada
        <IconChevronRight size={20} />
      </motion.button>
    </motion.div>
    <motion.div style={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
      "O caminho para Deus não é um caminho de teorias, mas de amor."
      <br />
      <footer style={{ fontStyle: "normal", marginTop: 10, fontSize: 14 }}>— Santo Inácio de Antioquia</footer>
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
    <div style={st.sc}>
      <motion.div style={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 style={st.st}>
          <IconStar size={32} color="var(--lit-gold)" /> Fundamentos da Fé Ortodoxa
        </h1>
        <p style={st.sst}>Os pilares que sustentam a nossa fé</p>
      </motion.div>
      <motion.p
        style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 30 }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        A fé ortodoxa é <strong>apostólica, patrística e litúrgica</strong>. Não é uma invenção humana,
        mas a <strong>Tradição viva</strong> transmitida por Cristo aos Apóstolos.
      </motion.p>
      <motion.h3 style={{ margin: "30px 0 20px 0", fontSize: 22 }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        Os Quatro Pilares
      </motion.h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 40 }}>
        {cards.map((card, i) => (
          <motion.div
            key={card.i}
            style={{ ...st.card, flex: "1 1 calc(25% - 20px)", minWidth: 280, cursor: "pointer" }}
            onClick={() => setExp(exp === card.i ? null : card.i)}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 15 }}>
              {card.ic}
              <h3 style={{ margin: 0, fontSize: 16 }}>{card.t}</h3>
            </div>
            <AnimatePresence>
              {exp === card.i && (
                <motion.p
                  key={card.i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ lineHeight: 1.6 }}
                >
                  {card.c}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.div style={{ marginTop: 10, textAlign: "right" }}>
              <motion.span animate={{ rotate: exp === card.i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <IconChevronRight size={18} color="var(--lit-gold)" />
              </motion.span>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <motion.div style={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 20 }}>A Santíssima Trindade</h3>
        <p style={{ textAlign: "center", fontStyle: "italic", color: "var(--lit-red)", marginBottom: 20 }}>
          "Um só Deus em Três Pessoas: Pai, Filho e Espírito Santo"
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {[
            { t: "Deus Pai", d: "Fonte da Divindade" },
            { t: "Deus Filho", d: "Verbo de Deus feito homem" },
            { t: "Deus Espírito Santo", d: "Dador de Vida, Santificador" },
          ].map((x, i) => (
            <motion.div
              key={i}
              style={st.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <h4
                style={{
                  color: "var(--lit-red)",
                  margin: "0 0 10px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    background: "var(--lit-dark)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                    color: "var(--lit-gold)",
                  }}
                >
                  {i + 1}
                </span>
                {x.t}
              </h4>
              <p style={{ margin: 0 }}>{x.d}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div style={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        "A fé não é um assentimento intelectual abstrato, mas uma comunhão vivencial com Deus."
        <br />
        <footer style={{ fontStyle: "normal", marginTop: 10, fontSize: 14 }}>— Tradição Patrística</footer>
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
    <div style={st.sc}>
      <motion.div style={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 style={st.st}>
          <IconBuildingChurch size={32} color="var(--lit-gold)" /> Vida Sacramental
        </h1>
        <p style={st.sst}>Os Santos Mistérios da Igreja</p>
      </motion.div>
      <motion.p style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 30 }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        Os <strong>Santos Mistérios</strong> são meios de graça pelos quais Deus age em nossas vidas.
      </motion.p>
      <motion.div
        style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {s.map((x, i) => (
          <motion.button
            key={x.i}
            style={{
              ...st.bt,
              ...(tab === x.i ? st.bta : st.bts),
              flex: "1 1 calc(25% - 10px)",
              minWidth: 200,
              justifyContent: "center",
              padding: "15px 10px",
            }}
            onClick={() => setTab(x.i)}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
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
                style={st.hc}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ margin: "0 0 15px 0", fontSize: 24, display: "flex", alignItems: "center", gap: 10 }}>
                  {x.ic}
                  {x.t}
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 15 }}>
                  <strong>Significado:</strong> {x.d}
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>{x.det}</p>
                <motion.div
                  style={{
                    padding: 15,
                    background: "var(--lit-bg)",
                    borderRadius: 8,
                    borderLeft: `4px solid var(--lit-gold)`,
                    fontSize: 14,
                    color: "var(--lit-red)",
                    fontStyle: "italic",
                  }}
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
      <motion.div style={st.card} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 20 }}>Preparação para a Comunhão</h3>
        <ol style={{ paddingLeft: 25, lineHeight: 1.8 }}>
          <li><strong>Confissão:</strong> Confessar-se regularmente</li>
          <li><strong>Jejum:</strong> Desde a meia-noite</li>
          <li><strong>Oração:</strong> Orações preparatórias</li>
          <li><strong>Vestimenta:</strong> Modéstia e respeito</li>
          <li><strong>Chegada:</strong> Antedência para a Liturgia</li>
        </ol>
      </motion.div>
      <motion.div style={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }}>
        "A Eucaristia é o centro da vida da Igreja, o sacramento dos sacramentos."
        <br />
        <footer style={{ fontStyle: "normal", marginTop: 10, fontSize: 14 }}>— São João Crisóstomo</footer>
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
    <div style={st.sc}>
      <motion.div style={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 style={st.st}>
          <IconMoon size={32} color="var(--lit-gold)" /> Vida Espiritual e Ascese
        </h1>
        <p style={st.sst}>Oração, jejum e combate às paixões</p>
      </motion.div>
      <motion.p style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 30 }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        A vida cristã ortodoxa é uma <strong>jornada de transformação</strong> (Theosis) em que nos tornamos cada vez mais semelhantes a Cristo.
      </motion.p>
      <motion.h3 style={{ margin: "30px 0 20px 0", fontSize: 22 }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        As Quatro Práticas
      </motion.h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
        {p.map((x, i) => (
          <motion.div
            key={x.i}
            style={{ ...st.card, cursor: "pointer", border: exp === x.i ? `2px solid var(--lit-gold)` : "none" }}
            onClick={() => setExp(exp === x.i ? null : x.i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 15 }}>
              {x.ic}
              <h3 style={{ margin: 0, fontSize: 18 }}>{x.t}</h3>
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: 10 }}>{x.d}</p>
            <AnimatePresence>
              {exp === x.i && (
                <motion.div
                  key={x.i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p style={{ lineHeight: 1.6, marginBottom: 10 }}>{x.det}</p>
                  <div
                    style={{
                      padding: 10,
                      background: "var(--lit-bg)",
                      borderRadius: 6,
                      borderLeft: `3px solid var(--lit-gold)`,
                      fontSize: 14,
                      color: "var(--lit-red)",
                    }}
                  >
                    <strong>Dica:</strong> {x.tip}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <motion.div style={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 20 }}>A Oração de Jesus</h3>
        <motion.div
          style={{
            padding: 20,
            background: "linear-gradient(135deg, var(--lit-gold)15, var(--lit-red)08)",
            borderRadius: 8,
            textAlign: "center",
            marginBottom: 20,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p style={{ fontSize: 20, fontStyle: "italic", margin: 0 }}>
            "Senhor Jesus Cristo, Filho de Deus,
            <br />
            tem misericórdia de mim, pecador"
          </p>
        </motion.div>
        <p style={{ lineHeight: 1.8, marginBottom: 15 }}>
          <strong>Origem:</strong> Baseada na oração do publicano (Lc 18:13).
        </p>
        <p style={{ lineHeight: 1.8, marginBottom: 15 }}>
          <strong>Prática:</strong> Repetir com o coração, sincronizada com a respiração.
        </p>
        <p style={{ lineHeight: 1.8, marginBottom: 0 }}>
          <strong>Benefícios:</strong> Purifica o coração, traz paz, protege, une a Cristo.
        </p>
      </motion.div>
      <motion.div style={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        "A alma que deseja aproximar-se de Deus deve primeiro purificar-se das paixões."
        <br />
        <footer style={{ fontStyle: "normal", marginTop: 10, fontSize: 14 }}>— São Doroteu de Gaza</footer>
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
    <div style={st.sc}>
      <motion.div style={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 style={st.st}>
          <IconCalendar size={32} color="var(--lit-gold)" /> Ciclo Litúrgico
        </h1>
        <p style={st.sst}>Festas, jejuns e celebrações</p>
      </motion.div>
      <motion.p style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 30 }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        A Igreja vive segundo um <strong>calendário litúrgico</strong> que nos ajuda a meditar os mistérios da salvação.
      </motion.p>
      <motion.h3 style={{ margin: "30px 0 20px 0", fontSize: 22 }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
        As Grandes Festas
      </motion.h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 40 }}>
        {f.map((x, i) => (
          <motion.div
            key={i}
            style={{ ...st.card, cursor: "pointer" }}
            onClick={() => setExp(exp === i ? null : i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {x.ic}
                <h3 style={{ margin: 0, fontSize: 16 }}>{x.t}</h3>
              </div>
              <span style={{ fontSize: 12, color: "var(--lit-red)" }}>
                {x.d}
              </span>
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: 10 }}>{x.det}</p>
            <AnimatePresence>
              {exp === i && (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ lineHeight: 1.6, fontSize: 14 }}
                >
                  {x.det}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <motion.div style={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 20 }}>Períodos de Jejum</h3>
        <p style={{ lineHeight: 1.8, marginBottom: 20 }}>
          Os jejuns são <strong>ferramentas espirituais</strong> para disciplinar corpo e alma.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 12, color: "white", borderBottom: `1px solid ${c.b}` }}>Jejuno</th>
                <th style={{ textAlign: "left", padding: 12, color: "white", borderBottom: `1px solid ${c.b}` }}>Duração</th>
                <th style={{ textAlign: "left", padding: 12, color: "white", borderBottom: `1px solid ${c.b}` }}>Descrição</th>
              </tr>
            </thead>
            <tbody>
              {j.map((x, i) => (
                <tr key={i}>
                  <td style={{ padding: 12, borderBottom: `1px solid ${c.b}` }}>
                    <strong>{x.n}</strong>
                  </td>
                  <td style={{ padding: 12, borderBottom: `1px solid ${c.b}` }}>{x.d}</td>
                  <td style={{ padding: 12, borderBottom: `1px solid ${c.b}` }}>{x.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <motion.div
          style={{
            marginTop: 20,
            padding: 10,
            background: "var(--lit-bg)",
            borderRadius: 6,
            borderLeft: `3px solid var(--lit-gold)`,
            fontSize: 14,
            color: "var(--lit-red)",
          }}
        >
          <strong>Nota:</strong> Crianças, idosos, doentes, grávidas e amamentando estão isentos.
        </motion.div>
      </motion.div>
      <motion.div style={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        "O ano litúrgico é como uma grande sinfonia da salvação."
        <br />
        <footer style={{ fontStyle: "normal", marginTop: 10, fontSize: 14 }}>— Tradição Litúrgica</footer>
      </motion.div>
    </div>
  );
};

const Historia = () => (
  <div style={st.sc}>
    <motion.div style={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <h1 style={st.st}>
        <IconBook size={32} color="var(--lit-gold)" /> História e Tradição
      </h1>
      <p style={st.sst}>A Igreja Apostólica</p>
    </motion.div>
    <motion.p style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 30 }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
      Conhecer a <strong>história da Igreja</strong> nos ajuda a entender que a fé ortodoxa é a{" "}
      <strong>Tradição Apostólica</strong> preservada ao longo de 2000 anos.
    </motion.p>
    <motion.div style={st.card} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
      <h3 style={{ margin: "0 0 20px 0", fontSize: 20 }}>Linha do Tempo</h3>
      <div style={st.tl}>
        <div style={st.tll} />
        {[
          { y: 0.5, t: "Século I — Era Apostólica", c: "Os Apóstolos pregam e fundam comunidades." },
          { y: 0.6, t: "Século II — Pais Apostólicos", c: "Discípulos dos Apóstolos escrevem cartas." },
          { y: 0.7, t: "325 d.C. — I Concílio de Niceia", c: "Condena o arianismo." },
          { y: 0.8, t: "1054 d.C. — Grande Cisma", c: "Separação entre Ortodoxa e Católica." },
          { y: 0.9, t: "Século XX — Ortodoxia no Brasil", c: "Chegada dos imigrantes sírios e libaneses." },
        ].map((x, i) => (
          <motion.div
            key={i}
            style={st.tli}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div style={st.td}>{i + 1}</div>
            <div style={st.tt}>{x.t}</div>
            <div style={st.tc}>{x.c}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
    <motion.div style={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
      <h3 style={{ margin: "0 0 20px 0", fontSize: 20 }}>A Sé Apostólica de Antioquia</h3>
      <p style={{ lineHeight: 1.8, marginBottom: 15 }}>
        A <strong>Igreja Ortodoxa Grega de Antioquia</strong> é uma das <strong>quatro Igrejas Autocéfalas mais antigas</strong>.
      </p>
      <ul style={{ paddingLeft: 25, lineHeight: 1.8 }}>
        <li><strong>Fundação:</strong> Apóstolos Pedro e Paulo (Atos 11:26)</li>
        <li><strong>Primeiro Nome:</strong> "Cristãos" pela primeira vez</li>
        <li><strong>Sé Apostólica:</strong> Uma das três sedes petrinas</li>
        <li><strong>Atual Patriarca:</strong> Sua Beatitude João X</li>
      </ul>
      <motion.div style={{ marginTop: 20, padding: 15, background: "var(--lit-bg)", borderRadius: 8, borderLeft: `4px solid var(--lit-gold)` }}>
        <p style={{ margin: 0, color: "var(--lit-red)", fontStyle: "italic" }}>
          "Em Antioquia, os discípulos foram pela primeira vez chamados de cristãos."
        </p>
        <footer style={{ fontStyle: "normal", marginTop: 10, fontSize: 12 }}>— Atos 11:26</footer>
      </motion.div>
    </motion.div>
    <motion.div style={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
      "A Igreja é apostólica porque é fundamentada nos Apóstolos."
      <br />
      <footer style={{ fontStyle: "normal", marginTop: 10, fontSize: 14 }}>— Tradição Ortodoxa</footer>
    </motion.div>
  </div>
);

const Paroxia = () => (
  <div style={st.sc}>
    <motion.div style={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
      <h1 style={st.st}>
        <IconMessageUser size={32} color="var(--lit-gold)" /> Vida na Paróquia
      </h1>
      <p style={st.sst}>Comunidade São Jorge</p>
    </motion.div>
    <motion.p style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 30 }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
      A <strong>Paróquia São Jorge</strong> é sua <strong>família espiritual</strong>.
    </motion.p>
    <motion.div style={st.card} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
      <h3 style={{ margin: "0 0 20px 0", fontSize: 20 }}>Nossa Comunidade</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
        <div style={st.card}>
          <h4 style={{ color: "var(--lit-red)", margin: "0 0 10px 0" }}>
            <strong>Pároco:</strong> Pe. Samaan
          </h4>
          <p style={{ margin: 0 }}>Orientação espiritual da paróquia.</p>
        </div>
        <div style={st.card}>
          <h4 style={{ color: "var(--lit-red)", margin: "0 0 10px 0" }}>
            <strong>Catequista:</strong> Talles Diniz Tonatto
          </h4>
          <p style={{ margin: 0 }}>Formação catecumenal.</p>
        </div>
      </div>
    </motion.div>
    <motion.div style={st.hc} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
      <h3 style={{ margin: "0 0 20px 0", fontSize: 20 }}>Ofícios Divinos</h3>
      <p style={{ lineHeight: 1.8, marginBottom: 20 }}>
        Os <strong>Ofícios Divinos</strong> são o <strong>coração da vida paroquial</strong>.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15 }}>
        {[
          { t: "Vésperas", d: "Sábado à tarde", desc: "Preparação para o Domingo" },
          { t: "Divina Liturgia", d: "Domingo de manhã", desc: "Celebração central" },
          { t: "Encontros", d: "[Dia da semana]", desc: "Formação catecumenal" },
        ].map((x, i) => (
          <div key={i} style={{ ...st.card, background: "linear-gradient(135deg, var(--lit-gold)10, var(--lit-red)05)" }}>
            <h4 style={{ color: "var(--lit-red)", margin: "0 0 10px 0" }}>{x.t}</h4>
            <p style={{ margin: "0 0 10px 0", fontSize: 14 }}>{x.d}</p>
            <p style={{ margin: 0, fontSize: 14 }}>{x.desc}</p>
          </div>
        ))}
      </div>
      <motion.div
        style={{
          marginTop: 20,
          padding: 10,
          background: "var(--lit-bg)",
          borderRadius: 6,
          borderLeft: `3px solid var(--lit-gold)`,
          fontSize: 14,
          color: "var(--lit-red)",
        }}
      >
        <strong>Dica:</strong> Tente participar de pelo menos um ofício por semana.
      </motion.div>
    </motion.div>
    <motion.div style={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
      "A paróquia é a família espiritual onde crescemos juntos."
      <br />
      <footer style={{ fontStyle: "normal", marginTop: 10, fontSize: 14 }}>— Pe. Samaan</footer>
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
    <div style={st.sc}>
      <motion.div style={st.sh} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <h1 style={st.st}>
          <IconBook size={32} color="var(--lit-gold)" /> Leituras Recomendadas
        </h1>
        <p style={st.sst}>Recursos para estudo e crescimento</p>
      </motion.div>
      <motion.p style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 30 }} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        A leitura espiritual é <strong>alimento para a alma</strong>.
      </motion.p>
      <motion.div
        style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {cats.map((x, i) => (
          <motion.button
            key={x.i}
            style={{
              ...st.bt,
              ...(cat === x.i ? st.bta : st.bts),
              flex: "1 1 calc(33.333% - 10px)",
              minWidth: 200,
              justifyContent: "center",
              padding: "15px 10px",
            }}
            onClick={() => setCat(x.i)}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {x.ic}
              <span>{x.t}</span>
            </div>
          </motion.button>
        ))}
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.i}
          style={st.hc}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <h3 style={{ margin: "0 0 15px 0", fontSize: 20, display: "flex", alignItems: "center", gap: 10 }}>
            {current.ic}
            {current.t}
          </h3>
          <p style={{ lineHeight: 1.8, marginBottom: 20 }}>{current.d}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 15 }}>
            {current.items.map((y, j) => (
              <motion.div
                key={j}
                style={st.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * j }}
              >
                <h4 style={{ color: "var(--lit-red)", margin: "0 0 10px 0", fontSize: 16 }}>
                  {(y as { a?: string; n?: string }).a || (y as { n?: string }).n}
                </h4>
                <p style={{ margin: "0 0 10px 0", fontSize: 14 }}>
                  <strong>{(y as { w?: string }).w || "Recurso"}:</strong>{" "}
                  {(y as { th?: string }).th || (y as { t2?: string }).t2}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <motion.div style={st.quote} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}>
        "A leitura dos Santos Padres é como um banquete espiritual."
        <br />
        <footer style={{ fontStyle: "normal", marginTop: 10, fontSize: 14 }}>— São João Clímaco</footer>
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
      style={{
        ...st.c,
        ...(dark
          ? {
              background: "linear-gradient(135deg, var(--lit-dark) 0%, var(--lit-bg) 100%)",
            }
          : {}),
      }}
    >
      {/* Mobile overlay backdrop */}
      <div
        className="md:hidden"
        style={{ display: mobileMenuOpen ? "block" : "none" }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile header with hamburger */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-[90] bg-lit-dark text-white flex items-center justify-between px-4 py-3"
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: "bold" }}>
          <IconBuildingChurch size={24} /> Guia Catecumenal
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
        >
          {mobileMenuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
        </button>
      </div>

      {/* SIDEBAR (desktop fixed, mobile slide-in) */}
      <motion.div
        style={{
          ...st.sb,
          ...(dark
            ? {
                background: "linear-gradient(180deg, var(--lit-dark) 0%, var(--lit-bg) 100%)",
              }
            : {
                background: "linear-gradient(180deg, var(--lit-dark) 0%, var(--lit-red) 100%)",
              }),
          ...(mobileMenuOpen
            ? { position: "fixed", transform: "translateX(0)" }
            : {}),
        }}
        initial={{ x: -300 }}
        animate={{ x: mobileMenuOpen ? 0 : -300 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="md:relative md:translate-x-0"
      >
        <motion.div
          style={{
            padding: "0 20px 20px",
            textAlign: "center",
            borderBottom: `1px solid var(--lit-gold)`,
            marginBottom: 20,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            style={{
              width: 60,
              height: 60,
              background: "radial-gradient(circle, var(--lit-gold) 0%, var(--lit-red) 100%)",
              borderRadius: "50%",
              margin: "0 auto 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
            }}
            whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <IconBuildingChurch size={32} color="white" />
          </motion.div>
          <h2 style={{ margin: 0, fontSize: 18, color: "white" }}>Guia Catecumenal</h2>
          <p style={{ margin: "5px 0 0 0", fontSize: 12, opacity: 0.8 }}>São Jorge</p>
        </motion.div>
        <nav>
          {S.map((s) => {
            const isA = sec === s.i;
            const isC = cq[s.i];
            return (
              <motion.div
                key={s.i}
                style={{
                  ...st.ni,
                  ...(isA ? st.nia : {}),
                }}
                onClick={() => {
                  setSec(s.i);
                  setMobileMenuOpen(false);
                }}
                whileHover={{ opacity: 0.8 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * S.findIndex((x) => x.i === s.i) }}
              >
                <span style={{ color: isA ? "var(--lit-bg)" : "white" }}>{s.ic}</span>
                <span>{s.t}</span>
                {isC ? (
                  <motion.span
                    style={{ marginLeft: "auto", color: c.ok }}
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
        <div style={{ padding: 20, marginTop: 20 }}>
          {sd?.q && (
            <motion.button
              style={{
                ...st.bt,
                ...st.bta,
                width: "100%",
                justifyContent: "center",
              }}
              onClick={hStartQ}
              whileHover={{ opacity: 0.9, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconAward size={18} /> Quiz da Seção
            </motion.button>
          )}
          <motion.button
            style={{
              ...st.bt,
              ...st.bts,
              width: "100%",
              justifyContent: "center",
              marginTop: 10,
            }}
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
        style={{
          ...st.h,
          ...(dark
            ? {
                background: "linear-gradient(90deg, var(--lit-dark) 0%, var(--lit-bg) 100%)",
              }
            : {}),
          ...(mobileMenuOpen
            ? { position: "fixed", left: 280, top: 0 }
            : {}),
        }}
        className="md:static md:translate-x-0"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={st.lg}>
          <IconBuildingChurch size={28} />
          <span>Guia Catecumenal Interativo</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={st.pb}>
            <motion.div
              style={st.pf}
              initial={{ width: 0 }}
              animate={{ width: `${pg}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <span style={{ fontSize: 14, color: "white" }}>{Math.round(pg)}% Concluído</span>
          <motion.button
            style={{
              ...st.bt,
              background: "transparent",
              border: `1px solid var(--lit-gold)`,
              color: "var(--lit-gold)",
            }}
            onClick={goP}
            disabled={idx === 0}
            whileHover={{ opacity: 0.9, scale: 1.02 }}
          >
            <IconChevronLeft size={18} />
          </motion.button>
          <motion.button
            style={{
              ...st.bt,
              background: "transparent",
              border: `1px solid var(--lit-gold)`,
              color: "var(--lit-gold)",
            }}
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
        className="md:ml-[280px] md:pt-[90px] pt-[60px] w-full"
        style={{ ...st.m, ...(dark ? { color: "white" } : {}), marginLeft: 0, paddingLeft: 0 }}
      >
        <AnimatePresence mode="wait">
          {sectionComponents[sec] ?? sectionComponents["bem-vindo"]}
        </AnimatePresence>

        {/* NOTIFICATIONS */}
        <div
          style={{
            position: "fixed",
            top: 100,
            right: 40,
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <AnimatePresence>
            {notif.map((n) => (
              <motion.div
                key={n.id}
                style={{
                  padding: "12px 20px",
                  borderRadius: 8,
                  background: n.t === "ok" ? c.ok : n.t === "err" ? c.err : c.info,
                  color: "white",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
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
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQ(false)}
            >
              <motion.div
                style={{
                  ...st.qc,
                  ...(dark
                    ? {
                        background: "var(--lit-red)",
                        color: "white",
                      }
                    : {}),
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {!qDone ? (
                  <>
                    <motion.div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2
                        style={{
                          color: "var(--lit-gold)",
                          margin: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <IconInfoCircle size={24} color="var(--lit-gold)" />
                        {curQ.t}
                      </h2>
                      <motion.button
                        style={{
                          ...st.bt,
                          background: "transparent",
                          border: `1px solid var(--lit-gold)`,
                          color: "var(--lit-gold)",
                          padding: "8px 12px",
                        }}
                        onClick={() => setShowQ(false)}
                        whileHover={{ opacity: 0.9, scale: 1.02 }}
                      >
                        <IconBan size={18} />
                      </motion.button>
                    </motion.div>
                    <p
                      style={{
                        color: "var(--lit-text-secondary)",
                        marginBottom: 20,
                      }}
                    >
                      {curQ.d}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                        padding: "10px 15px",
                        background: "var(--lit-bg)",
                        borderRadius: 8,
                      }}
                    >
                      <span style={{ color: "var(--lit-red)", fontWeight: "bold" }}>
                        Questão {qIdx + 1} de {curQ.q.length}
                      </span>
                      <span style={{ color: "var(--lit-gold)", fontWeight: "bold" }}>
                        Pontuação: {score}/{curQ.q.length}
                      </span>
                    </div>
                    <motion.p
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "var(--lit-gold)",
                        marginBottom: 20,
                        padding: 15,
                        background: "var(--lit-bg)",
                        borderRadius: 8,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {curQ.q[qIdx].q}
                    </motion.p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {curQ.q[qIdx].o.map((o, i) => {
                        const isS = selA === i;
                        const isCorrect = i === curQ.q[qIdx].ca;
                        const isWrong = isS && !isCorrect;
                        return (
                          <motion.button
                            key={i}
                            style={{
                              ...st.bt,
                              textAlign: "left",
                              justifyContent: "flex-start",
                              ...(isS
                                ? isCorrect
                                  ? { background: c.ok, color: "white" }
                                  : { background: c.err, color: "white" }
                                : {}),
                            }}
                            onClick={() => hAnswer(i)}
                            whileHover={{ scale: 1.02 }}
                            disabled={selA !== null}
                          >
                            <span style={{ marginRight: 10, fontWeight: "bold" }}>
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {o}
                            {isS && isCorrect && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{ marginLeft: "auto" }}
                              >
                                <IconCheck size={20} />
                              </motion.span>
                            )}
                            {isWrong && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{ marginLeft: "auto" }}
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
                        style={{
                          marginTop: 20,
                          padding: 15,
                          ...(selA === curQ.q[qIdx].ca
                            ? { background: c.ok + "20" }
                            : { background: c.err + "20" }),
                          borderRadius: 8,
                          borderLeft: `4px solid ${selA === curQ.q[qIdx].ca ? c.ok : c.err}`,
                        }}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <p style={{ margin: 0, fontStyle: "italic" }}>
                          <strong>Explicação:</strong> {curQ.q[qIdx].e}
                        </p>
                      </motion.div>
                    )}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 30 }}>
                      {qIdx > 0 && (
                        <motion.button
                          style={{ ...st.bt, ...st.bts }}
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
                      <motion.button style={{ ...st.bt, ...st.bta }} onClick={hNext} whileHover={{ opacity: 0.9, scale: 1.02 }}>
                        {qIdx < curQ.q.length - 1 ? "Próxima" : "Finalizar"}
                        <IconChevronRight size={18} />
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <motion.div
                    style={{ textAlign: "center", padding: "40px 20px" }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      style={{
                        width: 100,
                        height: 100,
                        background: "radial-gradient(circle, var(--lit-gold) 0%, var(--lit-red) 100%)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 4px 20px rgba(212,175,55,0.3)",
                      }}
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 9999 }}
                    >
                      <IconAward size={48} color="var(--lit-bg)" />
                    </motion.div>
                    <h2 style={{ color: "var(--lit-gold)", margin: "0 0 10px 0", fontSize: 28 }}>Quiz Concluído!</h2>
                    <p style={{ fontSize: 18, margin: "0 0 20px 0" }}>
                      Sua pontuação: {score}/{curQ.q.length} ({Math.round((score / curQ.q.length) * 100)}%)
                    </p>
                    <motion.div
                      style={{
                        width: "100%",
                        height: 8,
                        background: "var(--lit-bg)",
                        borderRadius: 4,
                        margin: "20px 0",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        style={{
                          height: "100%",
                          background: "linear-gradient(90deg, var(--lit-gold), var(--lit-red))",
                          borderRadius: 4,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / curQ.q.length) * 100}%` }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                      />
                    </motion.div>
                    <motion.button
                      style={{ ...st.bt, ...st.bta, padding: "12px 30px" }}
                      onClick={hRestart}
                      whileHover={{ opacity: 0.9, scale: 1.02 }}
                    >
                      Reiniciar Quiz
                    </motion.button>
                    <motion.button
                      style={{
                        ...st.bt,
                        background: "transparent",
                        border: `1px solid var(--lit-gold)`,
                        color: "var(--lit-gold)",
                        marginLeft: 10,
                      }}
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
          style={{
            ...st.f,
            color: dark ? "rgba(255,255,255,0.8)" : "var(--lit-text-secondary)",
          }}
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
            style={{ marginTop: 10, fontSize: 12, color: dark ? "rgba(255,255,255,0.8)" : "var(--lit-text-secondary)" }}
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
