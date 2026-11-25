// curiosidades.js — base pesquisada de curiosidades do Almanaque (escrita à mão, cada uma com fonte).
// Curiosidade nova = um item a mais na lista. Os números que mudam com o tempo (vendas, prêmios, recordes)
// NÃO ficam aqui: vêm de js/data/almanaque.json, que o robô atualiza toda semana.
const W = (pagina) => `https://en.wikipedia.org/wiki/${pagina}`;

export const CURIOSIDADES = [
  { id: 'tennis-for-two', titulo: 'Um dos primeiros videogames', texto: 'Tennis for Two foi criado em 1958 num laboratório dos EUA e rodava num osciloscópio, uma tela de medir sinais elétricos.', fonte: W('Tennis_for_Two') },
  { id: 'spacewar', titulo: 'Jogo de computador pioneiro', texto: 'Spacewar! foi programado em 1962 por estudantes do MIT, num computador do tamanho de uma geladeira.', fonte: W('Spacewar!') },
  { id: 'pong', titulo: 'O primeiro sucesso dos fliperamas', texto: 'Pong, da Atari, chegou em 1972 e foi o primeiro videogame de grande sucesso comercial.', fonte: W('Pong') },
  { id: 'nintendo-1889', titulo: 'Mais velha que o videogame', texto: 'A Nintendo foi fundada em 1889, no Japão, fabricando cartas de baralho hanafuda.', fonte: W('Nintendo') },
  { id: 'jumpman', titulo: 'Antes de ser Mario', texto: 'Na primeira aparição, em Donkey Kong (1981), o Mario se chamava "Jumpman" e era carpinteiro, não encanador.', fonte: W('Mario') },
  { id: 'puck-man', titulo: 'O nome original do Pac-Man', texto: 'No Japão, o Pac-Man foi lançado como "Puck Man". O nome mudou no ocidente.', fonte: W('Pac-Man') },
  { id: 'pacman-perfeito', titulo: 'A pontuação perfeita', texto: 'A maior pontuação possível em Pac-Man é 3.333.360 pontos: comer tudo, em todas as 255 fases, sem perder uma vida.', fonte: W('Pac-Man') },
  { id: 'adventure-easter-egg', titulo: 'O primeiro easter egg famoso', texto: 'Em Adventure (1980), do Atari 2600, o programador Warren Robinett escondeu o próprio nome numa sala secreta, porque a Atari não dava crédito aos criadores.', fonte: W('Adventure_(1980_video_game)') },
  { id: 'et-enterrado', titulo: 'Cartuchos enterrados no deserto', texto: 'Em 1983, a Atari enterrou milhares de cartuchos encalhados, incluindo o famoso E.T., num aterro no Novo México. Eles foram desenterrados em 2014.', fonte: W('Atari_video_game_burial') },
  { id: 'tetris-urss', titulo: 'Um jogo da União Soviética', texto: 'Tetris foi criado em 1984 por Alexey Pajitnov, num centro de pesquisa da Academia de Ciências da União Soviética, em Moscou.', fonte: W('Tetris') },
  { id: 'sf2-combo', titulo: 'O combo nasceu de um bug', texto: 'Os combos de Street Fighter II surgiram de uma falha no tempo dos golpes. Os criadores acharam que era difícil demais de usar e deixaram no jogo.', fonte: W('Combo_(video_games)') },
  { id: 'doom-shareware', titulo: 'De graça para começar', texto: 'Doom (1993) foi distribuído como shareware: o primeiro episódio era grátis, e quem gostava pagava pelo resto.', fonte: W('Doom_(1993_video_game)') },
  { id: 'missingno', titulo: 'O Pokémon que não devia existir', texto: 'MissingNo. é um "Pokémon" de falha em Pokémon Red e Blue que aparece por um bug, e ficou famoso por duplicar itens.', fonte: W('MissingNo.') },
  { id: 'snake-nokia', titulo: 'O jogo no bolso de todo mundo', texto: 'Snake veio de fábrica no celular Nokia 6110, de 1997, e virou um dos jogos mais jogados do mundo.', fonte: W('Snake_(video_game_genre)') },
  { id: 'duke-forever', titulo: 'Catorze anos de espera', texto: 'Duke Nukem Forever foi anunciado em 1997 e só saiu em 2011, depois de 14 anos de desenvolvimento.', fonte: W('Duke_Nukem_Forever') },
  { id: 'minecraft-microsoft', titulo: 'Uma compra bilionária', texto: 'Em 2014, a Microsoft comprou a Mojang, criadora do Minecraft, por 2,5 bilhões de dólares.', fonte: W('Mojang_Studios') },
  { id: 'gta5-bilhao', titulo: 'Um bilhão em três dias', texto: 'Grand Theft Auto V arrecadou 1 bilhão de dólares nos três primeiros dias de vendas, em 2013.', fonte: W('Grand_Theft_Auto_V') },
  { id: 'ps2-recorde', titulo: 'O console mais vendido', texto: 'O PlayStation 2, de 2000, é o console mais vendido da história, com mais de 155 milhões de unidades.', fonte: W('PlayStation_2') },
  { id: 'game-boy', titulo: 'Tetris vendeu o Game Boy', texto: 'O Game Boy (1989) vinha com Tetris na caixa nos EUA, e a dupla ajudou o portátil a virar febre mundial.', fonte: W('Game_Boy') },
  { id: 'konami-code', titulo: 'O código mais famoso', texto: 'O Código Konami (cima, cima, baixo, baixo, esquerda, direita, esquerda, direita, B, A) apareceu em Gradius, em 1986, e virou piada interna em centenas de jogos e sites.', fonte: W('Konami_Code') },
  { id: 'sonic-mario', titulo: 'Criado para enfrentar o Mario', texto: 'Sonic foi criado pela Sega em 1991 para ser um mascote rápido e moderno, capaz de competir com o Mario da Nintendo.', fonte: W('Sonic_the_Hedgehog_(character)') },
  { id: 'zelda-nome', titulo: 'A princesa ganhou o nome', texto: 'A série chama "The Legend of Zelda", mas o herói é o Link. Zelda é a princesa.', fonte: W('The_Legend_of_Zelda') },
  { id: 'tga-2014', titulo: 'O Oscar dos games é novo', texto: 'O The Game Awards existe desde 2014. O primeiro Jogo do Ano foi Dragon Age: Inquisition.', fonte: W('The_Game_Awards_2014') },
  { id: 'speedrun-sm64', titulo: 'Zerar sem pegar as estrelas', texto: 'Em speedruns de Super Mario 64, os jogadores zeram o jogo com 0 das 120 estrelas, usando um truque de andar para trás que acelera o Mario.', fonte: W('Super_Mario_64') },
];
