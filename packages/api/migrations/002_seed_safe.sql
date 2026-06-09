-- ☩ São Jorge V2 — Seed Data (002_seed.sql)
-- Apply after schema (001_schema.sql)

-- ━━━ Catechesis Units ━━━
INSERT OR IGNORE INTO catechesis_units (slug, title, description, order_index) VALUES
('introducao-a-ortodoxia', 'Introdução à Ortodoxia', 'Fundamentos da fé cristã ortodoxa.', 1),
('divina-liturgia', 'A Divina Liturgia', 'Explicação detalhada da Liturgia de São João Crisóstomo.', 2),
('grandes-completas', 'Grandes Completas', 'Estrutura e significado das Grandes Completas.', 3),
('santidade', 'Caminho à Santidade', 'Vida espiritual e ascese na tradição ortodoxa.', 4);

-- ━━━ Catechesis Lessons ━━━
INSERT OR IGNORE INTO catechesis_lessons (slug, unit_slug, title, order_index, body, status) VALUES
('o-que-e-ortodoxia', 'introducao-a-ortodoxia', 'O que é Ortodoxia?', 1, 'A Ortodoxia é a Igreja Una, Santa, Católica e Apostólica, fundada por Jesus Cristo...', 'published'),
('a-santa-tradicao', 'introducao-a-ortodoxia', 'A Santa Tradição', 2, 'A Tradição é a vida da Igreja, transmitida pelos santos pais e concílios...', 'published'),
('simbolo-da-fe', 'introducao-a-ortodoxia', 'O Símbolo da Fé', 3, 'Creio em um só Deus, Pai Todo-Poderoso...', 'published'),

('liturgia-como-misterio', 'divina-liturgia', 'A Liturgia como Mistério', 1, 'A Divina Liturgia é o céu na terra...', 'published'),
('liturgia-dos-catecumenos', 'divina-liturgia', 'Liturgia dos Catecúmenos', 2, 'Inclui antífonas, tropários e leituras...', 'published'),
('liturgia-dos-fieis', 'divina-liturgia', 'Liturgia dos Fiéis', 3, 'Inclui anafora, epiclese e comunhão...', 'published');

-- ━━━ Blog Posts ━━━
INSERT OR IGNORE INTO blog_posts (slug, title, excerpt, body, author, category, tags, status, published_at) VALUES
('natal-2024', 'Reflexões para o Natal de 2024', 'Mensagem de esperança para o Advento e Natal de 2024.',
'Uma luz brilha nas trevas...', 'Padre André', 'catechesis', '[]', 'published', '2024-12-01'),
('pascoa-2025', 'A Ressurreição e o Mistério Pascal', 'Explicação do significado da Páscoa na tradição ortodoxa.',
'O Mistério da Ressurreição é a pedra angular da fé cristã...', 'Padre André', 'liturgical', '[]', 'published', '2025-04-20');

-- ━━━ Service Catalog ━━━
INSERT OR IGNORE INTO service_catalog (slug, title_pt, title_ar, category, subcategory, sort_order) VALUES
('divina-liturgia', 'Divina Liturgia', 'القداس الإلهي', 'liturgia', 'eucarístico', 1),
('grandes-completas', 'Grandes Completas', 'صلوات السحر', 'liturgia', 'diário', 2),
('visita-ao-santissimo', 'Visita ao Santíssimo Sacramento', NULL, 'oracoes', 'devoção', 3),
('paraklesis', 'Paraklesis à Mãe de Deus', 'باراكليسي العذراء', 'liturgia', 'akathistos', 4);