// Tira as capturas de tela do relatório com dados de exemplo (só para as fotos).
// Uso: node scripts/capturas.mjs [url]   (padrão: servidor local na porta 5173)
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] || 'http://localhost:5173/';
const saida = 'relatorio/capturas';
mkdirSync(saida, { recursive: true });
const ano = new Date().getFullYear();
const S = 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/';
const j = (id, nome, app, status, nota, horas, fav, ini, fim, jogoId, plataforma = 'PC') => ({ id, nome, jogoId, capa: `${S}${app}/library_600x900.jpg`, status, nota, horas, plataforma, favorito: fav, inicio: ini, fim, atualizadoEm: `${ini}T12:00:00Z` });
const dados = {
  'diario:jogos': [
    j('1', 'Hades II', 1145350, 'jogando', 4.5, 18, false, `${ano}-10-01`, null, 'hades-2'),
    j('2', 'Elden Ring', 1245620, 'jogando', 4, 80, false, `${ano}-08-01`, null, 'elden-ring'),
    j('3', 'Hollow Knight: Silksong', 1030300, 'jogando', null, 9, false, `${ano}-09-05`, null, 'silksong'),
    j('4', 'Hollow Knight', 367520, 'zerado', 5, 42, true, `${ano}-01-10`, `${ano}-03-02`, 'hollow-knight'),
    j('5', 'Celeste', 504230, 'platinado', 5, 22, true, `${ano}-04-01`, `${ano}-04-20`, 'celeste', 'Nintendo Switch'),
    j('6', 'Outer Wilds', 753640, 'zerado', 5, 20, false, `${ano}-05-01`, `${ano}-05-15`, 'outer-wilds'),
    j('7', 'Cyberpunk 2077', 1091500, 'larguei', 3, 12, false, `${ano}-02-01`, null, 'cyberpunk-2077'),
    j('8', 'Balatro', 2379780, 'quero', null, 0, false, `${ano}-06-01`, null, 'balatro')
  ],
  'speedrun:rotas': [{ id: 'r1', nome: 'Hollow Knight — Any%', jogo: 'Hollow Knight', categoria: { jogoId: 'x', categoriaId: 'y', nome: 'Any%', link: 'https://www.speedrun.com/hk', wr: { tempo: 269340, jogador: 'Fireb0rn' } },
    splits: [{ nome: 'Falso Cavaleiro', pb: 62000, melhor: 61000 }, { nome: 'Hornet', pb: 118000, melhor: 54000 }, { nome: 'Fim', pb: 281500, melhor: 160000 }], pbTotal: 281500, tentativas: 12, concluidas: 5 }],
  'hardware:pcs': [{ id: 'p1', nome: 'Meu PC', cpu: 'Intel Core i5-12400', gpu: 'NVIDIA GeForce RTX 3060', ram: 16 }]
};

const telas = [
  ['01-inicio', 'inicio'], ['02-diario', 'diario'], ['03-speedrun', 'speedrun/cronometro'], ['04-recomps', 'recomps'],
  ['05-roda-no-pc', 'roda-no-pc'], ['06-torneio', 'torneio'], ['07-recomendador', 'recomendador'], ['08-wrapped', 'wrapped']
];

const b = await chromium.launch();
for (const [tema, sufixo] of [['escuro', ''], ['claro', '-claro']]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1.5 });
  await ctx.addInitScript(({ dados, tema }) => {
    localStorage.clear();
    for (const [k, v] of Object.entries(dados)) localStorage.setItem('checkpoint:' + k, JSON.stringify(v));
    localStorage.setItem('checkpoint:pref:tema', JSON.stringify(tema));
  }, { dados, tema });
  const p = await ctx.newPage();
  for (const [nome, rota] of (sufixo ? telas.slice(0, 2) : telas)) {
    await p.goto(base + '#/' + rota, { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(rota === 'recomps' ? 2500 : 900);
    if (rota === 'torneio') {
      await p.fill('input[name="nome"]', 'Copa da sala'); await p.fill('input[name="jogo"]', 'Rocket League');
      await p.fill('textarea[name="jogadores"]', 'Samuel\nArthur\nJoão\nMaria\nLeo\nBia\nCaio\nDuda');
      await p.click('.torneio-form button[type=submit]');
      for (let i = 0; i < 6; i++) { const l = p.locator('.partida:not(.decidida) .lado:not([disabled])').first(); if (await l.count()) await l.click(); }
      await p.waitForTimeout(500);
    }
    if (rota === 'recomendador') { await p.click('[data-valor="desafio"]'); await p.click('#recomendar'); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelector('#sugestoes').scrollIntoView()); }
    if (rota === 'wrapped') { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(900); }
    await p.screenshot({ path: `${saida}/${nome}${sufixo}.png` });
  }
  await ctx.close();
}
// celular
const cel = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await cel.addInitScript((dados) => { localStorage.clear(); for (const [k, v] of Object.entries(dados)) localStorage.setItem('checkpoint:' + k, JSON.stringify(v)); localStorage.setItem('checkpoint:pref:tema', '"escuro"'); }, dados);
const pc = await cel.newPage();
for (const [nome, rota] of [['09-celular-diario', 'diario'], ['10-celular-speedrun', 'speedrun/cronometro']]) {
  await pc.goto(base + '#/' + rota, { waitUntil: 'networkidle' }).catch(() => {});
  await pc.waitForTimeout(900);
  await pc.screenshot({ path: `${saida}/${nome}.png` });
}
await b.close();
console.log('capturas salvas em', saida);
