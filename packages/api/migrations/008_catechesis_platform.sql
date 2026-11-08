PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS catechesis_modules (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL CHECK (level IN ('basic', 'intermediate', 'advanced')),
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catechesis_module_versions (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES catechesis_modules(id),
  version INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(module_id, version)
);

CREATE TABLE IF NOT EXISTS catechesis_topics (
  id TEXT PRIMARY KEY,
  module_version_id TEXT NOT NULL REFERENCES catechesis_module_versions(id) ON DELETE CASCADE,
  meeting_number INTEGER NOT NULL CHECK (meeting_number BETWEEN 1 AND 8),
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  scope_note TEXT NOT NULL,
  UNIQUE(module_version_id, meeting_number)
);

CREATE TABLE IF NOT EXISTS catechesis_cohorts (
  id TEXT PRIMARY KEY,
  module_version_id TEXT NOT NULL REFERENCES catechesis_module_versions(id),
  title TEXT NOT NULL,
  starts_on TEXT NOT NULL,
  ends_on TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'in_progress', 'closed', 'archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catechesis_meetings (
  id TEXT PRIMARY KEY,
  cohort_id TEXT NOT NULL REFERENCES catechesis_cohorts(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES catechesis_topics(id),
  meeting_number INTEGER NOT NULL CHECK (meeting_number BETWEEN 1 AND 8),
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  live_url TEXT,
  recording_uid TEXT,
  recording_published_at TEXT,
  recording_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cohort_id, meeting_number)
);

CREATE TABLE IF NOT EXISTS catechesis_applications (
  id TEXT PRIMARY KEY,
  cohort_id TEXT NOT NULL REFERENCES catechesis_cohorts(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  parish TEXT,
  attendance_preference TEXT NOT NULL CHECK (attendance_preference IN ('presential', 'online', 'hybrid')),
  consent_version TEXT NOT NULL,
  consented_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  retention_until TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cohort_id, email)
);

CREATE TABLE IF NOT EXISTS catechesis_enrollments (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL UNIQUE REFERENCES catechesis_applications(id),
  cohort_id TEXT NOT NULL REFERENCES catechesis_cohorts(id),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'removed', 'completed')),
  approved_by TEXT NOT NULL,
  approved_at TEXT NOT NULL,
  access_until TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cohort_id, email)
);

