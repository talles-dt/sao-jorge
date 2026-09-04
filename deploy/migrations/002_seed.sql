-- ☩ São Jorge Curitiba — Seed Data
-- Run after 001_schema.sql

-- ─── Service Catalog ─────────────────────────────────────────────────────────

INSERT INTO service_catalog (slug, title_pt, title_ar, occasion, sort_order, available) VALUES
('divina-liturgia-crisostomo', 'Divina Liturgia de S. João Crisóstomo', 'القداس الإلهي للقديس يوحنا الذهبي الفم', 'daily', 1, 0),
('divina-liturgia-basilio', 'Divina Liturgia de S. Basílio', 'قداس القديس باسيليوس الكبير', 'daily', 2, 0),
('liturgia-pre-santificados', 'Liturgia dos Pré-santificados', 'الأقداس المسبقة', 'weekday', 3, 0),
('grandes-completas', 'Grandes Completas', 'صلاة النوم الكبرى', 'daily', 10, 1),
('hora-prima', 'Primeira Hora', 'الساعة الأولى', 'daily', 20, 0),
('hora-tercia', 'Terceira Hora', 'الساعة الثالثة', 'daily', 21, 0),
('hora-sexta', 'Sexta Hora', 'الساعة السادسة', 'daily', 22, 0),
('hora-nona', 'Nona Hora', 'الساعة التاسعة', 'daily', 23, 0),
('akathist-theotokos', 'Akathístos à Theotókos', 'الأكاثيست لوالدة الإله', 'feast', 30, 0),
('akathist-sao-jorge', 'Akathístos a São Jorge', 'الأكاثيست للقديس جاورجيوس', 'feast', 31, 0),
('domingo-ramos', 'Domingo de Ramos', 'أحد الشعانين', 'holy-week', 40, 0),
('grande-quinta', 'Grande Quinta-feira', 'الخميس العظيم', 'holy-week', 41, 0),
('grande-sexta', 'Grande Sexta-feira', 'الجمعة العظيمة', 'holy-week', 42, 0),
('sabado-santo', 'Sábado Santo', 'السبت النور', 'holy-week', 43, 0),
('pascoa', 'Santa Páscoa', 'عيد الفصح المقدس', 'holy-week', 44, 0),
('oracoes-manha', 'Orações da Manhã', 'صلوات الصباح', 'daily', 50, 0),
('oracoes-noite', 'Orações da Noite', 'صلوات المساء', 'daily', 51, 0)
ON CONFLICT(slug) DO NOTHING;

-- ─── Common Saints (for reference by saint_slug) ─────────────────────────────

INSERT INTO saints (slug, name_pt, name_ar, name_en, category) VALUES
('john-chrysostom', 'São João Crisóstomo', 'القديس يوحنا الذهبي الفم', 'St. John Chrysostom', 'saint'),
('basil-the-great', 'São Basílio, o Grande', 'القديس باسيليوس الكبير', 'St. Basil the Great', 'saint'),
('gregory-the-theologian', 'São Gregório, o Teólogo', 'القديس غريغوريوس النازياني', 'St. Gregory the Theologian', 'saint'),
('theotokos', 'Santa Maria, Mãe de Deus', 'والدة الإله', 'Theotokos', 'theotokos'),
('saint-george', 'São Jorge', 'القديس جاورجيوس', 'St. George', 'martyr'),
('saint-michael', 'São Miguel Arcanjo', 'القديس ميخائيل', 'St. Michael the Archangel', 'angel')
ON CONFLICT(slug) DO NOTHING;

-- ─── Sample Bulletin (optional) ───────────────────────────────────────────────

INSERT INTO bulletins (id, title_pt, category, publish_date, status) VALUES
('welcome', 'Bem-vindo ao aplicativo litúrgico da Paróquia São Jorge', 'announcement', datetime('now'), 'published')
ON CONFLICT(id) DO NOTHING;

