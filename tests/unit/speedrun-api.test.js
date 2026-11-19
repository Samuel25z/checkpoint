import { test } from 'node:test';
import assert from 'node:assert/strict';
import { converterJogos, converterCategorias, converterRanking } from '../../js/modules/speedrun/logic.js';
import { criarSpeedrun } from '../../js/services/speedrun.js';

export const RANKING = {
  data: {
    runs: [
      { place: 2, run: { times: { primary_t: 269.39 }, date: '2024-03-02', players: [{ rel: 'user', id: 'u2' }], videos: { links: [{ uri: 'https://youtu.be/HcBHdz2GgP8' }] }, weblink: 'https://speedrun.com/run/2' } },
      { place: 1, run: { times: { primary_t: 269.34 }, date: '2024-04-01', players: [{ rel: 'user', id: 'u1' }], videos: { links: [{ uri: 'https://twitch.tv/v/1' }] }, weblink: 'https://speedrun.com/run/1' } },
      { place: 3, run: { times: { primary_t: 277.45 }, date: null, players: [{ rel: 'guest', name: 'Convidado' }], weblink: 'https://speedrun.com/run/3' } }
    ],
    players: { data: [{ id: 'u1', names: { international: 'Fireb0rn' } }, { id: 'u2', names: { international: 'Zakamutt' } }] }
  }
};

test('ranking: ordena por posição, converte tempo e resolve jogadores', () => {
  const r = converterRanking(RANKING);
  assert.deepEqual(r.map((x) => x.posicao), [1, 2, 3]);
  assert.equal(r[0].jogador, 'Fireb0rn');
  assert.equal(r[0].tempo, 269340);
  assert.equal(r[1].video, 'https://youtu.be/HcBHdz2GgP8');
  assert.equal(r[2].jogador, 'Convidado');
  assert.equal(r[2].video, null);
  assert.deepEqual(converterRanking({}), []);
});

test('links da API que não são http/https são descartados', () => {
  const r = converterRanking({ data: { runs: [{ place: 1, run: { times: { primary_t: 10 }, players: [{ rel: 'guest', name: 'x' }], videos: { links: [{ uri: 'javascript:alert(1)' }] }, weblink: 'data:text/html,oi' } }], players: { data: [] } } });
  assert.equal(r[0].video, null);
  assert.equal(r[0].link, null);
  const c = converterCategorias({ data: [{ id: 'a', name: 'Any%', type: 'per-game', weblink: 'javascript:void(0)' }] });
  assert.equal(c[0].link, 'https://www.speedrun.com');
});

test('jogos e categorias (categorias principais antes das extras)', () => {
  const jogos = converterJogos({ data: [{ id: 'g1', names: { international: 'Hollow Knight' }, released: 2017, assets: { 'cover-large': { uri: 'https://c/x' } }, weblink: 'https://speedrun.com/hk' }] });
  assert.deepEqual(jogos[0], { id: 'g1', nome: 'Hollow Knight', ano: 2017, capa: 'https://c/x', link: 'https://speedrun.com/hk' });
  const cats = converterCategorias({ data: [
    { id: 'm', name: 'Memes', type: 'per-game', miscellaneous: true, weblink: 'w' },
    { id: 'a', name: 'Any%', type: 'per-game', miscellaneous: false, weblink: 'w' },
    { id: 'l', name: 'IL', type: 'per-level', weblink: 'w' }] });
  assert.deepEqual(cats.map((c) => c.id), ['a', 'm']);
});

test('serviço usa cache de 10 minutos e monta URLs certas', async () => {
  const urls = [];
  let t = 0;
  const s = criarSpeedrun({ buscar: async (u) => { urls.push(u); return RANKING; }, agora: () => t });
  await s.ranking('g1', 'c1');
  await s.ranking('g1', 'c1');
  assert.equal(urls.length, 1);
  t = 11 * 60 * 1000;
  await s.ranking('g1', 'c1');
  assert.equal(urls.length, 2);
  assert.match(urls[0], /leaderboards\/g1\/category\/c1\?top=10&embed=players/);
});
