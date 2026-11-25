import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizarDados, nesteDia, edicoes, rankingJogos, rankingEstudios, maisIndicadoSemVencer, montarFatos, fatoDoDia, sortear,
  tempoRun, textoAnosAtras, chaveDoDia, dataBR
} from '../../js/modules/almanaque/logic.js';
import { CURIOSIDADES } from '../../js/data/curiosidades.js';

const dados = normalizarDados({
  geradoEm: '2026-11-25',
  premios: [
    { id: 'tga', nome: 'The Game Awards', categoria: 'Jogo do Ano', url: 'u', anos: [
      { ano: 2026, vencedores: [], indicados: ['Q9'] },
      { ano: 2023, vencedores: ['Q1'], indicados: ['Q2', 'Q3', 'Q404'] },
      { ano: 2014, vencedores: ['Q4'], indicados: ['Q3'] },
    ] },
    { id: 'bafta', nome: 'BAFTA', categoria: 'Melhor Jogo', url: 'u', anos: [{ ano: 2024, vencedores: ['Q1'], indicados: ['Q3'] }] },
  ],
  jogos: {
    Q1: { nome: "Baldur's Gate 3", estudio: 'Larian Studios', steam: 1086940 }, Q2: { nome: 'Zelda TOTK', estudio: 'Nintendo EPD' },
    Q3: { nome: 'Alan Wake 2', estudio: 'Remedy' }, Q4: { nome: 'Dragon Age: Inquisition', estudio: 'BioWare' }, Q9: { nome: 'Jogo Novo' },
  },
  maisVendidos: { fonte: 'f', lista: [{ posicao: 1, nome: 'Tetris', vendas: 520, ano: 1988 }, { posicao: 2, nome: 'Minecraft', vendas: 425, ano: 2011 }, { posicao: 3, nome: 'Pac-Man', vendas: 43, ano: 1980 }] },
  maisJogados: { fonte: 's', semana: '2026-11-24', lista: [{ posicao: 1, steam: 730, nome: 'Counter-Strike 2', pico: 1070714 }] },
  lancamentos: { '11-25': [{ nome: 'Final Fight', ano: 1989, qid: 'Q10' }, { nome: 'Jogo do Futuro', ano: 2030, qid: 'Q11' }, { nome: 'Rayman Origins', ano: 2011, qid: 'Q12' }] },
});
const dia = new Date(2026, 10, 25);

test('dados quebrados ou ausentes viram a forma vazia (a tela nunca quebra)', () => {
  for (const d of [null, undefined, 'x', {}, { premios: 'x', jogos: null }]) {
    const n = normalizarDados(d);
    assert.deepEqual(n.premios, []);
    assert.deepEqual(n.maisVendidos.lista, []);
    assert.deepEqual(n.lancamentos, {});
  }
});

test('neste dia: só jogos já lançados, do mais antigo ao mais novo, com "há N anos"', () => {
  assert.equal(chaveDoDia(dia), '11-25');
  const l = nesteDia(dados, dia);
  assert.deepEqual(l.map((j) => j.nome), ['Final Fight', 'Rayman Origins']);
  assert.equal(l[0].anos, 37);
  assert.equal(textoAnosAtras(37), 'Há 37 anos');
  assert.equal(textoAnosAtras(1), 'Há 1 ano');
  assert.equal(textoAnosAtras(0), 'Neste ano');
  assert.deepEqual(nesteDia(dados, new Date(2026, 0, 1)), []);
});

test('edições: nomes no lugar dos códigos; jogo sem nome conhecido some', () => {
  const e = edicoes(dados, 'tga');
  assert.equal(e[0].ano, 2026);
  assert.deepEqual(e[0].vencedores, []);
  assert.deepEqual(e[1].indicados.map((i) => i.nome), ['Zelda TOTK', 'Alan Wake 2']);
  assert.deepEqual(edicoes(dados, 'nao-existe'), []);
});

test('rankings somam todos os prêmios', () => {
  const r = rankingJogos(dados);
  assert.equal(r[0].nome, "Baldur's Gate 3");
  assert.equal(r[0].vitorias, 2);
  assert.deepEqual(r[0].premios, ['The Game Awards', 'BAFTA']);
  assert.equal(rankingEstudios(dados)[0].estudio, 'Larian Studios');
  assert.deepEqual(maisIndicadoSemVencer(dados), { qid: 'Q3', nome: 'Alan Wake 2', indicacoes: 3 });
});

test('fatos: base escrita à mão + calculados, todos com título, texto e fonte', () => {
  const fatos = montarFatos(dados, CURIOSIDADES, dia);
  assert.ok(fatos.length >= CURIOSIDADES.length + 5);
  for (const f of fatos) for (const campo of ['id', 'capitulo', 'titulo', 'texto', 'fonte']) assert.ok(f[campo], `${f.id} sem ${campo}`);
  assert.equal(new Set(fatos.map((f) => f.id)).size, fatos.length, 'ids únicos');
  const texto = fatos.map((f) => f.texto).join(' ');
  assert.match(texto, /Tetris vendeu cerca de 520 milhões de cópias, à frente de Minecraft \(425 milhões\)/);
  assert.match(texto, /Em 2014, o primeiro Jogo do Ano do The Game Awards foi Dragon Age: Inquisition/);
  assert.match(texto, /Counter-Strike 2 chegou a 1\.070\.714 jogadores/);
  assert.match(texto, /Neste dia, em 1989, era lançado Final Fight/);
});

test('fato do dia é o mesmo o dia todo e muda de um dia para outro', () => {
  const fatos = montarFatos(dados, CURIOSIDADES, dia);
  const a = fatoDoDia(fatos, new Date(2026, 10, 25, 8));
  assert.equal(fatoDoDia(fatos, new Date(2026, 10, 25, 23)).id, a.id);
  const outros = new Set([...Array(10)].map((_, i) => fatoDoDia(fatos, new Date(2026, 10, 26 + i)).id));
  assert.ok(outros.size > 3, 'varia ao longo dos dias');
  assert.notEqual(a.capitulo, 'neste-dia');
  assert.equal(fatoDoDia([], dia), null);
});

test('"Me surpreenda" nunca repete o último', () => {
  const fatos = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  for (let i = 0; i < 30; i++) assert.notEqual(sortear(fatos, 'b').id, 'b');
  assert.equal(sortear([{ id: 'so' }], 'so').id, 'so', 'com um só, mostra ele mesmo');
  assert.equal(sortear([], 'x'), null);
  assert.equal(sortear(fatos, null, () => 0.99).id, 'c');
});

test('tempo de speedrun e datas', () => {
  assert.equal(tempoRun(294.299), '4:54.299');
  assert.equal(tempoRun(5714), '1:35:14');
  assert.equal(tempoRun(222), '3:42');
  assert.equal(tempoRun(0), '—');
  assert.equal(dataBR('2026-11-24'), '24/11/2026');
});

test('curiosidades escritas à mão: ids únicos e fonte com link', () => {
  assert.ok(CURIOSIDADES.length >= 20);
  assert.equal(new Set(CURIOSIDADES.map((c) => c.id)).size, CURIOSIDADES.length);
  for (const c of CURIOSIDADES) assert.match(c.fonte, /^https:\/\//, c.id);
});
