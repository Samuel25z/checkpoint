import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JOGOS, POR_ID, imagens, buscarNoCatalogo, normalizar } from '../../js/games.js';
import { CPUS, GPUS } from '../../js/data/hardware.js';

test('catálogo tem pelo menos 60 jogos com ids únicos', () => {
  assert.ok(JOGOS.length >= 60, `só ${JOGOS.length} jogos`);
  assert.equal(new Set(JOGOS.map((j) => j.id)).size, JOGOS.length);
  assert.equal(Object.keys(POR_ID).length, JOGOS.length);
});

test('todo jogo tem os campos obrigatórios', () => {
  for (const j of JOGOS) {
    assert.ok(j.nome && j.wiki, j.id);
    assert.ok(Number.isInteger(j.ano) && j.ano > 1990, `${j.id}: ano`);
    assert.ok(j.generos.length && j.etiquetas.length >= 3, `${j.id}: gêneros/etiquetas`);
    assert.ok(j.horas > 0, `${j.id}: horas`);
    assert.ok(j.plataformas.length, `${j.id}: plataformas`);
  }
});

test('requisitos usam só peças conhecidas e o recomendado não é pior que o mínimo', () => {
  const comPc = JOGOS.filter((j) => j.requisitos);
  assert.ok(comPc.length >= 55);
  for (const j of comPc) {
    const { min, rec } = j.requisitos;
    for (const nivel of [min, rec]) {
      assert.ok(nivel.cpu in CPUS, `${j.id}: CPU desconhecida ${nivel.cpu}`);
      assert.ok(nivel.gpu in GPUS, `${j.id}: GPU desconhecida ${nivel.gpu}`);
      assert.ok(nivel.ram > 0, `${j.id}: RAM`);
    }
    assert.ok(CPUS[rec.cpu] >= CPUS[min.cpu] && GPUS[rec.gpu] >= GPUS[min.gpu] && rec.ram >= min.ram, `${j.id}: recomendado menor que mínimo`);
    assert.ok(j.plataformas.includes('PC'), `${j.id}: tem requisitos mas não é de PC`);
  }
});

test('imagens da Steam só para jogos da loja', () => {
  assert.match(imagens(POR_ID['hollow-knight']).capa, /367520\/library_600x900\.jpg$/);
  assert.deepEqual(imagens(POR_ID['zelda-botw']), { capa: null, frame: null });
});

test('busca ignora acento e caixa', () => {
  assert.equal(normalizar('Ação É'), 'acao e');
  assert.equal(buscarNoCatalogo('HOLLOW')[0].id, 'hollow-knight');
  assert.deepEqual(buscarNoCatalogo(''), []);
});
