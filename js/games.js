// games.js — catálogo de jogos do Checkpoint (equivalente ao movies.js do enunciado).
// Usado pelo "Roda no meu PC?", pelo Recomendador e como sugestão rápida no Diário.
// Requisitos aproximados das páginas oficiais; horas = campanha principal aproximada.

const I = (m) => 'Intel Core ' + m;
const A = (m) => 'AMD Ryzen ' + m;
const N = (m) => 'NVIDIA GeForce ' + m;
const R = (m) => 'AMD Radeon ' + m;

function jogo(id, nome, ano, generos, etiquetas, horas, plataformas, steam, wiki, min, rec) {
  return {
    id, nome, ano, generos, etiquetas, horas, plataformas, steam, wiki,
    requisitos: min ? { min: { cpu: min[0], gpu: min[1], ram: min[2] }, rec: { cpu: rec[0], gpu: rec[1], ram: rec[2] } } : null
  };
}

const PC = 'PC', PS = 'PlayStation', XB = 'Xbox', SW = 'Switch', MOB = 'Celular';

export const JOGOS = [
  jogo('hollow-knight', 'Hollow Knight', 2017, ['Metroidvania', 'Ação'], ['dificil', 'exploracao', 'indie', 'atmosfera', 'solo', 'longo'], 27, [PC, PS, XB, SW], 367520, 'Hollow Knight',
    [I('i3-2100'), N('GTX 750 Ti'), 4], [I('i5-4460'), N('GTX 960'), 8]),
  jogo('silksong', 'Hollow Knight: Silksong', 2025, ['Metroidvania', 'Ação'], ['dificil', 'exploracao', 'indie', 'atmosfera', 'solo', 'longo'], 30, [PC, PS, XB, SW], 1030300, 'Hollow Knight: Silksong',
    [I('i3-4130'), N('GTX 960'), 4], [I('i5-6600K'), N('GTX 1060 6GB'), 8]),
  jogo('celeste', 'Celeste', 2018, ['Plataforma'], ['dificil', 'historia', 'indie', 'curto', 'solo', 'emocionante'], 9, [PC, PS, XB, SW], 504230, 'Celeste (video game)',
    [I('i3-2100'), 'Intel UHD Graphics 620', 2], [I('i3-4130'), N('GT 1030'), 4]),
  jogo('hades', 'Hades', 2020, ['Roguelike', 'Ação'], ['rogue', 'acao', 'historia', 'indie', 'solo', 'partidas-curtas'], 22, [PC, PS, XB, SW], 1145360, 'Hades (video game)',
    [I('i3-2100'), 'Intel UHD Graphics 620', 4], [I('i5-4460'), N('GTX 950'), 8]),
  jogo('hades-2', 'Hades II', 2025, ['Roguelike', 'Ação'], ['rogue', 'acao', 'historia', 'indie', 'solo', 'partidas-curtas'], 30, [PC, SW], 1145350, 'Hades II',
    [I('i5-4460'), N('GTX 960'), 8], [I('i5-8400'), N('GTX 1060 6GB'), 16]),
  jogo('stardew-valley', 'Stardew Valley', 2016, ['Simulação', 'RPG'], ['relaxante', 'coop', 'indie', 'longo', 'fazenda', 'aconchegante'], 53, [PC, PS, XB, SW, MOB], 413150, 'Stardew Valley',
    [I('i3-2100'), 'Intel UHD Graphics 620', 2], [I('i3-4130'), N('GT 1030'), 4]),
  jogo('terraria', 'Terraria', 2011, ['Sandbox', 'Ação'], ['sandbox', 'coop', 'exploracao', 'longo', 'construcao'], 50, [PC, PS, XB, SW, MOB], 105600, 'Terraria',
    [I('i3-2100'), 'Intel UHD Graphics 620', 4], [I('i3-4130'), N('GT 1030'), 4]),
  jogo('minecraft', 'Minecraft', 2011, ['Sandbox', 'Sobrevivência'], ['sandbox', 'coop', 'relaxante', 'construcao', 'exploracao', 'longo'], 100, [PC, PS, XB, SW, MOB], null, 'Minecraft',
    [I('i3-4130'), 'Intel UHD Graphics 620', 4], [I('i5-4590'), N('GTX 960'), 8]),
  jogo('witcher-3', 'The Witcher 3: Wild Hunt', 2015, ['RPG', 'Mundo aberto'], ['historia', 'mundo-aberto', 'rpg', 'longo', 'solo', 'escolhas'], 52, [PC, PS, XB, SW], 292030, 'The Witcher 3: Wild Hunt',
    [I('i5-2500K'), N('GTX 960'), 6], [I('i7-4770K'), N('GTX 1070'), 8]),
  jogo('rdr2', 'Red Dead Redemption 2', 2018, ['Ação', 'Mundo aberto'], ['historia', 'mundo-aberto', 'longo', 'solo', 'cinematografico', 'faroeste'], 50, [PC, PS, XB], 1174180, 'Red Dead Redemption 2',
    [I('i5-2500K'), N('GTX 960'), 8], [I('i7-4770K'), N('GTX 1060 6GB'), 12]),
  jogo('gta-v', 'Grand Theft Auto V', 2013, ['Ação', 'Mundo aberto'], ['mundo-aberto', 'acao', 'multiplayer', 'historia', 'engracado', 'longo'], 32, [PC, PS, XB], 271590, 'Grand Theft Auto V',
    [I('i5-2500K'), N('GTX 750 Ti'), 4], [I('i5-4590'), N('GTX 960'), 8]),
  jogo('elden-ring', 'Elden Ring', 2022, ['RPG', 'Ação'], ['dificil', 'mundo-aberto', 'exploracao', 'rpg', 'longo', 'coop'], 58, [PC, PS, XB], 1245620, 'Elden Ring',
    [I('i5-8400'), N('GTX 1060 3GB'), 12], [I('i7-8700K'), N('GTX 1070'), 16]),
  jogo('cyberpunk-2077', 'Cyberpunk 2077', 2020, ['RPG', 'Mundo aberto'], ['historia', 'mundo-aberto', 'rpg', 'tiro', 'longo', 'cinematografico'], 25, [PC, PS, XB], 1091500, 'Cyberpunk 2077',
    [I('i7-6700K'), N('GTX 1060 6GB'), 12], [I('i7-12700K'), N('RTX 2060'), 16]),
  jogo('portal-2', 'Portal 2', 2011, ['Quebra-cabeça'], ['puzzle', 'coop', 'engracado', 'curto', 'historia'], 9, [PC, PS, XB, SW], 620, 'Portal 2',
    [I('i3-2100'), 'Intel UHD Graphics 620', 2], [I('i3-4130'), N('GT 1030'), 4]),
  jogo('skyrim', 'The Elder Scrolls V: Skyrim', 2011, ['RPG', 'Mundo aberto'], ['mundo-aberto', 'rpg', 'exploracao', 'longo', 'solo', 'fantasia'], 34, [PC, PS, XB, SW], 489830, 'The Elder Scrolls V: Skyrim',
    [I('i5-2500K'), N('GTX 750 Ti'), 8], [I('i5-4590'), N('GTX 960'), 8]),
  jogo('doom-eternal', 'DOOM Eternal', 2020, ['Tiro', 'Ação'], ['tiro', 'acao', 'adrenalina', 'solo', 'curto'], 14, [PC, PS, XB, SW], 782330, 'Doom Eternal',
    [I('i5-4590'), N('GTX 1050 Ti'), 8], [I('i7-6700K'), N('GTX 1060 6GB'), 8]),
  jogo('sekiro', 'Sekiro: Shadows Die Twice', 2019, ['Ação'], ['dificil', 'acao', 'solo', 'samurai'], 30, [PC, PS, XB], 814380, 'Sekiro: Shadows Die Twice',
    [I('i3-2100'), N('GTX 960'), 4], [I('i5-2500K'), N('GTX 970'), 8]),
  jogo('dark-souls-3', 'Dark Souls III', 2016, ['RPG', 'Ação'], ['dificil', 'rpg', 'atmosfera', 'coop', 'fantasia'], 32, [PC, PS, XB], 374320, 'Dark Souls III',
    [I('i3-2100'), N('GTX 750 Ti'), 8], [I('i7-4770K'), N('GTX 970'), 8]),
  jogo('undertale', 'Undertale', 2015, ['RPG'], ['historia', 'indie', 'curto', 'engracado', 'escolhas', 'emocionante'], 7, [PC, PS, SW], 391540, 'Undertale',
    [I('i3-2100'), 'Intel UHD Graphics 620', 2], [I('i3-2100'), 'Intel UHD Graphics 620', 2]),
  jogo('cuphead', 'Cuphead', 2017, ['Plataforma', 'Ação'], ['dificil', 'coop', 'indie', 'arte-bonita', 'curto'], 11, [PC, PS, XB, SW], 268910, 'Cuphead',
    [I('i3-2100'), N('GT 1030'), 3], [I('i5-2500K'), N('GTX 960'), 4]),
  jogo('dead-cells', 'Dead Cells', 2018, ['Roguelike', 'Ação'], ['rogue', 'acao', 'dificil', 'indie', 'partidas-curtas'], 18, [PC, PS, XB, SW, MOB], 588650, 'Dead Cells',
    [I('i3-2100'), 'Intel UHD Graphics 620', 2], [I('i5-2500K'), N('GTX 750 Ti'), 4]),
  jogo('ori-wotw', 'Ori and the Will of the Wisps', 2020, ['Metroidvania', 'Plataforma'], ['emocionante', 'arte-bonita', 'exploracao', 'indie', 'solo'], 12, [PC, XB, SW], 1057090, 'Ori and the Will of the Wisps',
    [I('i5-4460'), N('GTX 950'), 8], [I('i5-8400'), N('GTX 1060 6GB'), 8]),
  jogo('outer-wilds', 'Outer Wilds', 2019, ['Exploração', 'Mistério'], ['exploracao', 'misterio', 'indie', 'historia', 'solo', 'espaco'], 16, [PC, PS, XB, SW], 753640, 'Outer Wilds',
    [I('i5-2500K'), N('GTX 750 Ti'), 6], [I('i5-8400'), N('GTX 1060 6GB'), 8]),
  jogo('disco-elysium', 'Disco Elysium', 2019, ['RPG'], ['historia', 'escolhas', 'rpg', 'solo', 'misterio', 'leitura'], 22, [PC, PS, XB, SW], 632470, 'Disco Elysium',
    [I('i5-2500K'), N('GTX 750 Ti'), 4], [I('i7-4770K'), N('GTX 1060 6GB'), 8]),
  jogo('baldurs-gate-3', "Baldur's Gate 3", 2023, ['RPG'], ['historia', 'escolhas', 'rpg', 'coop', 'longo', 'estrategia', 'fantasia'], 75, [PC, PS, XB], 1086940, "Baldur's Gate 3",
    [I('i5-4590'), N('GTX 970'), 8], [I('i7-8700K'), N('RTX 2060'), 16]),
  jogo('god-of-war', 'God of War', 2018, ['Ação', 'Aventura'], ['historia', 'acao', 'cinematografico', 'solo', 'emocionante'], 21, [PC, PS], 1593500, 'God of War (2018 video game)',
    [I('i5-2500K'), N('GTX 960'), 8], [I('i5-6600K'), N('GTX 1060 6GB'), 8]),
  jogo('spider-man', "Marvel's Spider-Man Remastered", 2022, ['Ação', 'Mundo aberto'], ['acao', 'mundo-aberto', 'historia', 'heroi', 'solo', 'cinematografico'], 17, [PC, PS], 1817070, "Marvel's Spider-Man Remastered",
    [I('i3-4130'), N('GTX 950'), 8], [I('i5-4590'), N('GTX 1060 6GB'), 16]),
  jogo('forza-horizon-5', 'Forza Horizon 5', 2021, ['Corrida'], ['corrida', 'mundo-aberto', 'multiplayer', 'relaxante', 'carros'], 16, [PC, XB, PS], 1551360, 'Forza Horizon 5',
    [I('i5-4460'), N('GTX 970'), 8], [I('i5-8400'), N('GTX 1070'), 16]),
  jogo('it-takes-two', 'It Takes Two', 2021, ['Aventura', 'Plataforma'], ['coop', 'historia', 'engracado', 'casal', 'criativo'], 13, [PC, PS, XB, SW], 1426210, 'It Takes Two (video game)',
    [I('i3-2100'), N('GTX 950'), 8], [I('i5-3570K'), N('GTX 970'), 16]),
  jogo('split-fiction', 'Split Fiction', 2025, ['Aventura', 'Ação'], ['coop', 'historia', 'criativo', 'casal', 'cinematografico'], 14, [PC, PS, XB, SW], 2001120, 'Split Fiction',
    [I('i5-8400'), N('GTX 1070'), 16], [I('i7-12700K'), N('RTX 2070'), 16]),
  jogo('among-us', 'Among Us', 2018, ['Festa', 'Dedução'], ['multiplayer', 'engracado', 'amigos', 'partidas-curtas', 'leve'], 2, [PC, PS, XB, SW, MOB], 945360, 'Among Us',
    ['Intel Core i3-2100', 'Intel UHD Graphics 620', 1], ['Intel Core i3-2100', 'Intel UHD Graphics 620', 2]),
  jogo('rocket-league', 'Rocket League', 2015, ['Esporte', 'Corrida'], ['competitivo', 'multiplayer', 'partidas-curtas', 'amigos', 'carros'], 10, [PC, PS, XB, SW], 252950, 'Rocket League',
    [I('i3-2100'), N('GT 1030'), 4], [I('i5-4460'), N('GTX 1060 3GB'), 8]),
  jogo('cs2', 'Counter-Strike 2', 2023, ['Tiro'], ['competitivo', 'tiro', 'multiplayer', 'amigos', 'partidas-curtas'], 10, [PC], 730, 'Counter-Strike 2',
    [I('i5-6600K'), N('GTX 1050 Ti'), 8], [I('i5-8400'), N('GTX 1060 6GB'), 16]),
  jogo('apex-legends', 'Apex Legends', 2019, ['Tiro', 'Battle royale'], ['competitivo', 'tiro', 'multiplayer', 'amigos', 'gratis'], 10, [PC, PS, XB, SW], 1172470, 'Apex Legends',
    [I('i3-4130'), N('GTX 960'), 6], [I('i5-4460'), N('GTX 970'), 8]),
  jogo('valheim', 'Valheim', 2021, ['Sobrevivência', 'Sandbox'], ['coop', 'sobrevivencia', 'exploracao', 'construcao', 'vikings', 'longo'], 60, [PC, XB], 892970, 'Valheim',
    [I('i5-3570K'), N('GTX 950'), 8], [I('i5-6600K'), N('GTX 970'), 16]),
  jogo('subnautica', 'Subnautica', 2018, ['Sobrevivência', 'Exploração'], ['exploracao', 'sobrevivencia', 'atmosfera', 'misterio', 'solo', 'oceano'], 30, [PC, PS, XB, SW], 264710, 'Subnautica',
    [I('i5-2500K'), N('GTX 750 Ti'), 4], [I('i5-4460'), N('GTX 960'), 8]),
  jogo('slay-the-spire', 'Slay the Spire', 2019, ['Roguelike', 'Cartas'], ['rogue', 'estrategia', 'cartas', 'indie', 'partidas-curtas', 'solo'], 40, [PC, PS, XB, SW, MOB], 646570, 'Slay the Spire',
    [I('i3-2100'), 'Intel UHD Graphics 620', 2], [I('i3-4130'), 'Intel UHD Graphics 620', 4]),
  jogo('balatro', 'Balatro', 2024, ['Roguelike', 'Cartas'], ['rogue', 'cartas', 'estrategia', 'indie', 'partidas-curtas', 'viciante'], 20, [PC, PS, XB, SW, MOB], 2379780, 'Balatro (video game)',
    [I('i3-2100'), 'Intel UHD Graphics 620', 1], [I('i3-4130'), 'Intel UHD Graphics 620', 2]),
  jogo('vampire-survivors', 'Vampire Survivors', 2022, ['Roguelike', 'Ação'], ['rogue', 'partidas-curtas', 'viciante', 'leve', 'indie'], 15, [PC, XB, SW, MOB, PS], 1794680, 'Vampire Survivors',
    [I('i3-2100'), 'Intel UHD Graphics 620', 4], [I('i3-4130'), N('GT 1030'), 4]),
  jogo('lethal-company', 'Lethal Company', 2023, ['Terror', 'Cooperativo'], ['terror', 'coop', 'engracado', 'amigos', 'indie', 'partidas-curtas'], 10, [PC], 1966720, 'Lethal Company',
    [I('i5-4460'), N('GTX 1050'), 8], [I('i5-8400'), N('GTX 1060 6GB'), 16]),
  jogo('phasmophobia', 'Phasmophobia', 2020, ['Terror', 'Cooperativo'], ['terror', 'coop', 'amigos', 'misterio', 'partidas-curtas'], 15, [PC, PS, XB], 739630, 'Phasmophobia',
    [I('i5-4590'), N('GTX 970'), 8], [I('i5-8400'), N('GTX 1060 6GB'), 16]),
  jogo('re4-remake', 'Resident Evil 4', 2023, ['Terror', 'Ação'], ['terror', 'acao', 'historia', 'solo', 'tiro'], 16, [PC, PS, XB], 2050650, 'Resident Evil 4 (2023 video game)',
    [A('3 1200'), N('GTX 1050 Ti'), 8], [A('5 3600'), N('GTX 1070'), 16]),
  jogo('re2-remake', 'Resident Evil 2', 2019, ['Terror', 'Ação'], ['terror', 'historia', 'solo', 'curto', 'tiro'], 9, [PC, PS, XB], 883710, 'Resident Evil 2 (2019 video game)',
    [I('i5-4460'), N('GTX 960'), 8], [I('i7-4770K'), N('GTX 1060 6GB'), 8]),
  jogo('monster-hunter-world', 'Monster Hunter: World', 2018, ['Ação', 'RPG'], ['coop', 'acao', 'longo', 'dificil', 'cacada'], 47, [PC, PS, XB], 582010, 'Monster Hunter: World',
    [I('i5-4460'), N('GTX 960'), 8], [I('i7-4770K'), N('GTX 1060 3GB'), 8]),
  jogo('sea-of-thieves', 'Sea of Thieves', 2018, ['Aventura', 'Multijogador'], ['coop', 'amigos', 'engracado', 'exploracao', 'piratas'], 25, [PC, XB, PS], 1172620, 'Sea of Thieves',
    [I('i3-4130'), N('GTX 750 Ti'), 4], [I('i5-4590'), N('GTX 1050 Ti'), 8]),
  jogo('deep-rock-galactic', 'Deep Rock Galactic', 2020, ['Tiro', 'Cooperativo'], ['coop', 'tiro', 'amigos', 'engracado', 'partidas-curtas'], 30, [PC, PS, XB], 548430, 'Deep Rock Galactic',
    [I('i5-2500K'), N('GTX 960'), 6], [I('i7-4770K'), N('GTX 1060 6GB'), 8]),
  jogo('cult-of-the-lamb', 'Cult of the Lamb', 2022, ['Roguelike', 'Simulação'], ['rogue', 'engracado', 'indie', 'arte-bonita', 'gestao'], 20, [PC, PS, XB, SW], 1313140, 'Cult of the Lamb',
    [I('i3-2100'), N('GT 1030'), 4], [I('i5-3570K'), N('GTX 1050'), 8]),
  jogo('inscryption', 'Inscryption', 2021, ['Cartas', 'Terror'], ['cartas', 'misterio', 'terror', 'indie', 'curto', 'estrategia'], 12, [PC, PS, XB, SW], 1092790, 'Inscryption',
    [I('i5-2500K'), N('GTX 750 Ti'), 4], [I('i5-4460'), N('GTX 960'), 8]),
  jogo('hi-fi-rush', 'Hi-Fi Rush', 2023, ['Ação', 'Ritmo'], ['acao', 'musica', 'engracado', 'arte-bonita', 'curto', 'solo'], 11, [PC, XB, PS], 1817230, 'Hi-Fi Rush',
    [I('i5-8400'), N('GTX 1050 Ti'), 8], [I('i7-8700K'), N('GTX 1660 Super'), 16]),
  jogo('sifu', 'Sifu', 2022, ['Luta', 'Ação'], ['dificil', 'acao', 'luta', 'solo', 'curto'], 9, [PC, PS, XB, SW], 2138710, 'Sifu',
    [I('i3-4130'), N('GTX 950'), 8], [I('i5-4460'), N('GTX 970'), 8]),
  jogo('persona-5-royal', 'Persona 5 Royal', 2022, ['RPG'], ['historia', 'rpg', 'longo', 'estilo', 'solo', 'anime'], 100, [PC, PS, XB, SW], 1687950, 'Persona 5 Royal',
    [I('i5-2500K'), N('GTX 750 Ti'), 8], [I('i7-4770K'), N('GTX 960'), 8]),
  jogo('ghost-of-tsushima', 'Ghost of Tsushima', 2024, ['Ação', 'Mundo aberto'], ['mundo-aberto', 'acao', 'historia', 'arte-bonita', 'samurai', 'solo'], 25, [PC, PS], 2215430, 'Ghost of Tsushima',
    [I('i3-8100'), N('GTX 960'), 8], [I('i5-8400'), N('RTX 2060'), 16]),
  jogo('helldivers-2', 'Helldivers 2', 2024, ['Tiro', 'Cooperativo'], ['coop', 'tiro', 'amigos', 'engracado', 'caotico'], 30, [PC, PS, XB], 553850, 'Helldivers 2',
    [I('i7-4770K'), N('GTX 1050 Ti'), 8], [I('i7-8700K'), N('RTX 2060'), 16]),
  jogo('black-myth-wukong', 'Black Myth: Wukong', 2024, ['Ação', 'RPG'], ['dificil', 'acao', 'cinematografico', 'solo', 'mitologia'], 38, [PC, PS], 2358720, 'Black Myth: Wukong',
    [I('i5-8400'), N('GTX 1060 6GB'), 16], [I('i7-10700K'), N('RTX 2060'), 16]),
  jogo('stray', 'Stray', 2022, ['Aventura'], ['relaxante', 'curto', 'exploracao', 'gato', 'atmosfera', 'solo'], 5, [PC, PS, XB, SW], 1332010, 'Stray (video game)',
    [I('i5-2500K'), N('GTX 750 Ti'), 8], [I('i5-8400'), N('GTX 970'), 8]),
  jogo('hogwarts-legacy', 'Hogwarts Legacy', 2023, ['RPG', 'Mundo aberto'], ['mundo-aberto', 'rpg', 'magia', 'exploracao', 'solo', 'longo'], 26, [PC, PS, XB, SW], 990080, 'Hogwarts Legacy',
    [I('i5-6600K'), N('GTX 960'), 16], [I('i7-8700K'), N('GTX 1080'), 16]),
  jogo('palworld', 'Palworld', 2024, ['Sobrevivência', 'Sandbox'], ['coop', 'sobrevivencia', 'construcao', 'engracado', 'criaturas', 'longo'], 40, [PC, XB, PS], 1623730, 'Palworld',
    [I('i5-6600K'), N('GTX 1050'), 16], [I('i7-8700K'), N('RTX 2070'), 32]),
  jogo('left-4-dead-2', 'Left 4 Dead 2', 2009, ['Tiro', 'Cooperativo'], ['coop', 'tiro', 'zumbis', 'amigos', 'partidas-curtas'], 10, [PC, XB], 550, 'Left 4 Dead 2',
    [I('i3-2100'), 'Intel UHD Graphics 620', 2], [I('i3-2100'), N('GT 1030'), 4]),
  jogo('half-life-2', 'Half-Life 2', 2004, ['Tiro'], ['tiro', 'historia', 'classico', 'solo', 'puzzle'], 13, [PC], 220, 'Half-Life 2',
    [I('i3-2100'), 'Intel UHD Graphics 620', 2], [I('i3-2100'), 'Intel UHD Graphics 620', 2]),
  jogo('tunic', 'Tunic', 2022, ['Aventura', 'Ação'], ['exploracao', 'misterio', 'dificil', 'indie', 'arte-bonita', 'solo'], 12, [PC, PS, XB, SW], 553420, 'Tunic (video game)',
    [I('i5-3570K'), N('GTX 950'), 8], [I('i5-6600K'), N('GTX 1060 3GB'), 8]),
  jogo('a-short-hike', 'A Short Hike', 2019, ['Aventura'], ['relaxante', 'curto', 'aconchegante', 'exploracao', 'indie'], 2, [PC, PS, XB, SW], 1055540, 'A Short Hike',
    [I('i3-2100'), 'Intel UHD Graphics 620', 2], [I('i3-2100'), 'Intel UHD Graphics 620', 4]),
  jogo('unpacking', 'Unpacking', 2021, ['Quebra-cabeça'], ['relaxante', 'curto', 'aconchegante', 'puzzle', 'indie', 'historia'], 4, [PC, PS, XB, SW, MOB], 1135690, 'Unpacking (video game)',
    [I('i3-2100'), 'Intel UHD Graphics 620', 2], [I('i3-4130'), 'Intel UHD Graphics 620', 4]),
  jogo('overcooked-2', 'Overcooked! 2', 2018, ['Festa', 'Cooperativo'], ['coop', 'amigos', 'caotico', 'engracado', 'partidas-curtas', 'leve'], 10, [PC, PS, XB, SW], 728880, 'Overcooked 2',
    [I('i3-2100'), 'Intel UHD Graphics 620', 4], [I('i5-2500K'), N('GTX 750 Ti'), 4]),
  jogo('death-stranding', "Death Stranding Director's Cut", 2022, ['Aventura'], ['historia', 'exploracao', 'cinematografico', 'solo', 'longo', 'diferente'], 40, [PC, PS], 1850570, 'Death Stranding',
    [I('i5-4460'), N('GTX 1050 Ti'), 8], [I('i7-6700K'), N('GTX 1060 6GB'), 8]),
  jogo('zelda-botw', 'The Legend of Zelda: Breath of the Wild', 2017, ['Aventura', 'Mundo aberto'], ['mundo-aberto', 'exploracao', 'solo', 'longo', 'fantasia', 'classico'], 50, [SW], null, 'The Legend of Zelda: Breath of the Wild',
    null, null),
  jogo('mario-odyssey', 'Super Mario Odyssey', 2017, ['Plataforma'], ['plataforma', 'relaxante', 'familia', 'criativo', 'classico'], 12, [SW], null, 'Super Mario Odyssey',
    null, null),
  jogo('fortnite', 'Fortnite', 2017, ['Tiro', 'Battle royale'], ['competitivo', 'multiplayer', 'amigos', 'construcao', 'gratis', 'partidas-curtas'], 10, [PC, PS, XB, SW, MOB], null, 'Fortnite',
    [I('i3-4130'), 'Intel UHD Graphics 620', 8], [I('i5-6600K'), N('GTX 960'), 16])
];

/** Mapa id → jogo. */
export const POR_ID = Object.fromEntries(JOGOS.map((j) => [j.id, j]));

/** Imagens da Steam (capa vertical e "frame" largo) quando o jogo está na loja. */
export function imagens(j) {
  if (!j?.steam) return { capa: null, frame: null };
  const base = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${j.steam}`;
  return { capa: `${base}/library_600x900.jpg`, frame: `${base}/header.jpg` };
}

/** Link para o trailer (busca no YouTube, sempre funciona). */
export function linkTrailer(j) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(j.nome + ' trailer oficial')}`;
}

/** Busca simples por nome no catálogo (sem acento, sem caixa). */
export function normalizar(t) {
  return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function buscarNoCatalogo(termo, lista = JOGOS) {
  const t = normalizar(termo);
  if (!t) return [];
  return lista.filter((j) => normalizar(j.nome).includes(t)).slice(0, 8);
}
