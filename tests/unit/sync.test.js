import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unir, planejar, sincronizavel } from '../../js/core/sync.js';

test('só dados do usuário sincronizam (não caches nem preferências de tela)', () => {
  assert.equal(sincronizavel('diario:jogos'), true);
  assert.equal(sincronizavel('cache:github:x'), false);
  assert.equal(sincronizavel('pref:tema'), false);
});

test('unir listas com id: nada se perde e vence a versão mais recente de cada item', () => {
  const local = [{ id: 'a', nome: 'Hades', status: 'zerado', atualizadoEm: '2026-05-02' }, { id: 'c', nome: 'Novo no PC', atualizadoEm: '2026-05-03' }];
  const nuvem = [{ id: 'a', nome: 'Hades', status: 'jogando', atualizadoEm: '2026-05-01' }, { id: 'b', nome: 'Celeste', atualizadoEm: '2026-04-01' }];
  const r = unir(local, nuvem);
  assert.deepEqual(r.map((x) => x.id).sort(), ['a', 'b', 'c']);
  assert.equal(r.find((x) => x.id === 'a').status, 'zerado');
  const r2 = unir([{ id: 'a', v: 1, atualizadoEm: '2026-01-01' }], [{ id: 'a', v: 2, atualizadoEm: '2026-02-01' }]);
  assert.equal(r2[0].v, 2);
});

test('unir objetos e valores simples', () => {
  assert.deepEqual(unir({ x: 1 }, { y: 2 }), { y: 2, x: 1 });
  assert.equal(unir(null, 5), 5);
  assert.equal(unir(3, undefined), 3);
});

test('primeiro login: junta os dois lados e manda para onde faltar', () => {
  const local = { 'diario:jogos': { valor: [{ id: 'a', atualizadoEm: '2026-01-01' }], em: '2026-01-01' } };
  const nuvem = { 'diario:jogos': { valor: [{ id: 'b', atualizadoEm: '2026-01-02' }], em: '2026-01-02' }, 'torneio:lista': { valor: [{ id: 't' }], em: '2026-01-01' } };
  const p = planejar(local, nuvem, { primeiraVez: true });
  assert.equal(p.gravarLocal['diario:jogos'].length, 2);
  assert.equal(p.enviar['diario:jogos'].length, 2);
  assert.deepEqual(p.gravarLocal['torneio:lista'], [{ id: 't' }]);
  assert.equal(p.enviar['torneio:lista'], undefined);
});

test('depois do primeiro login vence quem mudou por último (exclusão também sincroniza)', () => {
  const local = { 'diario:jogos': { valor: [], em: '2026-06-02T10:00:00Z' }, 'speedrun:rotas': { valor: [{ id: 'r' }], em: '2026-06-01T00:00:00Z' } };
  const nuvem = { 'diario:jogos': { valor: [{ id: 'apagado' }], em: '2026-06-01T10:00:00Z' }, 'speedrun:rotas': { valor: [{ id: 'r' }, { id: 's' }], em: '2026-06-03T00:00:00Z' } };
  const p = planejar(local, nuvem, { primeiraVez: false });
  assert.deepEqual(p.enviar['diario:jogos'], [], 'lista vazia local (item excluído) sobe');
  assert.deepEqual(p.gravarLocal['speedrun:rotas'].map((x) => x.id), ['r', 's']);
  assert.equal(p.gravarLocal['diario:jogos'], undefined);
});
