import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarJogadores, gerarChave, definirVencedor, desfazer, campeao, nomeRodada, rodadaAtual } from '../../js/modules/torneio/logic.js';

const jogadores = (n) => Array.from({ length: n }, (_, i) => ({ id: 'j' + i, nome: 'Jogador ' + i }));
const semSorte = () => 0.5;

function jogarTudo(chave, escolher = (p) => p.a) {
  let c = chave;
  for (let r = 0; r < c.rodadas.length; r++) {
    c.rodadas[r].forEach((p, i) => { if (p.vencedor === null && p.a && p.b) c = definirVencedor(c, r, i, escolher(p)); });
  }
  return c;
}

test('valida quantidade e nomes repetidos', () => {
  assert.equal(validarJogadores(['a', 'b', 'c']).ok, false);
  assert.equal(validarJogadores(['a', 'b', 'c', 'A']).erro, '“A” aparece duas vezes. Use nomes diferentes.');
  assert.equal(validarJogadores(Array.from({ length: 33 }, (_, i) => 'p' + i)).ok, false);
  assert.deepEqual(validarJogadores([' a ', '', 'b', 'c', 'd']).lista, ['a', 'b', 'c', 'd']);
});

test('de 4 a 32 jogadores: chave consistente, sem partida vazia e todos chegam a um campeão', () => {
  for (let n = 4; n <= 32; n++) {
    const chave = gerarChave(jogadores(n), semSorte);
    const primeira = chave.rodadas[0];
    assert.equal(primeira.length * 2, 2 ** Math.ceil(Math.log2(n)));
    assert.ok(primeira.every((p) => p.a !== null), `n=${n}: partida sem jogador`);
    const ids = primeira.flatMap((p) => [p.a, p.b]).filter(Boolean);
    assert.equal(new Set(ids).size, n, `n=${n}: todos os jogadores uma vez`);
    const final = jogarTudo(chave);
    assert.ok(campeao(final), `n=${n}: sem campeão`);
    assert.equal(final.rodadas.at(-1)[0].vencedor, campeao(final));
  }
});

test('byes avançam sozinhos e não se desfazem', () => {
  const c = gerarChave(jogadores(6), semSorte);
  const byes = c.rodadas[0].filter((p) => p.b === null);
  assert.equal(byes.length, 2);
  assert.ok(byes.every((p) => p.vencedor === p.a));
  const i = c.rodadas[0].indexOf(byes[0]);
  assert.equal(desfazer(c, 0, i), c);
  assert.ok(c.rodadas[1].some((p) => p.a === byes[0].a || p.b === byes[0].a));
});

test('trocar o vencedor de uma partida apaga o que dependia dela', () => {
  let c = gerarChave(jogadores(4), semSorte);
  const [p0] = c.rodadas[0];
  c = definirVencedor(c, 0, 0, p0.a);
  c = definirVencedor(c, 0, 1, c.rodadas[0][1].a);
  c = definirVencedor(c, 1, 0, p0.a);
  assert.equal(campeao(c), p0.a);
  c = definirVencedor(c, 0, 0, p0.b); // muda o resultado da semifinal
  assert.equal(campeao(c), null);
  assert.equal(c.rodadas[1][0].a, p0.b);
  c = desfazer(c, 0, 0);
  assert.equal(c.rodadas[0][0].vencedor, null);
  assert.equal(c.rodadas[1][0].a, null);
});

test('não aceita vencedor que não está na partida e não altera a chave original', () => {
  const c = gerarChave(jogadores(4), semSorte);
  assert.equal(definirVencedor(c, 0, 0, 'intruso'), c);
  const d = definirVencedor(c, 0, 0, c.rodadas[0][0].a);
  assert.notEqual(d, c);
  assert.equal(c.rodadas[0][0].vencedor, null);
});

test('nomes das rodadas e rodada atual', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((i) => nomeRodada(i, 5)), ['Rodada 1', 'Oitavas de final', 'Quartas de final', 'Semifinal', 'Final']);
  const c = gerarChave(jogadores(4), semSorte);
  assert.equal(rodadaAtual(c), 0);
  assert.equal(rodadaAtual(jogarTudo(c)), 1);
});
