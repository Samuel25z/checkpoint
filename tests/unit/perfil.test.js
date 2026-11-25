import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  lerPerfil, validarPerfil, iniciais, numeros, xp, nivel, medalhas, distribuicaoNotas, generos, radar, mapaAtividade, destaques, resumoDoAno, recentes, desde
} from '../../js/modules/perfil/logic.js';

const J = (id, nome, jogoId, status, nota, horas, extra = {}) => ({ id, nome, jogoId, status, nota, horas, plataforma: 'PC', criadoEm: '2026-05-10T10:00:00Z', atualizadoEm: `2026-11-0${id.charCodeAt(0) % 9 + 1}T10:00:00Z`, ...extra });
const diario = [
  J('a', 'Elden Ring', 'elden-ring', 'jogando', 5, 80, { inicio: '2026-11-20' }),
  J('b', 'Hollow Knight', 'hollow-knight', 'zerado', 5, 42, { inicio: '2026-02-01', fim: '2026-03-10', resenha: 'Obra-prima' }),
  J('c', 'Celeste', 'celeste', 'platinado', 4.5, 14, { inicio: '2026-04-01', fim: '2026-04-20', plataforma: 'Nintendo Switch' }),
  J('d', 'Balatro', 'balatro', 'zerado', 4, 60.4, { inicio: '2025-05-01', fim: '2025-06-02' }),
  J('e', 'Jogo Inventado', null, 'quero', null, 0),
];

test('perfil salvo: favoritos que sumiram do Diário são ignorados e a coroa cai no primeiro', () => {
  const p = lerPerfil({ nome: '  Samuel  ', favoritos: ['b', 'x', 'c', 'b'], coroado: 'x' }, diario);
  assert.deepEqual(p, { nome: 'Samuel', frase: '', favoritos: ['b', 'c'], coroado: 'b' });
  assert.deepEqual(lerPerfil(null, diario), { nome: '', frase: '', favoritos: [], coroado: null });
  assert.equal(lerPerfil({ favoritos: ['a', 'b', 'c', 'd', 'e', 'a'] }, diario).favoritos.length, 5);
});

test('validação do formulário', () => {
  assert.equal(validarPerfil({ nome: 'x'.repeat(41) }, diario).erros.nome, 'Use até 40 letras.');
  assert.equal(validarPerfil({ frase: 'y'.repeat(141) }, diario).erros.frase, 'Use até 140 letras.');
  assert.equal(validarPerfil({ favoritos: ['a', 'b', 'c', 'd', 'e', 'f'] }, diario).erros.favoritos, 'Escolha no máximo 5 favoritos.');
  const ok = validarPerfil({ nome: 'Ana', favoritos: ['c', 'a'], coroado: 'a' }, diario);
  assert.ok(ok.ok);
  assert.equal(ok.valor.coroado, 'a');
});

test('iniciais do avatar', () => {
  assert.equal(iniciais('Samuel Mota Ramos'), 'SR');
  assert.equal(iniciais('arthur'), 'AR');
  assert.equal(iniciais(''), 'CP');
});

test('números do topo', () => {
  assert.deepEqual(numeros(diario), { jogos: 5, finalizados: 3, platinados: 1, horas: 196, media: 4.6, avaliados: 4 });
  assert.equal(numeros([]).media, null);
});

test('XP e nível: a curva fica mais lenta e o título acompanha', () => {
  assert.equal(xp([]), 0);
  assert.equal(xp([J('z', 'X', null, 'platinado', 5, 10.9, { resenha: 'boa' })]), 10 + 40 + 60 + 10 + 5 + 15);
  assert.deepEqual(nivel(0), { nivel: 1, xp: 0, titulo: 'Novato', progresso: 0, faltam: 25 });
  assert.equal(nivel(25).nivel, 2);
  assert.equal(nivel(100).nivel, 3);
  assert.equal(nivel(2025).nivel, 10);
  assert.equal(nivel(2025).titulo, 'Explorador');
  assert.equal(nivel(30000).titulo, 'Lenda');
  const n = nivel(xp(diario));
  assert.ok(n.progresso >= 0 && n.progresso < 1);
});

test('medalhas: grau, progresso e grau máximo', () => {
  const m = Object.fromEntries(medalhas(diario).map((x) => [x.id, x]));
  assert.equal(m.platinador.grau, 'bronze');
  assert.equal(m.platinador.proximo, 5);
  assert.equal(m.maratonista.grau, 'bronze');
  assert.equal(m.colecionador.grau, null);
  assert.equal(m.colecionador.progresso, 0.5);
  const muitos = Array.from({ length: 20 }, (_, i) => J(`p${i}`, `J${i}`, null, 'platinado', 5, 0));
  const top = medalhas(muitos).find((x) => x.id === 'platinador');
  assert.equal(top.grau, 'ouro');
  assert.equal(top.proximo, null);
  assert.equal(top.progresso, 1);
});

test('notas, gêneros e radar', () => {
  const d = distribuicaoNotas(diario);
  assert.equal(d.length, 10);
  assert.equal(d.find((x) => x.nota === 5).quantos, 2);
  assert.equal(d.find((x) => x.nota === 4.5).quantos, 1);
  const g = generos(diario);
  assert.ok(g.length >= 3);
  assert.ok(g[0].jogos >= g.at(-1).jogos);
  const pts = radar(g);
  assert.equal(pts.length, g.length);
  assert.equal(pts[0].x, 100, 'o primeiro eixo aponta para cima');
  assert.equal(radar(g.slice(0, 2)), null, 'com menos de 3 gêneros não há radar');
});

test('mapa de atividade dos últimos 90 dias', () => {
  const hoje = new Date(2026, 10, 25);
  const mapa = mapaAtividade(diario, [{ quando: '2026-11-25T12:00:00' }, { quando: '2026-11-25T15:00:00' }], hoje);
  assert.equal(mapa.length, 91);
  assert.equal(mapa.at(-1).data, '2026-11-25');
  assert.equal(mapa.at(-1).quantos, 2);
  assert.equal(mapa.find((d) => d.data === '2026-11-20').quantos, 1, 'início do Elden Ring');
  assert.equal(mapa.filter((d) => d.quantos).length, 2, 'datas antigas ficam de fora');
});

test('destaques, resumo do ano, recentes e "desde"', () => {
  assert.deepEqual(destaques(diario), { plataforma: 'PC', media: 49, platinados: 20 });
  assert.deepEqual(destaques([]), { plataforma: null, media: null, platinados: 0 });
  assert.deepEqual(resumoDoAno(diario, 2026), { ano: 2026, jogos: 4, finalizados: 2, horas: 136 });
  assert.equal(recentes(diario, 2).length, 2);
  assert.equal(desde(diario), 'mai. de 2026');
  assert.equal(desde([]), null);
});
