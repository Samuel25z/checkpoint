import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unir, planejar, sincronizavel, registrarRemocoes, unirRemovidos, formatoValido } from '../../js/core/sync.js';

const D = 'diario:jogos';
const v = (valor, em = '2026-06-01T00:00:00Z') => ({ valor, em });

test('só dados do usuário sincronizam (não caches nem preferências de tela)', () => {
  assert.equal(sincronizavel(D), true);
  assert.equal(sincronizavel('sync:removidos'), true);
  assert.equal(sincronizavel('cache:github:x'), false);
  assert.equal(sincronizavel('pref:tema'), false);
});

test('unir listas: nada se perde e vence a versão mais recente de cada item', () => {
  const local = [{ id: 'a', status: 'zerado', atualizadoEm: '2026-05-02' }, { id: 'c', atualizadoEm: '2026-05-03' }];
  const nuvem = [{ id: 'a', status: 'jogando', atualizadoEm: '2026-05-01' }, { id: 'b', atualizadoEm: '2026-04-01' }];
  const r = unir(local, nuvem);
  assert.deepEqual(r.map((x) => x.id).sort(), ['a', 'b', 'c']);
  assert.equal(r.find((x) => x.id === 'a').status, 'zerado');
  assert.deepEqual(unir({ x: 1 }, { y: 2 }), { y: 2, x: 1 });
});

test('adições feitas em dois aparelhos ao mesmo tempo se somam (não só no primeiro login)', () => {
  const local = { [D]: v([{ id: 'x', atualizadoEm: '2026-06-02' }, { id: 'base', atualizadoEm: '2026-01-01' }], '2026-06-02T00:00:00Z') };
  const nuvem = { [D]: v([{ id: 'y', atualizadoEm: '2026-06-03' }, { id: 'base', atualizadoEm: '2026-01-01' }], '2026-06-03T00:00:00Z') };
  const p = planejar(local, nuvem, { primeiraVez: false });
  assert.deepEqual(p.gravarLocal[D].map((j) => j.id).sort(), ['base', 'x', 'y']);
  assert.deepEqual(p.enviar[D].map((j) => j.id).sort(), ['base', 'x', 'y']);
});

test('excluído não volta: a marca de remoção viaja e vence a cópia antiga', () => {
  let rem = registrarRemocoes({}, D, ['a', 'b'], ['b'], '2026-06-05T00:00:00Z');
  assert.deepEqual(rem, { [D]: { a: '2026-06-05T00:00:00Z' } });
  const local = { [D]: v([{ id: 'b', atualizadoEm: '2026-01-01' }]), 'sync:removidos': v(rem) };
  const nuvem = { [D]: v([{ id: 'a', atualizadoEm: '2026-01-01' }, { id: 'b', atualizadoEm: '2026-01-01' }]) };
  const p = planejar(local, nuvem, { primeiraVez: false });
  assert.deepEqual(p.enviar[D].map((j) => j.id), ['b']);
  assert.deepEqual(p.enviar['sync:removidos'], rem);
  // outro aparelho que ainda tem "a" recebe a marca e apaga
  const outro = planejar({ [D]: v([{ id: 'a', atualizadoEm: '2026-01-01' }, { id: 'b', atualizadoEm: '2026-01-01' }]) }, { [D]: v([{ id: 'b', atualizadoEm: '2026-01-01' }]), 'sync:removidos': v(rem) }, { primeiraVez: false });
  assert.deepEqual(outro.gravarLocal[D].map((j) => j.id), ['b']);
  rem = unirRemovidos(rem, { [D]: { a: '2026-01-01T00:00:00Z', z: '2026-02-01T00:00:00Z' } });
  assert.equal(rem[D].a, '2026-06-05T00:00:00Z', 'fica a remoção mais recente');
  assert.equal(rem[D].z, '2026-02-01T00:00:00Z');
});

test('item editado depois de removido em outro aparelho continua', () => {
  const r = unir([{ id: 'a', atualizadoEm: '2026-07-01' }], [], { a: '2026-06-01' });
  assert.equal(r.length, 1);
});

test('não-listas: primeiro login junta; depois vence quem mudou por último', () => {
  const S = 'recomps:seguidos';
  assert.deepEqual(planejar({ [S]: v({ 'a/b': 'v1' }) }, { [S]: v({ 'c/d': 'v2' }) }, { primeiraVez: true }).gravarLocal[S], { 'c/d': 'v2', 'a/b': 'v1' });
  const p = planejar({ [S]: v({ 'a/b': 'v1' }, '2026-06-02') }, { [S]: v({}, '2026-06-01') }, { primeiraVez: false });
  assert.deepEqual(p.enviar[S], { 'a/b': 'v1' });
});

test('formato de dado vindo da nuvem é conferido', () => {
  assert.equal(formatoValido(D, [{ id: 1 }]), true);
  assert.equal(formatoValido(D, { quebrado: true }), false);
  assert.equal(formatoValido(D, [1, 2]), false);
  assert.equal(formatoValido('recomps:seguidos', []), false);
  assert.equal(formatoValido('recomendador:respostas', { humor: 'x' }), true);
});
