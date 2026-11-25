import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sugerirUsuario, validarUsuario, termoBusca, montarResumo, amigos, feed, erroSocial, linkPerfil } from '../../js/modules/amigos/logic.js';

test('@ sugerido a partir do nome', () => {
  assert.equal(sugerirUsuario('Samuel Mota Ramos'), 'samuel_mota_ramos');
  assert.equal(sugerirUsuario('@João.Gamer!!'), 'joao_gamer');
  assert.equal(sugerirUsuario(''), '');
  assert.equal(sugerirUsuario('x'.repeat(40)).length, 20);
});

test('validação do @', () => {
  assert.deepEqual(validarUsuario(' @Samuel_25 '), { ok: true, usuario: 'samuel_25' });
  assert.equal(validarUsuario('ab').erro, 'Use pelo menos 3 caracteres.');
  assert.equal(validarUsuario('a'.repeat(21)).erro, 'Use no máximo 20 caracteres.');
  assert.match(validarUsuario('com espaço').erro, /sem espaço/);
  assert.match(validarUsuario('joão').erro, /sem acento/);
  assert.match(validarUsuario('admin').erro, /reservado/);
  assert.equal(validarUsuario('').erro, 'Escolha um nome de usuário.');
});

test('busca: termo seguro para "começa com"', () => {
  assert.equal(termoBusca('@Sam'), 'sam');
  assert.equal(termoBusca('s'), null);
  assert.equal(termoBusca("sa%' or 1=1"), 'saor11');
});

const J = (id, nome, jogoId, status, nota, horas, extra = {}) => ({ id, nome, jogoId, status, nota, horas, criadoEm: '2026-05-01T00:00:00Z', atualizadoEm: `2026-11-1${id.length}T00:00:00Z`, ...extra });
test('resumo público: só o necessário, sem resenha nem datas exatas', () => {
  const diario = [J('a', 'Celeste', 'celeste', 'platinado', 5, 14, { resenha: 'segredo', inicio: '2026-01-01' }), J('bb', 'Hades II', 'hades-2', 'jogando', 4, 30)];
  const r = montarResumo(diario, { favoritos: ['a'], coroado: 'a' });
  assert.equal(r.numeros.jogos, 2);
  assert.equal(r.nivel.nivel >= 1, true);
  assert.deepEqual(r.favoritos.map((f) => [f.nome, f.coroado]), [['Celeste', true]]);
  assert.deepEqual(r.jogando.map((j) => j.nome), ['Hades II']);
  assert.ok(r.medalhas.some((m) => m.id === 'platinador'));
  const texto = JSON.stringify(r);
  assert.ok(!texto.includes('segredo'), 'resenha não vai para o público');
  assert.ok(!texto.includes('2026-01-01'), 'data de início não vai para o público');
});

test('amigos = quem eu sigo e me segue de volta', () => {
  assert.deepEqual(amigos(['a', 'b', 'c'], ['c', 'x', 'a']), ['a', 'c']);
  assert.deepEqual(amigos([], ['a']), []);
});

test('feed junta o que as pessoas andam jogando, do mais novo ao mais antigo', () => {
  const f = feed([
    { usuario: 'ana', nome: 'Ana', resumo: { recentes: [{ nome: 'Celeste', em: '2026-11-20' }, { nome: 'Hades', em: '2026-10-01' }] } },
    { usuario: 'bia', nome: '', resumo: { recentes: [{ nome: 'Balatro', em: '2026-11-22' }] } },
    { usuario: 'cai', resumo: null },
  ]);
  assert.deepEqual(f.map((x) => `${x.usuario}:${x.nome}`), ['bia:Balatro', 'ana:Celeste', 'ana:Hades']);
  assert.equal(f[0].nomePessoa, 'bia', 'sem nome, usa o @');
});

test('erros do banco em português e link do perfil', () => {
  assert.match(erroSocial({ code: '23505', message: 'duplicate key value' }), /já é de outra pessoa/);
  assert.match(erroSocial({ message: 'Failed to fetch' }), /internet/);
  assert.match(erroSocial({ code: 'PGRST205', message: "Could not find the table 'public.perfis' in the schema cache" }), /ainda não foi ligada/);
  assert.match(erroSocial({ code: '42501' }), /Entre na sua conta/);
  assert.equal(linkPerfil('samuel'), '#/amigos/@samuel');
});
