import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sugerirStatus, jaNoDiario, paraRegistro, atualizarExistente, textoFatos, lotes, capaSteam } from '../../js/modules/diario/steam-logic.js';
import { criarSteam, ErroSteam } from '../../js/services/steam.js';

const jogo = (appid, nome, minutos, minutos2semanas = 0, ultimaVez = '2026-03-01T00:00:00.000Z') => ({ appid, nome, minutos, minutos2semanas, ultimaVez });

test('só fatos viram sugestão; sem fato, sem status', () => {
  assert.deepEqual(sugerirStatus(jogo(1, 'A', 600), { total: 10, feitas: 10, ultima: '2026-04-02T10:00:00Z' }), { status: 'platinado', motivo: '100% das conquistas', fim: '2026-04-02' });
  assert.equal(sugerirStatus(jogo(1, 'A', 600, 30), { total: 10, feitas: 3 }).status, 'jogando');
  assert.equal(sugerirStatus(jogo(1, 'A', 0), null).status, 'quero');
  assert.deepEqual(sugerirStatus(jogo(1, 'A', 600), { total: 10, feitas: 9 }), { status: null, motivo: null }, '90% não é chutado como zerado');
  assert.equal(sugerirStatus(jogo(1, 'A', 600), null).status, null);
  assert.equal(sugerirStatus(jogo(1, 'A', 600), { total: 0, feitas: 0 }).status, null);
});

test('reconhece jogo que já está no diário por appid, catálogo ou nome', () => {
  const diario = [{ nome: 'Celeste', jogoId: 'celeste' }, { nome: 'Outro', steamAppId: 999 }, { nome: 'Hadës' }];
  assert.ok(jaNoDiario(diario, jogo(504230, 'Celeste', 10)), 'pelo catálogo (appid 504230 = celeste)');
  assert.ok(jaNoDiario(diario, jogo(999, 'Nome diferente', 10)), 'pelo appid');
  assert.ok(jaNoDiario(diario, jogo(5, 'hades', 10)), 'pelo nome sem acento');
  assert.equal(jaNoDiario(diario, jogo(6, 'Inédito', 10)), null);
});

test('converte em registro com horas reais, capa da Steam e dados do catálogo', () => {
  const r = paraRegistro(jogo(367520, 'Hollow Knight', 2520), 'zerado', { total: 63, feitas: 40, ultima: null });
  assert.equal(r.nome, 'Hollow Knight');
  assert.equal(r.jogoId, 'hollow-knight');
  assert.equal(r.horas, 42);
  assert.equal(r.origem, 'steam');
  assert.equal(r.capa, capaSteam(367520));
  assert.equal(r.fim, null, 'data de zerado só vem de fato (platina)');
  assert.deepEqual(r.conquistas, { total: 63, feitas: 40 });
  const p = paraRegistro(jogo(1, 'X', 60), 'platinado', { total: 2, feitas: 2, ultima: '2026-05-05T00:00:00Z' });
  assert.equal(p.fim, '2026-05-05');
});

test('reimportação só atualiza horas/conquistas do que veio da Steam e nunca mexe no status', () => {
  const vindo = { nome: 'HK', origem: 'steam', status: 'zerado', horas: 10, ultimaVez: '2026-01-01', conquistas: { total: 2, feitas: 1 } };
  const novo = atualizarExistente(vindo, jogo(1, 'HK', 1200, 0, '2026-06-01'), { total: 2, feitas: 2 });
  assert.equal(novo.horas, 20);
  assert.equal(novo.status, 'zerado');
  assert.deepEqual(novo.conquistas, { total: 2, feitas: 2 });
  assert.equal(atualizarExistente({ nome: 'HK', status: 'jogando', horas: 3 }, jogo(1, 'HK', 1200), null), null, 'registro manual não é tocado');
  assert.equal(atualizarExistente({ ...vindo, horas: 20, ultimaVez: '2026-06-01', conquistas: { total: 2, feitas: 2 } }, jogo(1, 'HK', 1200, 0, '2026-06-01'), { total: 2, feitas: 2 }), null, 'sem mudança → null');
});

test('textos e lotes', () => {
  assert.equal(textoFatos(jogo(1, 'A', 90, 0, null), { total: 4, feitas: 1 }), '1,5 h · conquistas 1/4');
  assert.equal(textoFatos(jogo(1, 'A', 0, 0, null), null), 'nunca jogou');
  assert.deepEqual(lotes([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test('serviço repassa a mensagem do ajudante e marca perfil privado', async () => {
  const s = criarSteam({ base: 'https://ajudante.exemplo/', buscar: async (u) => (u.includes('/jogos')
    ? { ok: false, status: 403, json: async () => ({ erro: 'A biblioteca deste perfil está privada.', privado: true }) }
    : { ok: true, status: 200, json: async () => ({ steamid: '1', nome: 'S' }) }) });
  assert.equal((await s.perfil('samuel')).nome, 'S');
  await assert.rejects(() => s.jogos('1'), (e) => e instanceof ErroSteam && e.privado && /privada/.test(e.message));
  assert.equal(criarSteam({ base: '' }).configurado(), false);
});
