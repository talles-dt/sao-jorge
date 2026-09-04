-- ☩ São Jorge — Seed Resurrectional Chants for 8 Tones
-- Standard Antiochian Octoechos hymns (Fr. Nicholas Malek tradition)
-- Insert into chants table

INSERT OR REPLACE INTO chants (slug, hymn_type, title_pt, title_ar, tone, occasion, text_pt, text_ar, status) VALUES
-- Tone 1
('resurrection-tone-1-troparion', 'troparion', 'Tropário da Ressurreição — Tom 1', 'طروباري القيامة - اللحن الأول', 1, 'resurrection',
'Após a pedra ter sido selada pelos judeus, e os soldados guardando Teu corpo sagrado, ressuscitaste ao terceiro dia, ó Salvador, concedendo a vida ao mundo. Por isso os poderes celestes Te clamam, ó Doador da vida: Glória à Tua ressurreição, ó Cristo; glória ao Teu reino; glória à Tua economia, ó Único Amigo do homem.',
'بَعْدَ أَنْ خَتَمَ الْيَهُودُ الْحَجَرَ، وَكَانَ الْجُنُودُ يَحْرُسُونَ جَسَدَكَ الْمُقَدَّسَ، قُمْتَ فِي الْيَوْمِ الثَّالِثِ أَيُّهَا الْمُخَلِّصُ، مُعْطِيًا الْحَيَاةَ لِلْعَالَمِ. لِذَلِكَ قُوَّاتُ السَّمَاوَاتِ تَهْتِفُ لَكَ يَا مُعْطِيَ الْحَيَاةِ: الْمَجْدُ لِقِيَامَتِكَ أَيُّهَا الْمَسِيحُ، الْمَجْدُ لِمُلْكِكَ، الْمَجْدُ لِتَدْبِيرِكَ أَيُّهَا الْوَحِيدُ الَّذِي يُحِبُّ الْبَشَرَ.',
'published'),

('resurrection-tone-1-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 1', 'القنداق - اللحن الأول', 1, 'resurrection',
'Como Salvador e Doador da vida, ó Cristo, desde o sepulcro ressuscitaste como Deus, e livraste os que estavam no inferno, porque és Deus de todos. Destruíste as portas da morte, e ressuscitaste como Senhor da vida, ó Cristo nosso Deus.',
'أَيُّهَا الْمَسِيحُ، كَأَيِّ إِلهٍ مُخَلِّصٍ وَمُحْيٍ، قُمْتَ مِنَ الْقَبْرِ وَأَنْقَذْتَ الَّذِينَ فِي الْجَحِيمِ، لأَنَّكَ أَنْتَ هُوَ إِلهُ الْجَمِيعِ، وَمَحَوْتَ أَبْوَابَ الْمَوْتِ، وَكَسَيِّدٍ قُمْتَ أَيُّهَا الْمَسِيحُ إِلهُنَا.',
'published'),

('resurrection-tone-1-theotokion', 'theotokion', 'Theotókion — Tom 1', 'الثيوتوكي - اللحن الأول', 1, 'resurrection',
'Alegra-te, ó Virgem Mãe de Deus, Maria cheia de graça, porque de ti nasceu o sol da justiça, Cristo nosso Deus, iluminando os que estão nas trevas. Alegra-te também tu, ó velho justo Simeão, pois recebeste nos braços o Libertador das nossas almas, concedendo-nos a ressurreição.',
'افْرَحِي يَا بَتُولُ يَا وَالِدَةَ اللهِ يَا مَرْيَمُ الْمُمْتَلِئَةَ نِعْمَةً، فَإِنَّهُ مِنْكِ أَشْرَقَتْ شَمْسُ الْبِرِّ الْمَسِيحُ إِلهُنَا مُنِيرًا لِلَّذِينَ فِي الظُّلْمَةِ. افْرَحْ أَيْضًا أَيُّهَا الشَّيْخُ الْبَارُّ سِمْعَانُ، إِذْ حَمَلْتَ فِي ذِرَاعَيْكَ فَادِيَ نُفُوسِنَا الْمَانِحَنَا الْقِيَامَةَ.',
'published'),

