import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarRegistro, filtrar, ordenar, contar, atividade, textoAtividade, empilhar, idYoutube, textoNota } from '../../js/modules/diario/logic.js';
import { salvarJogo, removerJogo, lerJogos, lerAtividades } from '../../js/modules/diario/dados.js';
import { criarStorage, memoria } from '../../js/storage.js';

const base = { nome: 'Celeste', status: 'jogando' };

test('valida nota de meia em meia, horas e datas', () => {
  assert.equal(validarRegistro({ ...base, nota: 4.5 }).ok, true);
  assert.ok(validarRegistro({ ...base, nota: 4.3 }).erros.nota);
  assert.ok(validarRegistro({ ...base, nota: 6 }).erros.nota);
  assert.equal(validarRegistro({ ...base, horas: '12,5' }).valor.horas, 12.5);
  assert.ok(validarRegistro({ ...base, horas: '-1' }).erros.horas);
  assert.ok(validarRegistro({ ...base, inicio: '2026-05-10', fim: '2026-05-01' }).erros.fim);
  assert.ok(validarRegistro({ nome: '  ', status: 'jogando' }).erros.nome);
  assert.ok(validarRegistro({ nome: 'X', status: 'outro' }).erros.status);
  assert.equal(validarRegistro({ ...base, nota: '' }).valor.nota, null);
});

test('zerado sem data recebe a data de hoje; vídeo precisa ser do YouTube', () => {
  const v = validarRegistro({ ...base, status: 'zerado' }).valor;
  assert.match(v.fim, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(validarRegistro({ ...base, video: 'https://vimeo.com/1' }).erros.video);
  assert.equal(idYoutube('https://youtu.be/HcBHdz2GgP8'), 'HcBHdz2GgP8');
  assert.equal(idYoutube('https://www.youtube.com/watch?v=C-uGz8OgFL8&t=3'), 'C-uGz8OgFL8');
  assert.equal(idYoutube('https://www.youtube.com/shorts/abcdefghijk'), 'abcdefghijk');
  assert.equal(idYoutube('nada'), null);
});

const lista = [
  { id: 'a', nome: 'Hades', status: 'zerado', nota: 5, horas: 30, plataforma: 'PC', favorito: true, atualizadoEm: '2026-03-01' },
  { id: 'b', nome: 'Celeste', status: 'jogando', nota: 4, horas: 5, plataforma: 'Nintendo Switch', favorito: false, atualizadoEm: '2026-05-01' },
  { id: 'c', nome: 'Ávalon', status: 'quero', nota: null, horas: 0, plataforma: 'PC', favorito: false, atualizadoEm: '2026-01-01' }
];

test('filtra por status, favoritos, plataforma e texto sem acento', () => {
  assert.deepEqual(filtrar(lista, { status: 'zerado' }).map((j) => j.id), ['a']);
  assert.deepEqual(filtrar(lista, { status: 'favoritos' }).map((j) => j.id), ['a']);
  assert.deepEqual(filtrar(lista, { plataforma: 'PC' }).map((j) => j.id), ['a', 'c']);
  assert.deepEqual(filtrar(lista, { texto: 'avalon' }).map((j) => j.id), ['c']);
});

test('ordena por recentes, nota, horas e nome sem alterar a original', () => {
  assert.deepEqual(ordenar(lista).map((j) => j.id), ['b', 'a', 'c']);
  assert.deepEqual(ordenar(lista, 'nota').map((j) => j.id), ['a', 'b', 'c']);
  assert.deepEqual(ordenar(lista, 'horas').map((j) => j.id), ['a', 'b', 'c']);
  assert.deepEqual(ordenar(lista, 'nome').map((j) => j.id), ['c', 'b', 'a']);
  assert.equal(lista[0].id, 'a');
  assert.deepEqual(contar(lista), { todos: 3, favoritos: 1, jogando: 1, zerado: 1, quero: 1, platinado: 0, larguei: 0 });
});

test('histórico registra adicionar, zerar, nota, favoritar e remover', () => {
  const j = { id: 'x', nome: 'Hades', status: 'jogando', nota: null, favorito: false };
  assert.equal(textoAtividade(atividade(null, j)), 'adicionou Hades como “Jogando”');
  assert.equal(textoAtividade(atividade(j, { ...j, status: 'zerado' })), 'zerou Hades');
  assert.equal(textoAtividade(atividade(j, { ...j, nota: 4.5 })), 'deu 4,5 estrelas para Hades');
  assert.equal(textoAtividade(atividade(j, { ...j, favorito: true })), 'favoritou Hades');
  assert.equal(textoAtividade(atividade(j, null)), 'removeu Hades do diário');
  assert.equal(atividade(j, { ...j, resenha: 'bom' }), null);
  assert.equal(empilhar(Array(50).fill({}), { tipo: 'n' }).length, 50);
  assert.equal(textoNota(3.5), '3,5 de 5 estrelas');
});

test('salvar e remover persistem e alimentam o histórico', () => {
  const s = criarStorage(memoria());
  const salvo = salvarJogo(s, validarRegistro({ nome: 'Hades', status: 'jogando' }).valor);
  assert.ok(salvo.id && salvo.criadoEm);
  salvarJogo(s, { ...salvo, status: 'zerado', fim: '2026-05-01' });
  assert.equal(lerJogos(s).length, 1);
  assert.equal(lerJogos(s)[0].status, 'zerado');
  removerJogo(s, salvo.id);
  assert.equal(lerJogos(s).length, 0);
  assert.deepEqual(lerAtividades(s).map((a) => a.tipo), ['removeu', 'status', 'adicionou']);
});
