import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encontrarGpu, encontrarCpu, classificar, explicar, resultado, resumo, validarPc } from '../../js/modules/roda-no-pc/logic.js';
import { JOGOS, POR_ID } from '../../js/games.js';

test('reconhece a placa de vídeo no texto do WebGL', () => {
  assert.equal(encontrarGpu('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Laptop GPU Direct3D11 vs_5_0 ps_5_0, D3D11)'), 'NVIDIA GeForce RTX 3060 Laptop', 'versão de notebook é mais fraca');
  assert.equal(encontrarGpu('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Ti Direct3D11 vs_5_0)'), 'NVIDIA GeForce RTX 3060 Ti', 'prefere o modelo mais específico');
  assert.equal(encontrarGpu('ANGLE (AMD, AMD Radeon RX 580 2048SP Direct3D11)'), 'AMD Radeon RX 580');
  assert.equal(encontrarGpu('ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)'), 'Intel UHD Graphics 620');
  assert.equal(encontrarGpu('NVIDIA GeForce GTX 1660 SUPER/PCIe/SSE2'), 'NVIDIA GeForce GTX 1660 Super');
  assert.equal(encontrarGpu('Google SwiftShader'), null);
  assert.equal(encontrarCpu('Intel(R) Core(TM) i5-10400 CPU @ 2.90GHz'), 'Intel Core i5-10400');
});

const pc = (cpu, gpu, ram) => ({ cpu, gpu, ram });
const hk = POR_ID['hollow-knight'].requisitos;
const cyber = POR_ID['cyberpunk-2077'].requisitos;

test('classifica do "não roda" ao "ultra" e aponta o gargalo', () => {
  const fraco = pc('Intel Core i3-2100', 'Intel UHD Graphics 620', 4);
  assert.deepEqual(classificar(fraco, cyber), { nivel: 'nao', gargalo: 'gpu' });
  const forte = pc('AMD Ryzen 7 7800X3D', 'NVIDIA GeForce RTX 4080', 32);
  assert.equal(classificar(forte, hk).nivel, 'ultra');
  assert.equal(classificar(forte, hk).gargalo, null);
  const medio = pc('Intel Core i5-10400', 'NVIDIA GeForce GTX 1060 6GB', 16);
  const r = classificar(medio, cyber);
  assert.equal(r.nivel, 'baixo');
  assert.equal(r.gargalo, 'cpu', 'i5-10400 está mais longe do recomendado (i7-12700K) que a GTX 1060 da RTX 2060');
  assert.equal(classificar(pc('x', 'y', 8), hk).nivel, null);
  assert.equal(classificar(medio, null).nivel, null);
});

test('memória abaixo do mínimo também impede', () => {
  assert.deepEqual(classificar(pc('AMD Ryzen 7 7800X3D', 'NVIDIA GeForce RTX 4080', 4), POR_ID['elden-ring'].requisitos), { nivel: 'nao', gargalo: 'ram' });
});

test('textos explicam o resultado', () => {
  assert.equal(explicar({ nivel: 'nao', gargalo: 'ram' }), 'A memória está abaixo do mínimo');
  assert.equal(explicar({ nivel: 'medio', gargalo: 'gpu' }), 'Quem segura é a placa de vídeo');
  assert.equal(explicar({ nivel: 'ultra' }), 'Sobra desempenho');
});

test('resultado cobre todos os jogos de PC, do melhor nível para o pior', () => {
  const lista = resultado(pc('Intel Core i5-12400', 'NVIDIA GeForce RTX 3060', 16), JOGOS);
  assert.equal(lista.length, JOGOS.filter((j) => j.requisitos).length);
  const ordem = ['ultra', 'alto', 'medio', 'baixo', 'nao'];
  for (let i = 1; i < lista.length; i++) assert.ok(ordem.indexOf(lista[i - 1].nivel) <= ordem.indexOf(lista[i].nivel));
  const c = resumo(lista);
  assert.equal(Object.values(c).reduce((a, b) => a + b, 0), lista.length);
});

test('base grande: desktop, notebook, integradas e portáteis', async () => {
  const { CPUS, GPUS } = await import('../../js/data/hardware.js');
  assert.ok(Object.keys(CPUS).length >= 150, `só ${Object.keys(CPUS).length} CPUs`);
  assert.ok(Object.keys(GPUS).length >= 120, `só ${Object.keys(GPUS).length} GPUs`);
  for (const nome of ['Intel Core i5-1135G7', 'AMD Ryzen 7 5800H', 'Intel Core Ultra 7 155H', 'Steam Deck (APU)']) assert.ok(nome in CPUS, nome);
  for (const nome of ['NVIDIA GeForce RTX 4060 Laptop', 'Intel Iris Xe Graphics', 'AMD Radeon 780M', 'Intel Arc B580', 'NVIDIA GeForce RTX 5090']) assert.ok(nome in GPUS, nome);
  for (const [n, v] of [...Object.entries(CPUS), ...Object.entries(GPUS)]) assert.ok(Number.isFinite(v) && v > 0, `pontuação inválida: ${n}`);
  assert.equal(encontrarGpu('ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Laptop GPU Direct3D11)'), 'NVIDIA GeForce RTX 4060 Laptop');
});

test('valida o formulário do PC', () => {
  assert.equal(validarPc({ nome: 'Meu PC', cpu: 'Intel Core i5-12400', gpu: 'NVIDIA GeForce RTX 3060', ram: '16' }).ok, true);
  const v = validarPc({ nome: '', cpu: 'Pentium', gpu: '', ram: 7 });
  assert.deepEqual(Object.keys(v.erros).sort(), ['cpu', 'gpu', 'nome', 'ram']);
});