-- Tone 2
('resurrection-tone-2-troparion', 'troparion', 'Tropário da Ressurreição — Tom 2', 'طروباري القيامة - اللحن الثاني', 2, 'resurrection',
'Quando descestes à morte, ó Vida imortal, então matastes o inferno com o esplendor da divindade. E quando fizestes ressurgir os mortos das profundezas, todas as potências celestes clamavam: Doador da vida, ó Cristo Deus, glória a vós!',
'حِينَ نَزَلْتَ إِلَى الْمَوْتِ أَيَّتُهَا الْحَيَاةُ غَيْرُ الْمَائِتَةِ، أَمَتَّ الْجَحِيمَ بِلَمْعَةِ اللاَّهُوتِ. وَإِذْ أَقَمْتَ الأَمْوَاتَ مِنَ الْأَسْفِلِ، جَمِيعُ قُوَّاتِ السَّمَاوَاتِ هَتَفَتْ: يَا مُعْطِيَ الْحَيَاةِ الْمَسِيحُ إِلهُنَا الْمَجْدُ لَكَ.',
'published'),

('resurrection-tone-2-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 2', 'القنداق - اللحن الثاني', 2, 'resurrection',
'Não temeste, ó Cristo, descer ao inferno, quebraste as portas eternas, ó Rei da glória, e ressuscitaste ao terceiro dia, concedendo a vida ao mundo.',
'لَمْ تَخْشَ يَا الْمَسِيحُ النُّزُولَ إِلَى الْجَحِيمِ، كَسَرْتَ أَبْوَابَ الأَبَدِ أَيُّهَا الْمَلِكُ الْمَجِيدُ، وَقُمْتَ فِي الْيَوْمِ الثَّالِثِ مُعْطِيًا الْحَيَاةَ لِلْعَالَمِ.',
'published'),

('resurrection-tone-2-theotokion', 'theotokion', 'Theotókion — Tom 2', 'الثيوتوكي - اللحن الثاني', 2, 'resurrection',
'Ó Mãe de Deus, intercessora ardente de todos os cristãos, não nos desprezes no tribunal de Cristo, mas intercede por nós junto ao teu Filho, para que nos salve pela sua grande misericórdia.',
'يَا وَالِدَةَ اللهِ، شَفِيعَةً حَارَّةً لِجَمِيعِ الْمَسِيحِيِّينَ، لَا تَحْتَقِرِينَا فِي دَيْنُونَةِ الْمَسِيحِ، بَلِ اشْفَعِي لَنَا لَدَى ابْنِكِ لِيُخَلِّصَنَا بِرَحْمَتِهِ الْعَظِيمَةِ.',
'published'),

-- Tone 3
('resurrection-tone-3-troparion', 'troparion', 'Tropário da Ressurreição — Tom 3', 'طروباري القيامة - اللحن الثالث', 3, 'resurrection',
'Alegra-te, ó céu, e regozije-se a terra, porque o Senhor operou com seu braço, dissipou a morte pela morte, e foi o primogênito dos mortos, livrando-nos do ventre do inferno, e concedendo ao mundo a grande misericórdia.',
'لِتَفْرَحِ السَّمَاوَاتُ، وَلْتُبْتَهِجِ الأَرْضُ، لأَنَّ الرَّبَّ صَنَعَ عِزًّا بِذِرَاعِهِ، وَدَاسَ الْمَوْتَ بِالْمَوْتِ، وَصَارَ بِكْرَ الأَمْوَاتِ، مُنْقِذَنَا مِنْ أَحْشَاءِ الْجَحِيمِ، وَمَانِحًا الْعَالَمَ الرَّحْمَةَ الْعَظِيمَةَ.',
'published'),

('resurrection-tone-3-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 3', 'القنداق - اللحن الثالث', 3, 'resurrection',
'Hoje ressuscitaste do sepulcro, ó Misericordioso, e nos guiaste das portas da morte. Hoje Adão exulta, e Eva se regozija, e com eles os profetas e patriarcas louvam sem cessar a força divina do teu poder.',
'الْيَوْمَ قُمْتَ مِنَ الْقَبْرِ أَيُّهَا الرَّحِيمُ، وَقَدْ هَدَيْتَنَا مِنْ أَبْوَابِ الْمَوْتِ. الْيَوْمَ آدَمُ يَبْتَهِجُ، وَحَوَّاءُ تَفْرَحُ، وَمَعَهُمَا الأَنْبِيَاءُ وَالآبَاءُ يُسَبِّحُونَ بِلاَ انْقِطَاعٍ قُوَّةَ اللاَّهُوتِ.',
'published'),

