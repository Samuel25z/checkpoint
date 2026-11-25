// O robô semanal: conversores testados com respostas salvas (sem internet).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { converterPremio, converterJogos, converterVendas, converterMaisJogados, converterLancamentos, lerJsonTolerante, montar } from '../../scripts/atualizar-almanaque.mjs';

const uri = (q) => ({ value: `http://www.wikidata.org/entity/${q}` });
const lit = (v) => ({ value: String(v) });

test('prêmio: vencedor e indicados por ano, vencedor fora da lista de indicados', () => {
  const anos = converterPremio([
    { jogo: uri('Q1'), tipo: lit('v'), ano: lit(2023) }, { jogo: uri('Q1'), tipo: lit('i'), ano: lit(2023) },
    { jogo: uri('Q2'), tipo: lit('i'), ano: lit(2023) }, { jogo: uri('Q3'), tipo: lit('v'), ano: lit(2014) },
    { jogo: uri('Q4'), tipo: lit('i') }, // sem ano: ignorado
  ]);
  assert.deepEqual(anos, [{ ano: 2023, vencedores: ['Q1'], indicados: ['Q2'] }, { ano: 2014, vencedores: ['Q3'], indicados: [] }]);
});

test('jogos: nome do serviço de rótulos, sem códigos Q, ano mais antigo', () => {
  const j = converterJogos([
    { jogo: uri('Q1'), jogoLabel: lit('Clair Obscur: Expedition 33'), steam: lit(1903340), devLabel: lit('Sandfall Interactive'), ano: lit(2025), links: lit(60) },
    { jogo: uri('Q1'), jogoLabel: lit('Clair Obscur: Expedition 33'), ano: lit(2024) },
    { jogo: uri('Q2'), jogoLabel: lit('Q2'), devLabel: lit('Q99') },
  ]);
  assert.deepEqual(j, { Q1: { nome: 'Clair Obscur: Expedition 33', steam: 1903340, estudio: 'Sandfall Interactive', ano: 2024, links: 60 } });
});

test('mais vendidos: lê a tabela da Wikipedia, empate herda a posição, limpa códigos HTML', () => {
  const html = `<p>x</p><table class="wikitable sortable"><tr><th>Rank</th><th>Title</th><th>Sales</th><th>Series</th><th>Platform</th><th>Year</th><th>Dev</th></tr>
    <tr><td>1</td><td><i>Tetris</i><sup>[a]</sup></td><td>520</td><td>Tetris</td><td>Multi</td><td>1988</td><td>Various</td></tr>
    <tr><td><i>Minecraft</i></td><td>425</td><td>Minecraft</td><td>Multi</td><td>2011</td><td>Mojang</td></tr>
    <tr><td>11</td><td>Super Mario Bros.&#8202;</td><td>58</td><td>Super Mario</td><td>NES</td><td>1985</td><td>Nintendo</td></tr>
    <tr><td>8</td><td>Terraria</td><td>70</td><td>None</td><td>Multi</td><td>2011</td><td>Re-Logic</td></tr></table>`;
  const l = converterVendas(html);
  assert.deepEqual(l.map((x) => [x.posicao, x.nome, x.vendas]), [[1, 'Tetris', 520], [1, 'Minecraft', 425], [11, 'Super Mario Bros.', 58], [8, 'Terraria', 70]]);
  assert.equal(l[3].serie, null);
  assert.deepEqual(converterVendas('<p>sem tabela</p>'), []);
});

test('mais jogados: só quem tem nome, posição recontada', () => {
  const l = converterMaisJogados([{ appid: 730, peak_in_game: 100 }, { appid: 431960, peak_in_game: 90 }, { appid: 570, peak_in_game: 80 }], { 730: 'Counter-Strike 2', 570: 'Dota 2' });
  assert.deepEqual(l, [{ posicao: 1, steam: 730, nome: 'Counter-Strike 2', pico: 100 }, { posicao: 2, steam: 570, nome: 'Dota 2', pico: 80 }]);
});

test('lançamentos: a data mais antiga de cada jogo, os mais famosos primeiro', () => {
  const linha = (q, nome, data, links) => ({ jogo: uri(q), jogoLabel: lit(nome), data: lit(`${data}T00:00:00Z`), links: lit(links) });
  const d = converterLancamentos([
    linha('Q1', 'Chrono Trigger', '2008-11-25', 38), linha('Q1', 'Chrono Trigger', '1995-03-11', 38),
    linha('Q2', 'Final Fight', '1989-11-25', 24), linha('Q3', 'Rayman Origins', '2011-11-25', 28), linha('Q4', 'Q4', '2000-11-25', 99),
  ]);
  assert.deepEqual(d['11-25'].map((j) => j.nome), ['Rayman Origins', 'Final Fight']);
  assert.deepEqual(d['03-11'], [{ nome: 'Chrono Trigger', ano: 1995, qid: 'Q1' }]);
});

test('JSON com quebra de linha crua dentro de texto ainda é lido', () => {
  assert.deepEqual(lerJsonTolerante('{"a":"linha 1\nlinha 2","b":"aspas \\" ok"}'), { a: 'linha 1 linha 2', b: 'aspas " ok' });
});

test('sem internet, mantém tudo o que já tinha (nunca grava vazio por cima)', async () => {
  const fetchOriginal = globalThis.fetch;
  const avisoOriginal = console.warn;
  globalThis.fetch = async () => { throw new Error('sem internet'); };
  console.warn = () => {};
  try {
    const anterior = { premios: [{ id: 'tga', anos: [] }], jogos: { Q1: { nome: 'X' } }, maisVendidos: { lista: [1] }, maisJogados: { lista: [2] }, lancamentos: { '01-01': [] } };
    const novo = await montar(anterior, { espera: 0 });
    for (const k of ['premios', 'jogos', 'maisVendidos', 'maisJogados', 'lancamentos']) assert.deepEqual(novo[k], anterior[k], k);
  } finally { globalThis.fetch = fetchOriginal; console.warn = avisoOriginal; }
});

test('o arquivo publicado tem a forma certa', () => {
  const d = JSON.parse(readFileSync(new URL('../../js/data/almanaque.json', import.meta.url), 'utf8'));
  assert.ok(d.geradoEm);
  assert.ok(d.premios.length >= 1 && d.premios.every((p) => p.id && p.nome && Array.isArray(p.anos)));
  assert.ok(Object.keys(d.lancamentos).length >= 300);
  assert.ok(d.maisVendidos.lista.length >= 10);
});