CREATE TABLE IF NOT EXISTS catechesis_magic_tokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catechesis_sessions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catechesis_access_extensions (
  id TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL REFERENCES catechesis_enrollments(id),
  meeting_id TEXT REFERENCES catechesis_meetings(id),
  previous_expires_at TEXT,
  new_expires_at TEXT NOT NULL,
  reason TEXT NOT NULL,
  actor_subject TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_catechesis_applications_status ON catechesis_applications(status, created_at);
CREATE INDEX IF NOT EXISTS idx_catechesis_enrollments_email ON catechesis_enrollments(email, status);
CREATE INDEX IF NOT EXISTS idx_catechesis_meetings_cohort ON catechesis_meetings(cohort_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_catechesis_magic_tokens_expiry ON catechesis_magic_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_catechesis_sessions_expiry ON catechesis_sessions(expires_at);

INSERT OR IGNORE INTO catechesis_modules (id, slug, level, title, objective, description) VALUES
('module-basic', 'basico', 'basic', 'Catequese Básica', 'Apresentar de modo claro o núcleo da fé cristã ortodoxa.', 'Módulo doutrinal independente, com oito encontros quinzenais.'),
('module-intermediate', 'intermediario', 'intermediate', 'Catequese Intermediária', 'Apresentar a Igreja em sua história, liturgia e vida sacramental.', 'Módulo eclesial independente, com oito encontros quinzenais.'),
('module-advanced', 'avancado', 'advanced', 'Catequese Avançada', 'Aprofundar temas teológicos, patrísticos e questões complexas.', 'Módulo teológico independente, com oito encontros quinzenais.');

INSERT OR IGNORE INTO catechesis_module_versions (id, module_id, version, status, published_at) VALUES
('basic-v1', 'module-basic', 1, 'published', CURRENT_TIMESTAMP),
('intermediate-v1', 'module-intermediate', 1, 'published', CURRENT_TIMESTAMP),
('advanced-v1', 'module-advanced', 1, 'published', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO catechesis_topics (id, module_version_id, meeting_number, title, objective, scope_note) VALUES
('basic-1','basic-v1',1,'Escritura, Tradição e fé ortodoxa','Compreender como a Igreja recebe e transmite a fé apostólica.','Conteúdo doutrinal; sem prescrição espiritual.'),
('basic-2','basic-v1',2,'A Santíssima Trindade','Confessar o Deus uno em três Pessoas segundo o Símbolo da Fé.','Conteúdo doutrinal introdutório.'),
('basic-3','basic-v1',3,'Criação, humanidade e pecado','Apresentar a criação, a vocação humana e a queda.','Sem diagnóstico ou aconselhamento individual.'),
('basic-4','basic-v1',4,'A Encarnação','Apresentar Jesus Cristo como verdadeiro Deus e verdadeiro homem.','Conteúdo cristológico introdutório.'),
('basic-5','basic-v1',5,'Cruz, Ressurreição e salvação','Compreender a vitória pascal de Cristo e a salvação.','Sem técnicas ascéticas ou regra de vida.'),
('basic-6','basic-v1',6,'O Espírito Santo e a Igreja','Apresentar a ação do Espírito e a identidade da Igreja.','Conteúdo doutrinal e eclesiológico.'),
('basic-7','basic-v1',7,'O Credo e os Concílios','Situar o Credo e oferecer visão geral dos Concílios Ecumênicos.','Síntese histórica, sem simplificações polêmicas.'),
('basic-8','basic-v1',8,'Síntese e perguntas','Integrar o módulo e esclarecer dúvidas doutrinais.','Não converte perguntas pessoais em direção espiritual.'),
('intermediate-1','intermediate-v1',1,'Igreja apostólica, episcopado e sucessão','Compreender a continuidade apostólica da Igreja.','Descrição eclesiológica.'),
('intermediate-2','intermediate-v1',2,'Antioquia, Brasil e Paróquia São Jorge','Situar a tradição antioquina e a presença local.','Dados paroquiais só após validação documental.'),
('intermediate-3','intermediate-v1',3,'O templo e os ícones','Ler o espaço litúrgico e a teologia dos ícones.','Descrição litúrgica.'),
('intermediate-4','intermediate-v1',4,'O ano litúrgico','Compreender a organização e o sentido do tempo litúrgico.','Sem calendário pessoal de disciplina.'),
('intermediate-5','intermediate-v1',5,'A Divina Liturgia','Reconhecer a estrutura e o sentido eclesial da Liturgia.','Sem instruções de preparação individual.'),
('intermediate-6','intermediate-v1',6,'Batismo, Crismação e Eucaristia','Apresentar os Mistérios da iniciação cristã.','Descrição sacramental; decisões pastorais fora de escopo.'),
('intermediate-7','intermediate-v1',7,'Confissão, Unção, Matrimônio e Ordens','Apresentar os demais Mistérios da Igreja.','Exclusivamente descritivo; sem frequência, indicação ou aconselhamento.'),
('intermediate-8','intermediate-v1',8,'Organização e diversidade ortodoxa hoje','Compreender jurisdições, sinodalidade e diversidade legítima.','Sem partidarismo eclesiástico.'),
('advanced-1','advanced-v1',1,'Teologia apofática','Compreender os limites da linguagem sobre Deus.','Teologia; não técnica contemplativa.'),
('advanced-2','advanced-v1',2,'A Trindade nos Padres Capadócios','Aprofundar a linguagem trinitária patrística.','Fontes específicas serão validadas editorialmente.'),
('advanced-3','advanced-v1',3,'Cristologia e Concílios','Aprofundar as controvérsias e definições cristológicas.','Teologia histórica.'),
('advanced-4','advanced-v1',4,'Antropologia e theosis','Compreender doutrinalmente a vocação humana à comunhão com Deus.','Doutrina; sem programa ascético.'),
('advanced-5','advanced-v1',5,'Graça, essência e energias','Introduzir a distinção teológica e sua recepção.','Sem transformar a doutrina em método espiritual.'),
('advanced-6','advanced-v1',6,'Eclesiologia, sinodalidade e primazia','Examinar estruturas de comunhão e autoridade na Igreja.','Sem polemismo jurisdicional.'),
('advanced-7','advanced-v1',7,'Leitura patrística da Escritura e Tradição','Compreender princípios de leitura e recepção eclesial.','Sem atribuir citações não verificadas.'),
('advanced-8','advanced-v1',8,'Questões contemporâneas e apologética caridosa','Responder com clareza, humildade e caridade.','Sem formar polemistas nem emitir aconselhamento pessoal.');
