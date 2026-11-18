import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { criarRegistro, MODULOS } from '../../js/modules/registry.js';

const fake = (id, rota = id) => ({ id, titulo: id, icone: 'casa', rota, carregar: async () => ({ default: { montar() {} } }) });

test('o registro real é válido e começa pela Início', () => {
  const r = criarRegistro(MODULOS);
  assert.equal(r.inicial().id, 'inicio');
  assert.ok(r.todos().length >= 1);
});

test('toda aba registrada tem pasta com index.js', () => {
  for (const m of MODULOS) assert.ok(existsSync(`js/modules/${m.id}/index.js`), `falta js/modules/${m.id}/index.js`);
});

test('uma aba nova entra só acrescentando uma linha na lista', () => {
  const r = criarRegistro([...MODULOS, fake('nova-aba')]);
  assert.equal(r.porRota('nova-aba').id, 'nova-aba');
  assert.equal(r.todos().length, MODULOS.length + 1);
  assert.equal(r.porRota('inexistente'), null);
});

test('rejeita módulo incompleto ou rota repetida', () => {
  assert.throws(() => criarRegistro([{ id: 'x', titulo: 'x', icone: 'casa', rota: 'x' }]), /carregar/);
  assert.throws(() => criarRegistro([fake('a'), fake('b', 'a')]), /Rota repetida/);
  assert.throws(() => criarRegistro([{ ...fake('a'), titulo: '' }]), /titulo/);
});

test('o registro só lista abas: cada linha usa um ícone que existe', async () => {
  const { ICONES } = await import('../../js/core/icons.js');
  for (const m of MODULOS) assert.ok(ICONES.includes(m.icone), `ícone desconhecido: ${m.icone}`);
  assert.match(readFileSync('js/modules/registry.js', 'utf8'), /Para lançar uma aba nova/);
});
