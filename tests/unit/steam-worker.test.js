import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker, { lerEntrada } from '../../servidor/steam-worker/worker.js';

const ORIGEM = 'https://samuel25z.github.io';
const env = { STEAM_KEY: 'chave-secreta-teste' };
let pedidos = [];
let respostas = {};

beforeEach(() => {
  pedidos = [];
  respostas = {};
  globalThis.fetch = async (u) => {
    pedidos.push(u);
    const chave = Object.keys(respostas).find((k) => u.includes(k));
    const [status, corpo] = respostas[chave] || [500, {}];
    return { ok: status === 200, status, json: async () => corpo };
  };
});

const pedir = (caminho, origem = ORIGEM) => worker.fetch(new Request('https://ajudante.exemplo' + caminho, { headers: { origin: origem } }), env);

test('lê link de perfil, id e nome personalizado', () => {
  assert.deepEqual(lerEntrada('https://steamcommunity.com/profiles/76561198000000001/'), { steamid: '76561198000000001' });
  assert.deepEqual(lerEntrada('https://steamcommunity.com/id/samuel25z'), { vanity: 'samuel25z' });
  assert.deepEqual(lerEntrada('76561198000000001'), { steamid: '76561198000000001' });
  assert.deepEqual(lerEntrada('samuel25z'), { vanity: 'samuel25z' });
  assert.equal(lerEntrada('https://outro.site/x y'), null);
});

test('recusa origem que não é o site', async () => {
  const r = await pedir('/jogos?steamid=76561198000000001', 'https://site-estranho.com');
  assert.equal(r.status, 403);
  assert.equal(pedidos.length, 0, 'nem chega a chamar a Steam');
});

test('perfil por nome: resolve o id e devolve nome e visibilidade, sem expor a chave', async () => {
  respostas = {
    ResolveVanityURL: [200, { response: { success: 1, steamid: '76561198000000001' } }],
    GetPlayerSummaries: [200, { response: { players: [{ personaname: 'Samuel', avatarfull: 'https://a/x.jpg', communityvisibilitystate: 3 }] } }]
  };
  const r = await pedir('/perfil?entrada=samuel25z');
  const corpo = await r.json();
  assert.equal(r.status, 200);
  assert.deepEqual(corpo, { steamid: '76561198000000001', nome: 'Samuel', avatar: 'https://a/x.jpg', publico: true });
  assert.equal(r.headers.get('access-control-allow-origin'), ORIGEM);
  assert.ok(!JSON.stringify(corpo).includes('chave-secreta'));
  assert.ok(pedidos.every((u) => u.includes('key=chave-secreta-teste')), 'a chave vai só para a Steam');
});

test('jogos: converte minutos e última vez; biblioteca privada vira erro claro', async () => {
  respostas = { GetOwnedGames: [200, { response: { game_count: 2, games: [{ appid: 367520, name: 'Hollow Knight', playtime_forever: 2520, playtime_2weeks: 60, rtime_last_played: 1767225600 }, { appid: 10, name: 'Counter-Strike', playtime_forever: 0, rtime_last_played: 0 }] } }] };
  const corpo = await (await pedir('/jogos?steamid=76561198000000001')).json();
  assert.deepEqual(corpo.jogos[0], { appid: 367520, nome: 'Hollow Knight', minutos: 2520, minutos2semanas: 60, ultimaVez: '2026-01-01T00:00:00.000Z' });
  assert.equal(corpo.jogos[1].ultimaVez, null);
  respostas = { GetOwnedGames: [200, { response: {} }] };
  const privado = await pedir('/jogos?steamid=76561198000000001');
  assert.equal(privado.status, 403);
  assert.equal((await privado.json()).privado, true);
  assert.equal((await pedir('/jogos?steamid=abc')).status, 400);
});

test('conquistas: total, feitas e data da última; jogo sem conquistas vira null', async () => {
  respostas = {
    'appid=367520': [200, { playerstats: { achievements: [{ achieved: 1, unlocktime: 1767225600 }, { achieved: 1, unlocktime: 1767312000 }] } }],
    'appid=10': [400, {}]
  };
  const corpo = await (await pedir('/conquistas?steamid=76561198000000001&appids=367520,10')).json();
  assert.deepEqual(corpo.conquistas['367520'], { total: 2, feitas: 2, ultima: '2026-01-02T00:00:00.000Z' });
  assert.equal(corpo.conquistas['10'], null);
});

test('sem chave configurada responde erro, rota desconhecida 404, Steam fora do ar 502', async () => {
  const semChave = await worker.fetch(new Request('https://x/perfil?entrada=a1', { headers: { origin: ORIGEM } }), {});
  assert.equal(semChave.status, 500);
  assert.equal((await pedir('/nada')).status, 404);
  globalThis.fetch = async () => { throw new Error('offline'); };
  assert.equal((await pedir('/jogos?steamid=76561198000000001')).status, 502);
});
