import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VERIFICADOS, normalizarRepo, ativo, consultaVerificados, consultaBusca, ordenarProjetos, versaoNova, suspeito, tempoRelativo, formatarEstrelas } from '../../js/modules/recomps/logic.js';
import { criarGitHub, LimiteGitHub } from '../../js/services/github.js';
import { criarStorage, memoria } from '../../js/storage.js';

const AGORA = Date.parse('2026-11-18T12:00:00Z');
const item = (full_name, pushed_at, extra = {}) => ({ full_name, name: full_name.split('/')[1], html_url: `https://github.com/${full_name}`, stargazers_count: 10, pushed_at, ...extra });

test('normaliza repositório e marca verificados com jogo e console', () => {
  const p = normalizarRepo(item('Zelda64Recomp/Zelda64Recomp', '2026-09-25T00:00:00Z', { stargazers_count: 7736 }), AGORA);
  assert.equal(p.verificado, true);
  assert.equal(p.jogo, "The Legend of Zelda: Majora's Mask");
  assert.equal(p.precisaRom, true);
  assert.equal(p.ativo, true);
  assert.equal(p.releases, 'https://github.com/Zelda64Recomp/Zelda64Recomp/releases');
  const outro = normalizarRepo(item('fulano/coisa', '2024-01-01T00:00:00Z'), AGORA);
  assert.equal(outro.verificado, false);
  assert.equal(outro.ativo, false);
  assert.equal(outro.precisaRom, null);
});

test('regra de ativo: mexido nos últimos 6 meses', () => {
  assert.equal(ativo('2026-06-01T00:00:00Z', AGORA), true);
  assert.equal(ativo('2026-04-01T00:00:00Z', AGORA), false);
  assert.equal(ativo(null, AGORA), false);
});

test('consultas: uma só para todos os verificados; busca com termos de recomp', () => {
  assert.equal(consultaVerificados().split(' ').length, VERIFICADOS.length);
  assert.match(consultaBusca('Zelda'), /^Zelda \(recomp OR decomp/);
  assert.equal(consultaBusca('   '), '');
  assert.equal(consultaBusca('<script>'), 'script (recomp OR decomp OR decompilation OR port)');
});

test('ordena verificados primeiro; detecta versão nova só para projeto seguido', () => {
  const l = ordenarProjetos([{ verificado: false, estrelas: 9000 }, { verificado: true, estrelas: 10 }]);
  assert.equal(l[0].verificado, true);
  assert.equal(versaoNova({ 'a/b': 'v1.0' }, 'a/b', 'v1.1'), true);
  assert.equal(versaoNova({ 'a/b': 'v1.1' }, 'a/b', 'v1.1'), false);
  assert.equal(versaoNova({}, 'a/b', 'v1.1'), false);
  assert.equal(versaoNova({ 'a/b': null }, 'a/b', 'v1.1'), false);
});

test('promessa de jogo recente não verificado é marcada como suspeita', () => {
  assert.equal(suspeito({ verificado: false, nome: 'totk-pc-recomp', descricao: '' }), true);
  assert.equal(suspeito({ verificado: false, nome: 'x', descricao: 'Donkey Kong Bananza PC download' }), true);
  assert.equal(suspeito({ verificado: true, nome: 'totk', descricao: '' }), false);
  assert.equal(suspeito({ verificado: false, nome: 'oot', descricao: 'Ocarina decompilation' }), false);
});

test('textos de tempo e estrelas', () => {
  assert.equal(tempoRelativo('2026-11-15T12:00:00Z', AGORA), 'há 3 dias');
  assert.equal(tempoRelativo('2026-08-01T12:00:00Z', AGORA), 'há 3 meses');
  assert.equal(tempoRelativo('2024-08-01T12:00:00Z', AGORA), 'há 2 anos');
  assert.equal(formatarEstrelas(7736), '7,7 mil');
  assert.equal(formatarEstrelas(17807), '18 mil');
  assert.equal(formatarEstrelas(929), '929');
});

test('serviço: cache de 1h, limite da API vira erro claro, sem rede usa cache antigo', async () => {
  const storage = criarStorage(memoria());
  let t = 0; let chamadas = 0; let modo = 'ok';
  const buscar = async () => {
    chamadas++;
    if (modo === 'offline') throw new Error('offline');
    if (modo === 'limite') return { status: 403, ok: false, headers: { get: () => '1800000000' } };
    return { status: 200, ok: true, json: async () => ({ items: [item('a/b', '2026-01-01')] }) };
  };
  const gh = criarGitHub({ storage, buscar, agora: () => t });
  assert.equal((await gh.buscarRepos('x')).length, 1);
  await gh.buscarRepos('x');
  assert.equal(chamadas, 1);
  t = 2 * 60 * 60 * 1000; modo = 'offline';
  assert.equal((await gh.buscarRepos('x')).length, 1, 'usa cache antigo sem rede');
  modo = 'limite';
  await assert.rejects(() => gh.buscarRepos('nova consulta'), LimiteGitHub);
});
