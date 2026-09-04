-- ☩ São Jorge — Seed Feast Chants (Triodion, Pentecostarion, Great Feasts)
INSERT OR REPLACE INTO chants (slug, hymn_type, title_pt, title_ar, tone, occasion, text_pt, text_ar, status) VALUES

-- Triodion (Pre-Lenten)
('triodion-publican-pharisee-troparion', 'troparion', 'Tropário do Publicano e do Fariseu', 'طروباري العشار والفريسي', NULL, 'triodion',
'Abramos as portas do arrependimento, ó salvos pelo Senhor. Que nossos olhos derramem lágrimas, e purifiquemos nossos corpos com o jejum, clamando: Ó Rei de todos e Senhor, perdoa-nos como Compassivo e Amigo do homem.',
'لِنَفْتَحْ أَبْوَابَ التَّوْبَةِ أَيُّهَا الْمُخَلَّصُونَ بِالرَّبِّ. لِنَبْكِي بِعُيُونِنَا، وَلْنُطَهِّرْ أَبْدَانَنَا بِالصِّيَامِ، صَارِخِينَ: يَا مَلِكَ الْجَمِيعِ وَالرَّبَّ، اغْفِرْ لَنَا كَرَؤُوفٍ وَمُحِبٍّ لِلْبَشَرِ.',
'published'),

('triodion-prodigal-son-troparion', 'troparion', 'Tropário do Filho Pródigo', 'طروباري الابن الضال', NULL, 'triodion',
'Abandonei a glória do Pai e dissipei minhas riquezas em prazeres, e agora clamo a Ti: Pequei diante de Ti, Senhor, recebe-me como ao filho pródigo e tem misericórdia de mim.',
'تَرَكْتُ مَجْدَ الآبِ وَبَذَّرْتُ خَيْرَاتِي فِي الْمَلَذَّاتِ، وَالآنَ أَصْرُخُ إِلَيْكَ: قَدْ أَخْطَأْتُ إِلَيْكَ يَا رَبُّ، اقْبَلْنِي كَالابْنِ الضَّالِّ وَارْحَمْنِي.',
'published'),

('triodion-last-judgment-troparion', 'troparion', 'Tropário do Juízo Final', 'طروباري الدينونة', NULL, 'triodion',
'Quando viéres com glória para julgar o mundo inteiro, então tudo tremerá. Mas quem poderá suportar o fogo da Tua presença? Tem piedade de nós, ó Senhor, antes do fim.',
'عِنْدَمَا تَأْتِي بِمَجْدٍ لِتَدِينَ الْعَالَمَ كُلَّهُ، حِينَئِذٍ تَرْتَعِدُ الْأُمُورُ كُلُّهَا. وَلَكِنْ مَنْ يَقْوَى عَلَى نَارِ حُضُورِكَ؟ ارْحَمْنَا يَا رَبُّ قَبْلَ النِّهَايَةِ.',
'published'),

('triodion-forgiveness-troparion', 'troparion', 'Tropário do Perdão', 'طروباري الغفران', NULL, 'triodion',
'Hoje é o início da salvação. O jejum nos purifica e nos prepara para a ressurreição. Que nossa oração suba como incenso diante de Ti, ó Senhor.',
'الْيَوْمَ بَدْءُ الْخَلاَصِ. الصِّيَامُ يُطَهِّرُنَا وَيُعِدُّنَا لِلْقِيَامَةِ. لِتَصْعَدْ صَلَاتُنَا كَبُخُورٍ أَمَامَكَ يَا رَبُّ.',
'published'),

-- Pentecostarion (Post-Paschal)
('pentecostarion-pascha-troparion', 'troparion', 'Tropário da Páscoa', 'طروباري الفصح', NULL, 'pentecostarion',
'Cristo ressuscitou dos mortos, pisoteando a morte com a morte, e aos que estavam nos sepulcros deu a vida.',
'الْمَسِيحُ قَامَ مِنَ الأَمْوَاتِ، وَدَاسَ الْمَوْتَ بِالْمَوْتِ، وَوَهَبَ الْحَيَاةَ لِلَّذِينَ فِي الْقُبُورِ.',
'published'),

('pentecostarion-pascha-kontakion', 'kontakion', 'Kondákion da Páscoa', 'القنداق - الفصح', NULL, 'pentecostarion',
'Embora tenhas descido ao sepulcro, ó Imortal, destruíste o poder do inferno e ressuscitaste como vencedor, ó Cristo Deus.',
'إِنْ نَزَلْتَ إِلَى الْقَبْرِ يَا غَيْرَ الْمَائِتِ، لَكِنَّكَ حَطَمْتَ قُوَّةَ الْجَحِيمِ، وَقُمْتَ ظَافِرًا يَا الْمَسِيحُ إِلهَنَا.',
'published'),

('pentecostarion-ascension-troparion', 'troparion', 'Tropário da Ascensão', 'طروباري الصعود', NULL, 'pentecostarion',
'Subiste em glória, ó Cristo nosso Deus, alegrando os Teus discípulos com a promessa do Espírito Santo.',
'صَعِدْتَ بِالْمَجْدِ يَا الْمَسِيحُ إِلهَنَا، مُفَرِّحًا تَلاَمِيذَكَ بِمَوْعِدِ الرُّوحِ الْقُدُسِ.',
'published'),

