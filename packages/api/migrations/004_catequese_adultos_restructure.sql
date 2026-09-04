-- ☩ Migration 004: Restructure 'catequese-adultos' into one lesson per encontro
-- Fixes: duplicated/missing content, adds group_label for section grouping,
-- adds catechesis_signups table for the real registration form.

-- 1. New column for section/module grouping (used by the dedicated page)
ALTER TABLE catechesis_lessons ADD COLUMN group_label TEXT;

-- 2. Table for real signup submissions (replaces the cosmetic form)
CREATE TABLE IF NOT EXISTS catechesis_signups (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_slug          TEXT NOT NULL REFERENCES catechesis_units(slug),
  full_name          TEXT NOT NULL,
  email              TEXT NOT NULL,
  phone              TEXT,
  birth_date         TEXT,
  previous_religion  TEXT,
  motivation         TEXT,
  agreed_to_terms    INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Remove the old broken/duplicated lesson rows for catequese-adultos
DELETE FROM catechesis_lessons WHERE unit_slug = 'catequese-adultos';

-- 4. Insert one lesson per encontro, Fase I (18) and Fase II (13)
INSERT INTO catechesis_lessons (slug, unit_slug, title, order_index, body, status, group_label) VALUES
('encontro-01', 'catequese-adultos', 'Encontro 1 — 27/06/2027 — Introdução ao Catecumenato e o Sentido da Fé Ortodoxa', 1, '**Ementa:**
- A identidade da Igreja Ortodoxa como o Corpo ininterrupto de Cristo
- O catecumenato nos Padres da Igreja
- A fé não como assentimento intelectual abstrato, mas como comunhão vivencial
- A Theosis como vocação do ser humano

**Texto Patrístico:** São Gregório Teólogo, *Sobre a Teologia*', 'published', 'Módulo A: Dogmática e Antropologia'),
('encontro-02', 'catequese-adultos', 'Encontro 2 — 11/07/2027 — Sagrada Tradição e Sagrada Escritura', 2, '**Ementa:**
- A Igreja como autora, receptora e intérprete da Escritura
- A Tradição viva preservada pelo Espírito Santo
- Os limites do cânon bíblico na Septuaginta
- A crítica ortodoxa ao *sola scriptura*

**Texto Patrístico:** São Vicente de Lérins, *Commonitorium*', 'published', 'Módulo A: Dogmática e Antropologia'),
('encontro-03', 'catequese-adultos', 'Encontro 3 — 25/07/2027 — O Deus Uno e Trino e a Teologia Apofática', 3, '**Ementa:**
- O Deus incompreensível revelado em três Hipóstases
- A Monarquia do Pai como fonte da Divindade
- A geração eterna do Filho e a processão do Espírito Santo
- O método apofático na teologia dos Padres Capadócios

**Análise de Fonte:** Ícone da Santíssima Trindade (São Andrei Rublev)

![Ícone da Trindade](https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Rublev_trinity.jpg/800px-Rublev_trinity.jpg)', 'published', 'Módulo A: Dogmática e Antropologia'),
('encontro-04', 'catequese-adultos', 'Encontro 4 — 08/08/2027 — Criação, Antropologia e o Pecado Ancestral', 4, '**Ementa:**
- A criação *ex nihilo* do mundo visível e invisível
- As hierarquias angélicas
- O ser humano como microcosmo e mediador (corpo, alma e *nous*)
- A queda e a herança da mortalidade (*phthora*)

**Texto Patrístico:** Santo Atanásio, *Sobre a Encarnação do Verbo* (caps. 4-5)', 'published', 'Módulo A: Dogmática e Antropologia'),
('encontro-05', 'catequese-adultos', 'Encontro 5 — 22/08/2027 — Cristologia: A Encarnação e a Economia da Redenção', 5, '**Ementa:**
- O Verbo Encarnado
- O mistério de Cristo verdadeiro Deus e verdadeiro Homem
- O Concílio de Calcedônia (quatro advérbios)
- A Cruz e a vitória sobre o Hades

**Análise de Fonte:** Ícone da Ressurreição (Anastasis)', 'published', 'Módulo A: Dogmática e Antropologia'),
('encontro-06', 'catequese-adultos', 'Encontro 6 — 05/09/2027 — A Igreja Apostólica e a Era dos Santos Mártires', 6, '**Ementa:**
- Pentecostes e a propagação apostólica
- A sucessão episcopal
- Os Pais Apostólicos
- O martírio como testemunho de comunhão com a Paixão de Cristo

**Texto Patrístico:** Santo Inácio de Antioquia, *Carta aos Romanos*', 'published', 'Módulo B: História da Igreja e a Sé de Antioquia'),
('encontro-07', 'catequese-adultos', 'Encontro 7 — 19/09/2027 — Os Sete Concílios Ecumênicos', 7, '**Ementa:**
- A defesa da fé apostólica frente às heresias
- De Niceia I (325) a Niceia II (787)
- O surgimento do papado imperial ocidental e as causas do Cisma de 1054

**Tabela dos 7 Concílios:**

| Concílio | Ano | Local | Heresia Combatida | Decisão Principal |
|----------|------|-------|-------------------|-------------------|
| I Niceia | 325 | Niceia | Arianismo | Cristo é Deus |
| I Constantinopla | 381 | Constantinopla | Macedonismo | Divindade do Espírito |
| Éfeso | 431 | Éfeso | Nestorianismo | Maria é Theotokos |
| Calcedônia | 451 | Calcedônia | Monofisismo | Cristo é Verdadeiro Deus e Homem |
| II Constantinopla | 553 | Constantinopla | Neestedorianismo | Reafirmação de Calcedônia |
| III Constantinopla | 680-681 | Constantinopla | Monotelismo | Cristo tem duas vontades |
| II Niceia | 787 | Niceia | Iconoclastia | Veneração dos ícones |', 'published', 'Módulo B: História da Igreja e a Sé de Antioquia'),
('encontro-08', 'catequese-adultos', 'Encontro 8 — 03/10/2027 — A Sé Apostólica de Antioquia e a Ortodoxia no Brasil', 8, '**Ementa:**
- A fundação apostólica por São Pedro e São Paulo
- Os mártires e teólogos antioquinos
- O Patriarcado Ortodoxo Grego de Antioquia
- A imigração sírio-libanesa para o Brasil e a história da Paróquia São Jorge', 'published', 'Módulo B: História da Igreja e a Sé de Antioquia'),
('encontro-09', 'catequese-adultos', 'Encontro 9 — 17/10/2027 — O Templo Ortodoxo e a Teologia dos Ícones', 9, '**Ementa:**
- A geografia sagrada: nártex, nave, iconostase e santuário
- O papel dos santos ícones como janelas para a eternidade
- A fundamentação teológica do VII Concílio Ecumênico
- Veneração (*proskynesis*) vs. adoração (*latreia*)', 'published', 'Módulo C: Liturgia e os Santos Mistérios'),
('encontro-10', 'catequese-adultos', 'Encontro 10 — 31/10/2027 — O Ciclo Litúrgico e as Grandes Festas', 10, '**Ementa:**
- A teologia do tempo
- O ciclo diário (Vésperas e Matinas)
- O ciclo semanal e a celebração dominical da Ressurreição
- O ano litúrgico e as Doze Grandes Festas

**Doze Grandes Festas:**
1. Natividade da Theotokos (08/09)
2. Exaltação da Santa Cruz (14/09)
3. Apresentação da Theotokos (21/11)
4. Natividade de Cristo (25/12)
5. Teofania (06/01)
6. Apresentação de Cristo (02/02)
7. Anunciação (25/03)
8. Entrada em Jerusalém (Domingo de Ramos)
9. Páscoa (16/04/2028)
10. Ascensão (40 dias após a Páscoa)
11. Pentecostes (50 dias após a Páscoa)
12. Transfiguração (06/08)
13. Dormição da Theotokos (15/08)', 'published', 'Módulo C: Liturgia e os Santos Mistérios'),
('encontro-11', 'catequese-adultos', 'Encontro 11 — 14/11/2027 — A Divina Liturgia Explicada', 11, '**Estrutura da Liturgia:**

1. **Próthesis (Preparação dos Dons)** — Preparação do pão e vinho
2. **Liturgia dos Catecúmenos** — Pequena Entrada, Triságion, Leituras (Epístola e Evangelho), Homilia
3. **Liturgia dos Fiéis** — Grande Entrada, Beijo da Paz, Anáfora (Oração Eucarística), Epiclese (Invocação do Espírito Santo), Comunhão', 'published', 'Módulo C: Liturgia e os Santos Mistérios'),
('encontro-12', 'catequese-adultos', 'Encontro 12 — 28/11/2027 — Iniciação Cristã: Santo Batismo e Santa Crismação', 12, '**Ementa:**
- A entrada ontológica no Corpo de Cristo
- Exorcismos, renúncia solene a Satanás e profissão de fé
- A tripla imersão batismal
- A Crismação como o selo do dom do Espírito Santo

**Rito do Batismo:**
1. Renúncia ao demônio (voltado para o oeste)
2. Profissão de fé (voltado para o leste)
3. Sopros e cuspes rituais
4. Tripla imersão
5. Unção com o Santo Óleo dos catecúmenos
6. Crismação com o Santo Myron', 'published', 'Módulo C: Liturgia e os Santos Mistérios'),
('encontro-13', 'catequese-adultos', 'Encontro 13 — 12/12/2027 — Metanoia e Santa Unção', 13, '**Ementa:**
- A Igreja como hospital terapêutico
- A Confissão (*Metanoia*) como restauração da graça batismal
- O sacerdote como médico e testemunha
- A Santa Unção dos Enfermos

*Encontro co-conduzido com o Pe. Samaan.*

**Oração de São Efrém:**

> Senhor e Soberano de minha vida, tira de mim o espírito de preguiça, desânimo, dominação e tagarelice. Concede-me, ó servo de Deus, o espírito de castidade, humildade, paciência e amor. Sim, ó Senhor e Rei, dá-me que veja os meus pecados e não julgue o meu irmão, porque bendito és Tu pelos séculos dos séculos. Amém.

*(Fazer 3 metânias e 12 prostrações a cada estrofe)*', 'published', 'Módulo C: Liturgia e os Santos Mistérios'),
('encontro-14', 'catequese-adultos', 'Encontro 14 — 19/12/2027 — Santo Matrimônio', 14, '**Ementa:**
- O casamento como ministério de salvação e Igreja doméstica
- O rito dos anéis (noivado) e a coroação nupcial
- A teologia do martírio e do amor oblativo no matrimônio cristão', 'published', 'Módulo C: Liturgia e os Santos Mistérios'),
('encontro-15', 'catequese-adultos', 'Encontro 15 — 09/01/2028 — A Ordem Sagrada e a Vida Monástica', 15, '**Ementa:**
- O sacerdócio de Cristo exercido no episcopado, presbitério e diaconato
- As ordens menores (leitor, subdiácono)
- A vida monástica como ideal apostólico

*Encontro co-conduzido com o Pe. Samaan.*', 'published', 'Módulo C: Liturgia e os Santos Mistérios'),
('encontro-16', 'catequese-adultos', 'Encontro 16 — 16/01/2028 — Oração Pessoal, Regra Diária e Hesicasmo', 16, '**Ementa:**
- A oração particular da manhã e da noite (*Horologion*)
- O recolhimento interior
- A Oração de Jesus (*Kýrie Iesoû Christé...*)
- A disciplina com o *komboskini*

**Meta:** 50-100 repetições da Oração de Jesus por dia', 'published', 'Módulo D: Vida Espiritual e Ortopraxia'),
('encontro-17', 'catequese-adultos', 'Encontro 17 — 23/01/2028 (Manhã) — Ascese Cristã: Jejum e Esmola', 17, '**Ementa:**
- A teologia medicinal do jejum
- Os períodos de abstinência
- O jejum dos sentidos e das paixões
- A esmola como partilha da justiça evangélica

**Calendário de Jejum:**
- **Quartas e Sextas:** Todo o ano (exceto períodos de festas)
- **Quaresma Grande:** 30/01/2028 – 16/04/2028
- **Quaresma do Natal:** 15/11/2027 – 24/12/2027
- **Quaresma da Dormição:** 01/08/2028 – 14/08/2028', 'published', 'Módulo D: Vida Espiritual e Ortopraxia'),
('encontro-18', 'catequese-adultos', 'Encontro 18 — 23/01/2028 (Tarde) — O Combate Espiritual: Paixões e Virtudes', 18, '**Os Oito Pensamentos Paixonados (*Logismoi*):**

| Paixão | Virtude Oposta | Remédio |
|--------|-----------------|---------|
| Gula | Temperança | Jejum |
| Luxúria | Pureza | Oração |
| Avareza | Generosidade | Esmola |
| Ira | Mansidão | Paciência |
| Tristeza | Esperança | Ação de graças |
| Acídia | Zelos | Oração |
| Vanglória | Humildade | Silêncio |
| Orgulho | Amor a Deus | Obediência |', 'published', 'Módulo D: Vida Espiritual e Ortopraxia'),
('encontro-19', 'catequese-adultos', 'Encontro 19 — 30/01/2028 — Domingo de Zaqueu', 19, '**Tema:** Conversão e Zelo Espiritual

**Leitura:** Lucas 19:1-10', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-20', 'catequese-adultos', 'Encontro 20 — 06/02/2028 — Domingo do Publicano e do Fariseu', 20, '**Tema:** A Humildade como Alicerce

**Leitura:** Lucas 18:9-14

> "Deus, tem misericórdia de mim, pecador." (Lucas 18:13)', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-21', 'catequese-adultos', 'Encontro 21 — 13/02/2028 — Domingo do Filho Pródigo', 21, '**Tema:** Metanoia e a Misericórdia do Pai

**Leitura:** Lucas 15:11-32

> "Levantai-vos e ide para vosso pai." (Lucas 15:18)', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-22', 'catequese-adultos', 'Encontro 22 — 20/02/2028 — Domingo da Carne / Juízo Final', 22, '**Tema:** Escatologia e a Vida do Século Vindouro

**Leitura:** Mateus 25:31-46

> "Tudo o que fizestes a um destes meus irmãos, a Mim o fizestes." (Mateus 25:40)

**Último dia de consumo de carne.**', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-23', 'catequese-adultos', 'Encontro 23 — 27/02/2028 — Domingo do Perdão (Cheesefare)', 23, '**Tema:** Expulsão de Adão e o Perdão Mútuo

**Leitura:** Mateus 6:14-21

> "Perdoai, e sereis perdoados." (Lucas 6:37)

**Preparo para a Segunda-Feira Limpa.**', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-24', 'catequese-adultos', 'Encontro 24 — 05/03/2028 — 1º Domingo da Quaresma – Triunfo da Ortodoxia', 24, '**Tema:** A Vitória sobre a Iconoclastia

**Leitura:** João 1:43-51

> "Aquele que não confessa que Cristo pode ser pintado na carne nega que Ele realmente se fez carne." ', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-25', 'catequese-adultos', 'Encontro 25 — 12/03/2028 — 2º Domingo da Quaresma – São Gregório Palamas', 25, '**Tema:** A Theosis em Plenitude

**Leitura:** Marcos 2:1-12

**Teologia da Luz do Tabor:**
- Distinção entre Essência divina (incomunicável) e Energias Incriadas (participáveis)
- A oração do coração permite ao ser humano ser permeado pela luz da glória divina
- Aprofundamento da crítica ao *Filioque* à luz da Monarquia do Pai', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-26', 'catequese-adultos', 'Encontro 26 — 19/03/2028 — 3º Domingo da Quaresma – Veneração da Santa Cruz', 26, '**Tema:** A Cruz como Árvore da Vida

**Leitura:** Marcos 8:34-9:1

> "Se alguém quer vir após Mim, negue-se a si mesmo." (Marcos 8:34)', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-27', 'catequese-adultos', 'Encontro 27 — 26/03/2028 — 4º Domingo da Quaresma – São João Clímaco', 27, '**Tema:** A Escada da Divina Ascensão

**Leitura:** Marcos 9:17-31

**Os 30 degraus da maturidade espiritual:**
- Combate às paixões
- Aquisição do discernimento (*diakrisis*)
- Valor do desapego no mundo secular', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-28', 'catequese-adultos', 'Encontro 28 — 01/04/2028 — Sábado do Hino Acátisto', 28, '**Tema:** Mariologia e a Santa Theotokos

**Leitura:** Lucas 1

**Doutrina mariana no III Concílio Ecumênico de Éfeso (431):**
- Maria como *Theotokos* (Mãe de Deus)
- Maria como *Aeiparthenos* (Sempre Virgem)
- O hino *Akáthistos*', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-29', 'catequese-adultos', 'Encontro 29 — 02/04/2028 — 5º Domingo da Quaresma – Santa Maria do Egito', 29, '**Tema:** A Radicalidade da Metanoia

**Leitura:** Marcos 10:32-45

**História:**
- Passagem da depravação absoluta à santidade luminosa no deserto
- Ausência de desespero frente à misericórdia de Deus
- Vida de oração e recepção dos sacramentos pelo Abade Zósimas', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-30', 'catequese-adultos', 'Encontro 30 — 08-09/04/2028 — Sábado de Lázaro e Domingo de Ramos', 30, '**Tema:** Preparação Mistagógica Imediata

**Roteiro Prático:**
1. Ensaio detalhado do Rito de Batismo e/ou Crismação
2. Escolha formal do Padrinho/Madrinha ortodoxo
3. Escolha do Nome de Batismo/Padroeiro
4. Agendamento da Confissão Geral de Vida pré-batismal', 'published', 'Fase II: Catecumenato Intensivo Quaresmal'),
('encontro-31', 'catequese-adultos', 'Encontro 31 — 10-15/04/2028 — Grande e Santa Semana', 31, '**Tema:** A Lógica dos Ofícios Sagrados

**Cronograma:**
- **Segunda a Quarta-Feira Santa:** As Matinas do Noivo (*Nymphios*)
- **Quinta-Feira Santa:** A Ceia Mística, a traição de Judas e os Doze Evangelhos da Paixão
- **Sexta-Feira Santa:** As Horas Reais, a Deposição da Cruz e a Procissão do Santo Epitáfio
- **Grande e Santo Sábado:** A Descida ao Hades, a Liturgia de São Basílio', 'published', 'Fase II: Catecumenato Intensivo Quaresmal');
