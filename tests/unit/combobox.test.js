import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filtrarOpcoes } from '../../js/core/combobox.js';
import { CPUS, GPUS } from '../../js/data/hardware.js';

const gpus = Object.keys(GPUS);
const cpus = Object.keys(CPUS);

test('sem texto mostra tudo (até o limite)', () => {
  assert.equal(filtrarOpcoes(gpus, '').length, Math.min(60, gpus.length));
  assert.equal(filtrarOpcoes(gpus, '', 999).length, gpus.length);
});

test('acha por partes do nome em qualquer ordem, sem caixa e sem acento', () => {
  assert.equal(filtrarOpcoes(gpus, 'super 1660')[0], 'NVIDIA GeForce GTX 1660 Super');
  assert.ok(filtrarOpcoes(gpus, 'rx 580').includes('AMD Radeon RX 580'));
  assert.ok(filtrarOpcoes(cpus, '10400F').includes('Intel Core i5-10400F'));
  assert.ok(filtrarOpcoes(cpus, 'ryzen 5600x').includes('AMD Ryzen 5 5600X'));
  assert.ok(filtrarOpcoes(gpus, 'STEAM deck').includes('Steam Deck (APU)'));
  assert.deepEqual(filtrarOpcoes(gpus, 'placa que não existe'), []);
});

test('o nome mais curto e direto vem primeiro', () => {
  assert.equal(filtrarOpcoes(gpus, 'rtx 3060')[0], 'NVIDIA GeForce RTX 3060');
});
