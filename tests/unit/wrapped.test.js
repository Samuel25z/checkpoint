import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estatisticas, anosDisponiveis, doAno, perfil } from '../../js/modules/wrapped/logic.js';
import { JOGOS } from '../../js/games.js';

const diario = [
  { nome: 'Hollow Knight', jogoId: 'hollow-knight', status: 'zerado', nota: 5, horas: 42, plataforma: 'PC', inicio: '2026-01-10', fim: '2026-03-02' },
  { nome: 'Hades', status: 'platinado', nota: 5, horas: 60, plataforma: 'Nintendo Switch', inicio: '2026-03-05', fim: '2026-03-30' },
  { nome: 'Celeste', jogoId: 'celeste', status: 'zerado', nota: 4.5, horas: 9.5, plataforma: 'PC', inicio: '2026-07-01', fim: '2026-07-04' },
  { nome: 'Elden Ring', jogoId: 'elden-ring', status: 'jogando', nota: null, horas: 80, plataforma: 'PC', inicio: '2026-09-01' },
  { nome: 'Cyberpunk 2077', jogoId: 'cyberpunk-2077', status: 'larguei', nota: 3, horas: 12, plataforma: 'PC', inicio: '2025-12-20', fim: null },
  { nome: 'Antigo', status: 'zerado', nota: 2, horas: 30, plataforma: 'PC', inicio: '2025-02-01', fim: '2025-03-01' },
  { nome: 'Balatro', status: 'quero', nota: null, horas: 0, criadoEm: '2026-05-01T10:00:00Z' }
];

test('pertencer ao ano e anos disponíveis', () => {
  assert.equal(doAno(diario[4], 2025), true);
  assert.equal(doAno(diario[4], 2026), false);
  assert.equal(doAno(diario[6], 2026), true);
  assert.deepEqual(anosDisponiveis(diario), [2026, 2025]);
});

test('números do ano batem com o diário', () => {
  const e = estatisticas(diario, 2026, JOGOS);
  assert.equal(e.jogos, 4, '"quero jogar" não conta como jogado');
  assert.equal(e.zerados, 3);
  assert.equal(e.platinados, 1);
  assert.equal(e.horas, 191.5);
  assert.equal(e.dias, 8);
  assert.equal(e.maisJogado.nome, 'Elden Ring');
  assert.equal(e.melhorNota.nome, 'Hades', 'empate em 5 → mais horas');
  assert.equal(e.mediaNotas, 4.8);
  assert.equal(e.plataforma, 'PC');
  assert.equal(e.mes, 'março');
  assert.equal(e.genero, 'Ação', 'Hollow Knight, Elden Ring e Hades têm Ação (3×)');
  assert.equal(e.capasZerados.length, 3);
});

test('ano sem nada não quebra', () => {
  const e = estatisticas(diario, 2020, JOGOS);
  assert.equal(e.jogos, 0);
  assert.equal(e.maisJogado, null);
  assert.equal(e.mes, null);
  assert.equal(e.mediaNotas, null);
});

test('períodos: até agora, últimos 30 dias, desde sempre e anos anteriores', async () => {
  const { periodos, lerPeriodo, rotuloPeriodo } = await import('../../js/modules/wrapped/logic.js');
  const agora = new Date('2026-07-10T12:00:00');
  const ps = periodos(diario, agora);
  assert.deepEqual(ps.map((p) => p.id), ['2026', '30-dias', 'tudo', '2025']);
  assert.equal(ps[0].rotulo, '2026 até agora');
  assert.equal(rotuloPeriodo(lerPeriodo('2026', agora), agora), 'Seu 2026 até agora');
  assert.equal(rotuloPeriodo(lerPeriodo('2025', agora), agora), 'Seu 2025');
  assert.equal(rotuloPeriodo(lerPeriodo('30-dias'), agora), 'Seus últimos 30 dias');
  assert.equal(rotuloPeriodo(lerPeriodo('tudo'), agora), 'Desde sempre');

  const trinta = estatisticas(diario, lerPeriodo('30-dias'), JOGOS, agora);
  assert.deepEqual([trinta.jogos, trinta.zerados], [1, 1], 'só Celeste (julho) está nos últimos 30 dias');
  const tudo = estatisticas(diario, lerPeriodo('tudo'), JOGOS, agora);
  assert.equal(tudo.jogos, 6, 'desde sempre: tudo menos "quero jogar"');
  assert.equal(tudo.zerados, 4);
  assert.equal(estatisticas(diario, 2026, JOGOS, agora).rotulo, 'Seu 2026 até agora', 'aceita o ano como antes');
});

test('última vez jogada (Steam) conta como atividade no período', async () => {
  const { lerPeriodo } = await import('../../js/modules/wrapped/logic.js');
  const e = estatisticas([{ nome: 'X', status: 'larguei', horas: 5, ultimaVez: '2026-07-01T10:00:00Z' }], lerPeriodo('30-dias'), [], new Date('2026-07-10T12:00:00'));
  assert.equal(e.jogos, 1);
});

test('perfil do card final', () => {
  assert.equal(perfil({ horas: 10, zerados: 1, platinados: 3, jogos: 3 }).titulo, 'Caçador de troféus');
  assert.equal(perfil({ horas: 400, zerados: 1, platinados: 0, jogos: 3 }).titulo, 'Maratonista');
  assert.equal(perfil({ horas: 1, zerados: 0, platinados: 0, jogos: 1 }).titulo, 'Jogador de fim de semana');
});