('resurrection-tone-3-theotokion', 'theotokion', 'Theotókion — Tom 3', 'الثيوتوكي - اللحن الثالث', 3, 'resurrection',
'Ó Virgem Maria, tu concebeste o Verbo sem semente, e deste à luz o Criador de todas as coisas. Livra-nos das tentações do inimigo, e concede-nos a tua proteção e a grande misericórdia.',
'يَا مَرْيَمُ الْعَذْرَاءُ، أَنْتِ حَبِلْتِ بِالْكَلِمَةِ بِلاَ زَرْعٍ، وَأَلَدْتِ خَالِقَ كُلِّ شَيْءٍ. خَلِّصِينَا مِنْ تَجَارِبِ الْعَدُوِّ، وَامْنَحِينَا حِمَايَتَكِ وَالرَّحْمَةَ الْعَظِيمَةَ.',
'published'),

-- Tone 4
('resurrection-tone-4-troparion', 'troparion', 'Tropário da Ressurreição — Tom 4', 'طروباري القيامة - اللحن الرابع', 4, 'resurrection',
'Aprendendo a boa-nova da ressurreição dos anjos, e o opróbrio ancestral removido, as mulheres discípulas do Senhor disseram cheias de orgulho aos apóstolos: foi despojado o inferno, e Cristo Deus ressuscitou, concedendo ao mundo a grande misericórdia.',
'إِذْ تَعَلَّمَتْ نِسَاءُ التَّلَامِيذِ بَشَائِرَ الْقِيَامَةِ مِنَ الْمَلاَئِكَةِ، وَرَفَضْنَ الشَّتْمَ الْقَدِيمَ، قُلْنَ لِلرُّسُلِ بِافْتِخَارٍ: لَقَدْ سُبِيَ الْجَحِيمُ، وَقَامَ الْمَسِيحُ إِلهُنَا، مُعْطِيًا الْعَالَمَ الرَّحْمَةَ الْعَظِيمَةَ.',
'published'),

('resurrection-tone-4-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 4', 'القنداق - اللحن الرابع', 4, 'resurrection',
'O Salvador do mundo, tendo sido entregue por sua própria vontade ao sepulcro como mortal, ressuscitou ao terceiro dia como imortal. Por isso clamamos com alegria: Glória à tua ressurreição, ó Cristo!',
'أَسْلَمَ نَفْسَهُ طَوْعًا لِلْقَبْرِ الْمَسِيحُ الْفَادِي كَبَشَرٍ، وَقَامَ فِي الْيَوْمِ الثَّالِثِ كَإِلهٍ غَيْرِ مَائِتٍ. لِذَلِكَ نَهْتِفُ بِفَرَحٍ: الْمَجْدُ لِقِيَامَتِكَ أَيُّهَا الْمَسِيحُ!',
'published'),

('resurrection-tone-4-theotokion', 'theotokion', 'Theotókion — Tom 4', 'الثيوتوكي - اللحن الرابع', 4, 'resurrection',
'A Virgem que concebeu o Criador de todas as coisas, e deu à luz o Salvador do mundo, intercede por nossas almas.',
'الْبَتُولُ الَّتِي حَبِلَتْ بِخَالِقِ كُلِّ شَيْءٍ، وَأَلَدَتْ فَادِيَ الْعَالَمِ، تَشْفَعُ فِي نُفُوسِنَا.',
'published'),

-- Tone 5
('resurrection-tone-5-troparion', 'troparion', 'Tropário da Ressurreição — Tom 5', 'طروباري القيامة - اللحن الخامس', 5, 'resurrection',
'Exaltemos em hinos o Verbo co-eterno com o Pai e o Espírito, nascido da Virgem para nossa salvação, porque ele se dignou subir na cruz na carne, e suportou a morte, e ressuscitou os mortos por sua gloriosa ressurreição.',
'لِنُمَجِّدْ بِالْتَّسَابِيحِ الْكَلِمَةَ الْمُتَسَاوِي فِي الْقِدَمِ مَعَ الآبِ وَالرُّوحِ الْقُدُسِ، الْمَوْلُودَ مِنَ الْعَذْرَاءِ مِنْ أَجْلِ خَلاَصِنَا. فَإِنَّهُ سُرَّ أَنْ يَصْلُبَ جَسَدِيًّا، وَيَحْتَمِلَ الْمَوْتَ، وَيُقِيمَ الأَمْوَاتَ بِقِيَامَتِهِ الْمَجِيدَةِ.',
'published'),

