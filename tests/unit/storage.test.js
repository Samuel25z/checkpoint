import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarStorage, memoria, PREFIXO, VERSAO_ESQUEMA, novoId } from '../../js/storage.js';

test('grava e lê com o prefixo checkpoint:', () => {
  const base = memoria();
  const s = criarStorage(base);
  s.gravar('diario:jogos', [{ id: 1 }]);
  assert.equal(base.getItem(PREFIXO + 'diario:jogos'), '[{"id":1}]');
  assert.deepEqual(s.ler('diario:jogos'), [{ id: 1 }]);
});

test('devolve o padrão quando não existe ou o JSON está corrompido', () => {
  const base = memoria();
  const s = criarStorage(base);
  assert.deepEqual(s.ler('nada', []), []);
  base.setItem(PREFIXO + 'quebrado', '{oops');
  assert.equal(s.ler('quebrado', 'padrao'), 'padrao');
});

test('emite evento de mudança, inclusive ao remover, e respeita silencioso', () => {
  const s = criarStorage(memoria());
  const eventos = [];
  const sair = s.aoMudar((e) => eventos.push(e));
  s.gravar('a', 1);
  s.gravar('b', 2, { silencioso: true });
  s.remover('a');
  sair();
  s.gravar('c', 3);
  assert.deepEqual(eventos, [{ nome: 'a', valor: 1 }, { nome: 'a', valor: null }]);
});

test('atualizar aplica a transformação sobre o valor atual', () => {
  const s = criarStorage(memoria());
  s.atualizar('contador', 0, (n) => n + 1);
  s.atualizar('contador', 0, (n) => n + 1);
  assert.equal(s.ler('contador'), 2);
});

test('lista só as chaves do Checkpoint e grava a versão do esquema', () => {
  const base = memoria();
  base.setItem('outro-site', 'x');
  const s = criarStorage(base);
  assert.equal(s.migrar(), VERSAO_ESQUEMA);
  s.gravar('x', 1);
  assert.deepEqual(s.nomes().sort(), ['meta:versao', 'x']);
});

test('quando o navegador recusa gravar, avisa com mensagem clara', () => {
  const base = memoria();
  base.setItem = () => { throw new Error('QuotaExceeded'); };
  const s = criarStorage(base);
  assert.throws(() => s.gravar('a', 1), /Não deu para salvar/);
  assert.equal(s.disponivel, false);
});

test('novoId gera ids diferentes', () => {
  const ids = new Set(Array.from({ length: 200 }, novoId));
  assert.equal(ids.size, 200);
});
