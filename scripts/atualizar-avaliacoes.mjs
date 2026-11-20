// Busca na loja da Steam a nota do Metacritic e o total de recomendações de cada jogo do catálogo
// e grava em js/data/avaliacoes.js. Dado real, com a data da consulta. Jogo sem nota fica sem nota.
// Uso: node scripts/atualizar-avaliacoes.mjs
import { writeFileSync } from 'node:fs';
import { JOGOS } from '../js/games.js';

const dados = {};
for (const j of JOGOS.filter((x) => x.steam)) {
  try {
    let d;
    for (let tentativa = 0; tentativa < 3 && !d; tentativa++) {
      if (tentativa) await new Promise((ok) => setTimeout(ok, 3000));
      try { const r = await fetch(`https://store.steampowered.com/api/appdetails?appids=${j.steam}&filters=metacritic,recommendations`); d = (await r.json())[j.steam]?.data; } catch { /* tenta de novo */ }
    }
    if (!d) throw new Error('sem resposta');
    const item = {};
    if (d?.metacritic?.score) item.metacritic = d.metacritic.score;
    if (d?.recommendations?.total) item.recomendacoes = d.recommendations.total;
    if (Object.keys(item).length) dados[j.steam] = item;
  } catch {
    console.warn(`sem dados agora: ${j.nome} (${j.steam})`);
  }
  await new Promise((ok) => setTimeout(ok, 400));
}
const hoje = new Date().toISOString().slice(0, 10);
const linhas = Object.entries(dados).map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`).join(',\n');
writeFileSync('js/data/avaliacoes.js', `// Nota do Metacritic e total de recomendações na Steam, consultados em ${hoje}
// por scripts/atualizar-avaliacoes.mjs (loja da Steam). Dado real; jogo sem nota fica sem nota.
export const CONSULTA = '${hoje}';
export const AVALIACOES = {
${linhas}
};
`);
console.log(Object.keys(dados).length, 'jogos com dados;', Object.values(dados).filter((x) => x.metacritic).length, 'com Metacritic');
