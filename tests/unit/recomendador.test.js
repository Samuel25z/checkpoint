import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recomendar, sugestaoDoDia, ligarDiario, gostoDoDiario } from '../../js/modules/recomendador/logic.js';
import { JOGOS } from '../../js/games.js';

const diario = [
  { nome: 'Hollow Knight', jogoId: 'hollow-knight', status: 'zerado', nota: 5 },
  { nome: 'celeste', status: 'platinado', nota: 4.5 },
  { nome: 'Cyberpunk 2077', status: 'larguei', nota: 1 }
];

test('nunca recomenda o que já foi zerado, platinado, largado ou está em andamento', () => {
  const r = recomendar({ humor: 'desafio', tempo: 'medio', companhia: 'sozinho', plataforma: 'Qualquer' }, diario, JOGOS, { quantos: 60 });
  const ids = r.map((x) => x.jogo.id);
  for (const id of ['hollow-knight', 'celeste', 'cyberpunk-2077']) assert.ok(!ids.includes(id), id);
});

test('determinístico e com motivo legível', () => {
  const pedido = { humor: 'desafio', tempo: 'medio', companhia: 'sozinho', plataforma: 'PC' };
  const a = recomendar(pedido, diario, JOGOS);
  const b = recomendar(pedido, diario, JOGOS);
  assert.deepEqual(a.map((x) => x.jogo.id), b.map((x) => x.jogo.id));
  assert.equal(a.length, 3);
  assert.ok(a.every((x) => x.motivos.length > 0));
  assert.ok(a.some((x) => x.motivos.some((m) => /Parecido com Hollow Knight, que você deu 5/.test(m))), JSON.stringify(a.map((x) => x.motivos)));
});

test('"outra sugestão" não repete as já mostradas', () => {
  const pedido = { humor: 'relaxar', tempo: 'rapido', companhia: 'sozinho', plataforma: 'Qualquer' };
  const primeira = recomendar(pedido, [], JOGOS);
  const segunda = recomendar(pedido, [], JOGOS, { excluir: primeira.map((x) => x.jogo.id) });
  assert.equal(segunda.length, 3);
  assert.ok(segunda.every((x) => !primeira.some((p) => p.jogo.id === x.jogo.id)));
});

test('com amigos só traz jogos cooperativos ou multijogador; plataforma filtra', () => {
  const r = recomendar({ humor: 'rir', tempo: 'rapido', companhia: 'amigos', plataforma: 'Switch' }, [], JOGOS, { quantos: 20 });
  assert.ok(r.length > 0);
  assert.ok(r.every((x) => x.jogo.etiquetas.some((e) => ['coop', 'multiplayer', 'amigos'].includes(e))));
  assert.ok(r.every((x) => x.jogo.plataformas.includes('Switch')));
});

test('humor muda o resultado e entra no motivo', () => {
  const medo = recomendar({ humor: 'medo', tempo: null, companhia: null, plataforma: 'Qualquer' }, [], JOGOS);
  assert.ok(medo[0].jogo.etiquetas.includes('terror'));
  assert.match(medo[0].motivos[0], /terror/);
});

test('gosto do diário: nota alta soma, nota baixa subtrai', () => {
  const ligados = ligarDiario(diario, JOGOS);
  assert.equal(ligados.length, 3, 'liga por id e por nome sem acento/caixa');
  const g = gostoDoDiario(ligados);
  assert.ok(g.dificil > 0);
  assert.ok(g['mundo-aberto'] < 0);
});

test('qualidade vem de dado real; sem dado, sem nota', async () => {
  const { qualidade } = await import('../../js/modules/recomendador/logic.js');
  const q = qualidade({ steam: 1 }, { 1: { metacritic: 95, recomendacoes: 10 } });
  assert.equal(q.motivo, 'Nota 95 no Metacritic');
  assert.ok(q.pontos > 4);
  assert.deepEqual(qualidade({ steam: 2 }, {}), { pontos: 0, motivo: null });
  assert.deepEqual(qualidade({ steam: null }, {}), { pontos: 0, motivo: null });
  assert.match(qualidade({ steam: 3 }, { 3: { recomendacoes: 500000 } }).motivo, /500 mil recomendações/);
});

test('jogo parecido com o que a pessoa deu nota alta sobe e diz por quê', () => {
  const r = recomendar({ humor: 'desafio', tempo: null, companhia: 'sozinho', plataforma: 'PC' }, [{ nome: 'Hollow Knight', jogoId: 'hollow-knight', status: 'zerado', nota: 5 }], JOGOS);
  assert.ok(r.some((x) => x.motivos.some((m) => /Parecido com Hollow Knight, que você deu 5/.test(m))), JSON.stringify(r.map((x) => [x.jogo.id, x.motivos])));
  assert.ok(['silksong', 'ori-wotw', 'tunic', 'dead-cells', 'celeste', 'cuphead'].includes(r[0].jogo.id), `primeiro foi ${r[0].jogo.id}`);
});

test('humor é filtro e as 3 sugestões variam de gênero', () => {
  const r = recomendar({ humor: 'medo', tempo: null, companhia: null, plataforma: 'Qualquer' }, [], JOGOS);
  assert.ok(r.every((x) => x.jogo.etiquetas.includes('terror')), 'medo traz terror quando há opções suficientes');
  const h = recomendar({ humor: 'historia', tempo: null, companhia: null, plataforma: 'Qualquer' }, [], JOGOS);
  const generos = h.map((x) => x.jogo.generos[0]);
  assert.equal(new Set(generos).size, generos.length, `gêneros repetidos: ${generos}`);
});

test('sugestão do dia sem diário é um jogo aclamado (nota real alta), não um empate qualquer', async () => {
  const { AVALIACOES } = await import('../../js/data/avaliacoes.js');
  for (let d = 1; d <= 20; d++) {
    const s = sugestaoDoDia([], JOGOS, new Date(2026, 10, d));
    assert.ok((AVALIACOES[s.jogo.steam]?.metacritic || 0) >= 88, `${s.jogo.nome} no dia ${d}`);
  }
});

test('sugestão do dia é estável no mesmo dia e muda entre dias', () => {
  const d1 = sugestaoDoDia([], JOGOS, new Date(2026, 10, 18, 9));
  const d1tarde = sugestaoDoDia([], JOGOS, new Date(2026, 10, 18, 22));
  const d2 = sugestaoDoDia([], JOGOS, new Date(2026, 10, 19, 9));
  assert.equal(d1.jogo.id, d1tarde.jogo.id);
  assert.notEqual(d1.jogo.id, d2.jogo.id);
});