('pentecostarion-pentecost-troparion', 'troparion', 'Tropário de Pentecostes', 'طروباري العنصرة', NULL, 'pentecostarion',
'Bendito és Tu, ó Cristo nosso Deus, que revelaste os pescadores como os mais sábios, enviando-lhes o Espírito Santo.',
'مُبَارَكٌ أَنْتَ يَا الْمَسِيحُ إِلهَنَا، الَّذِي أَظْهَرْتَ الصَّيَّادِينَ أَكْثَرَ حِكْمَةً، مُرْسِلًا لَهُمُ الرُّوحَ الْقُدُسَ.',
'published'),

-- Great Feasts
('nativity-troparion', 'troparion', 'Tropário do Natal', 'طروباري الميلاد', NULL, 'great-feast',
'Teu nascimento, ó Cristo nosso Deus, fez brilhar sobre o mundo a luz do conhecimento.',
'وِلاَدَتُكَ يَا مَسِيحُ إِلهَنَا أَشْرَقَتْ لِلْعَالَمِ نُورَ الْمَعْرِفَةِ.',
'published'),

('theophany-troparion', 'troparion', 'Tropário da Teofania', 'طروباري الظهور الإلهي', NULL, 'great-feast',
'No Jordão, quando foste batizado, ó Senhor, a adoração da Trindade se manifestou.',
'فِي الْأُرْدُنِّ عَمَّادُكَ يَا رَبُّ، عِبَادَةُ الثَّالُوثِ ظَهَرَتْ.',
'published'),

('transfiguration-troparion', 'troparion', 'Tropário da Transfiguração', 'طروباري التجلي', NULL, 'great-feast',
'Foste transfigurado no monte, ó Cristo nosso Deus, mostrando aos Teus discípulos Tua glória.',
'تَجَلَّيْتَ عَلَى الْجَبَلِ يَا الْمَسِيحُ إِلهَنَا، مُظْهِرًا لِتَلاَمِيذِكَ مَجْدَكَ.',
'published'),

('dormition-troparion', 'troparion', 'Tropário da Dormição', 'طروباري رقاد والدة الإله', NULL, 'great-feast',
'Na concepção guardaste a virgindade, na dormição não abandonaste o mundo, ó Theotókos.',
'فِي الْحَبَلِ حَفِظْتِ الْعَذْرِيَّةَ، فِي الرُّقَادِ لَمْ تَتْرُكِي الْعَالَمَ يَا وَالِدَةَ اللهِ.',
'published'),

('annunciation-troparion', 'troparion', 'Tropário da Anunciação', 'طروباري البشارة', NULL, 'great-feast',
'Hoje é o início da nossa salvação e a revelação do mistério eterno.',
'الْيَوْمَ رَأْسُ خَلاَصِنَا، وَإِظْهَارُ السِّرِّ الَّذِي قَبْلَ الدُّهُورِ.',
'published'),

-- Resurrectional (additional tones with full texts)
('resurrection-tone-5-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 5', 'القنداق - اللحن الخامس', 5, 'resurrection',
'Descendeste ao inferno, ó Cristo, e quebraste as portas do inferno. Como durante três dias estiveste no sepulcro, como Jonas na baleia.',
'نَزَلْتَ إِلَى الْجَحِيمِ يَا الْمَسِيحُ، وَحَطَمْتَ أَبْوَابَ الْجَحِيمِ. وَكَانَ لَكَ الْقَبْرُ ثَلاَثَةَ أَيَّامٍ كَمَا كَانَ يُونَانُ فِي جَوْفِ الْحُوتِ.',
'published'),

('resurrection-tone-6-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 6', 'القنداق - اللحن السادس', 6, 'resurrection',
'As mulheres portadoras do mirra vieram ao Teu sepulcro, e encontraram o anjo que lhes anunciou: O Senhor ressuscitou!',
'جَاءَتْ حَامِلاَتُ الطِّيبِ إِلَى قَبْرِكَ، فَوَجَدْنَ الْمَلاَكَ مُبَشِّرًا لَهُنَّ: قَامَ الرَّبُّ!',
'published'),

('resurrection-tone-7-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 7', 'القنداق - اللحن السابع', 7, 'resurrection',
'Já não mais te guardará o sepulcro, ó Cristo, pois ressuscitaste ao terceiro dia.',
'لَنْ يَحْتَفِظَ بِكَ الْقَبْرُ بَعْدُ يَا الْمَسِيحُ، فَإِنَّكَ قُمْتَ فِي الْيَوْمِ الثَّالِثِ.',
'published'),

('resurrection-tone-8-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 8', 'القنداق - اللحن الثامن', 8, 'resurrection',
'Ressuscitando dos mortos, vivificaste os mortos e levantaste Adão, e Eva exulta na Tua ressurreição.',
'إِذْ قُمْتَ مِنَ الأَمْوَاتِ، أَحْيَيْتَ الأَمْوَاتَ وَأَقَمْتَ آدَمَ، وَحَوَّاءُ تَبْتَهِجُ بِقِيَامَتِكَ.',
'published');