('resurrection-tone-5-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 5', 'القنداق - اللحن الخامس', 5, 'resurrection',
'Descendeste aos lugares inferiores da terra, ó Cristo, e quebraste as barras eternas que retinham os presos. E como durante três dias estiveste no sepulcro, como Jonas na baleia, ressuscitaste dos mortos, ó Rei dos reis, Cristo Deus.',
'نَزَلْتَ يَا الْمَسِيحُ إِلَى أَمَاكِنِ الأَرْضِ السُّفْلِيَّةِ، وَحَطَمْتَ مَغَالِيقَ الأَبَدِ لِلْمَحْبُوسِينَ. وَكَانَ لَكَ الْقَبْرُ ثَلاَثَةَ أَيَّامٍ كَمَا كَانَ يُونَانُ فِي جَوْفِ الْحُوتِ. فَقُمْتَ مِنَ الأَمْوَاتِ يَا مَلِكَ الْمُلُوكِ الْمَسِيحُ إِلهَنَا.',
'published'),

('resurrection-tone-5-theotokion', 'theotokion', 'Theotókion — Tom 5', 'الثيوتوكي - اللحن الخامس', 5, 'resurrection',
'Ó Mãe de Deus, tu és a videira verdadeira que produziu o fruto da vida. Implora a salvação de nossas almas.',
'يَا وَالِدَةَ اللهِ، أَنْتِ الْكَرْمَةُ الْحَقِيقَةُ الَّتِي أَثْمَرَتْ ثَمَرَةَ الْحَيَاةِ. اُطْلُبِي خَلاَصَ نُفُوسِنَا.',
'published'),

-- Tone 6
('resurrection-tone-6-troparion', 'troparion', 'Tropário da Ressurreição — Tom 6', 'طروباري القيامة - اللحن السادس', 6, 'resurrection',
'As potências angélicas vieram ao teu sepulcro, e os guardas ficaram como mortos; e Maria estava junto ao sepulcro, buscando o teu corpo imaculado. Tu cativaste o inferno sem ser tentado por ele. Vieste ao encontro da Virgem, concedendo a vida, ó ressuscitado dos mortos, ó Senhor, glória a ti!',
'جَاءَتْ قُوَّاتُ الْمَلاَئِكَةِ إِلَى قَبْرِكَ، وَصَارَ الْحُرَّاسُ كَأَمْوَاتٍ. وَكَانَتْ مَرْيَمُ وَاقِفَةً عِنْدَ الْقَبْرِ تَطْلُبُ جَسَدَكَ الطَّاهِرَ. سَبَيْتَ الْجَحِيمَ وَلَمْ تُجَرَّبْ مِنْهُ. لَقِيتَ الْعَذْرَاءَ مُعْطِيًا الْحَيَاةَ. أَيُّهَا الْقَائِمُ مِنَ الأَمْوَاتِ يَا رَبُّ الْمَجْدُ لَكَ.',
'published'),

('resurrection-tone-6-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 6', 'القنداق - اللحن السادس', 6, 'resurrection',
'Dando a vida aos mortos, ó Cristo, e levantando os que estavam no inferno, iluminaste os que estavam nas trevas. E a ti, ó Doador da vida, cantamos: Glória à tua ressurreição, ó Cristo Deus!',
'أَعْطَيْتَ الْحَيَاةَ لِلأَمْوَاتِ يَا الْمَسِيحُ، وَأَقَمْتَ الَّذِينَ فِي الْجَحِيمِ، وَأَنَرْتَ الَّذِينَ فِي الظُّلْمَةِ. وَلَكَ نُرَنِّمُ أَيُّهَا الْمُعْطِي الْحَيَاةِ: الْمَجْدُ لِقِيَامَتِكَ أَيُّهَا الْمَسِيحُ إِلهَنَا!',
'published'),

('resurrection-tone-6-theotokion', 'theotokion', 'Theotókion — Tom 6', 'الثيوتوكي - اللحن السادس', 6, 'resurrection',
'Ó intercessora fervorosa, Mãe de Deus, porta do céu, recebe as orações dos que te imploram, e concede-lhes a grande misericórdia.',
'أَيَّتُهَا الشَّفِيعَةُ الْحَارَّةُ يَا وَالِدَةَ اللهِ، يَا بَابَ السَّمَاءِ، اِقْبَلِي صَلَوَاتِ الَّذِينَ يَتَضَرَّعُونَ إِلَيْكِ، وَامْنَحِيهِمُ الرَّحْمَةَ الْعَظِيمَةَ.',
'published'),

