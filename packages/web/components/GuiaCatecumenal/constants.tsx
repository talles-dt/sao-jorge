/* ===== Shared colors (mapped to liturgical theme variables) ===== */
export const c = {
  p: "var(--lit-bg)",
  s: "var(--lit-red)",
  a: "var(--lit-gold)",
  l: "var(--lit-light)",
  d: "var(--lit-dark)",
  t: "var(--lit-text)",
  b: "#3e342b",
  ok: "#28a745",
  err: "#dc3545",
  info: "#17a2b8",
};

/* ===== Quizzes ===== */
export const Q = {
  f: {
    t: "Quiz: Fundamentos",
    d: "Teste sobre os pilares.",
    q: [
      { q: "Quantas Pessoas na Trindade?", o: ["1", "2", "3", "4"], ca: 2, e: "Um Deus em Três Pessoas: Pai, Filho, Espírito Santo." },
      { q: "Qual sacramento marca entrada na Igreja?", o: ["Eucaristia", "Batismo", "Confissão", "Crismação"], ca: 1, e: "O Batismo nos torna membros do Corpo de Cristo." },
      { q: "O que significa Theotokos?", o: ["Mãe de Deus", "Mãe de Cristo", "Mãe da Igreja", "Mãe dos Santos"], ca: 0, e: "Theotokos = Mãe de Deus (em grego: Θεοτόκος)." },
    ],
  },
  sac: {
    t: "Quiz: Sacramentos",
    d: "Teste sobre os Santos Mistérios.",
    q: [
      { q: "Quantos Sacramentos?", o: ["5", "7", "10", "12"], ca: 1, e: "7 Santos Mistérios: Batismo, Crismação, Eucaristia, Confissão, Unção, Ordenação, Matrimônio." },
      { q: "Centro da vida litúrgica?", o: ["Batismo", "Eucaristia", "Confissão", "Matrimônio"], ca: 1, e: "A Divina Liturgia (Eucaristia) é o coração da vida da Igreja." },
      { q: "O que é necessário para comungar?", o: ["Jejuar", "Confessar", "Estar em graça", "Todas"], ca: 3, e: "Jejum eucarístico, confissão (se necessário), estado de graça." },
    ],
  },
  e: {
    t: "Quiz: Espiritualidade",
    d: "Teste sobre práticas espirituais.",
    q: [
      { q: "Oração mais importante?", o: ["Oração de Jesus", "Pai Nosso", "Ave Maria", "Credo"], ca: 0, e: '"Senhor Jesus Cristo, Filho de Deus, tem misericórdia de mim, pecador"' },
      { q: "O que é hesiquia?", o: ["Silêncio interior", "Canto litúrgico", "Jejum", "Peregrinação"], ca: 0, e: "Hesiquia = silêncio interior, paz do coração." },
      { q: "Propósito do jejum?", o: ["Perder peso", "Disciplinar corpo e alma", "Seguir lei", "Impressionar"], ca: 1, e: "Ferramenta espiritual para disciplinar corpo e alma." },
    ],
  },
};

/* ===== Section metadata ===== */
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
  IconStar,
  IconSun,
  IconX,
} from "@tabler/icons-react";

export type { SVGProps } from "react";

export {
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
  IconStar,
  IconSun,
  IconX,
};