-- Tone 7
('resurrection-tone-7-troparion', 'troparion', 'Tropário da Ressurreição — Tom 7', 'طروباري القيامة - اللحن السابع', 7, 'resurrection',
'Destruíste com a tua cruz a morte, abriste ao ladrão o paraíso, transformaste o pranto das portadoras do mirra em alegria, e ordenaste aos teus apóstolos que pregassem que tu ressuscitaste, ó Cristo Deus, concedendo ao mundo a grande misericórdia.',
'حَطَّمْتَ بِصَلِيبِكَ الْمَوْتَ، وَفَتَحْتَ لِلِّصِّ الْفِرْدَوْسَ، وَحَوَّلْتَ بُكَاءَ حَامِلاَتِ الطِّيبِ إِلَى فَرَحٍ، وَأَمَرْتَ رُسُلَكَ أَنْ يُبَشِّرُوا بِأَنَّكَ قُمْتَ أَيُّهَا الْمَسِيحُ إِلهُنَا، مُعْطِيًا الْعَالَمَ الرَّحْمَةَ الْعَظِيمَةَ.',
'published'),

('resurrection-tone-7-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 7', 'القنداق - اللحن السابع', 7, 'resurrection',
'Não serás mais retido pelo sepulcro, ó Cristo, pois ressuscitaste ao terceiro dia, e levantaste conosco. Por isso cantamos: Glória ao teu poder, ó Senhor, glória a ti!',
'لَنْ يُمْسِكَكَ الْقَبْرُ بَعْدُ يَا الْمَسِيحُ، فَإِنَّكَ قُمْتَ فِي الْيَوْمِ الثَّالِثِ، وَأَقَمْتَنَا مَعَكَ. لِذَلِكَ نُرَنِّمُ: الْمَجْدُ لِقُوَّتِكَ يَا رَبُّ، الْمَجْدُ لَكَ!',
'published'),

('resurrection-tone-7-theotokion', 'theotokion', 'Theotókion — Tom 7', 'الثيوتوكي - اللحن السابع', 7, 'resurrection',
'Ó Mãe de Deus, que concebeste sem semente e deste à luz o Salvador, salva os que te louvam.',
'يَا وَالِدَةَ اللهِ، يَا مَنْ حَبِلْتِ بِلاَ زَرْعٍ وَأَلَدْتِ الْمُخَلِّصَ، خَلِّصِي الَّذِينَ يُسَبِّحُونَكِ.',
'published'),

-- Tone 8
('resurrection-tone-8-troparion', 'troparion', 'Tropário da Ressurreição — Tom 8', 'طروباري القيامة - اللحن الثامن', 8, 'resurrection',
'Do alto desceste, ó Misericordioso, e aceitaste sepultura de três dias para nos livrar dos sofrimentos. Tu és nossa vida e ressurreição, ó Senhor, glória a ti!',
'نَزَلْتَ مِنَ الْعُلَى أَيُّهَا الرَّحِيمُ، وَقَبِلْتَ الْقَبْرَ ثَلاَثَةَ أَيَّامٍ لِتُخَلِّصَنَا مِنَ الآلاَمِ. أَنْتَ حَيَاتُنَا وَقِيَامَتُنَا يَا رَبُّ، الْمَجْدُ لَكَ.',
'published'),

('resurrection-tone-8-kontakion', 'kontakion', 'Kondákion da Ressurreição — Tom 8', 'القنداق - اللحن الثامن', 8, 'resurrection',
'Ressuscitando do sepulcro, ressuscitaste os mortos e vivificaste Adão. E Eva exulta na tua ressurreição, e os confins do mundo te celebram, ó Cristo, que nos concedeste a ressurreição dos mortos.',
'إِذْ قُمْتَ مِنَ الْقَبْرِ، أَقَمْتَ الأَمْوَاتَ وَأَحْيَيْتَ آدَمَ. وَحَوَّاءُ تَبْتَهِجُ بِقِيَامَتِكَ، وَأَقَاصِي الأَرْضِ تُسَبِّحُكَ يَا مَسِيحُ، الَّذِي مَنَحْتَنَا قِيَامَةَ الأَمْوَاتِ.',
'published'),

('resurrection-tone-8-theotokion', 'theotokion', 'Theotókion — Tom 8', 'الثيوتوكي - اللحن الثامن', 8, 'resurrection',
'Ó Mãe de Deus, que deste à luz o Verbo eterno e criador de todas as coisas, livra-nos dos laços do inimigo, e salva nossas almas.',
'يَا وَالِدَةَ اللهِ، يَا مَنْ وَلَدْتِ الْكَلِمَةَ الأَزَلِيَّ خَالِقَ كُلِّ شَيْءٍ، خَلِّصِينَا مِنْ أَشْرَاكِ الْعَدُوِّ، وَانْجِي نُفُوسَنَا.',
'published');
