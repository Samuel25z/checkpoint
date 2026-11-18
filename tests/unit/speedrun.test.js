import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatarTempo, lerTempo, novaRun, iniciar, marcar, desfazer, reiniciar, decorrido, novaRota, deltas, trechos, somaMelhores, registrarRun } from '../../js/modules/speedrun/logic.js';

test('formata e lê tempos de speedrun', () => {
  assert.equal(formatarTempo(269340), '4:29.34');
  assert.equal(formatarTempo(3723450), '1:02:03.45');
  assert.equal(formatarTempo(500), '0.50');
  assert.equal(formatarTempo(1209, { sinal: true }), '+1.20');
  assert.equal(formatarTempo(-850, { sinal: true }), '−0.85');
  assert.equal(formatarTempo(999), '0.99', 'trunca em vez de arredondar');
  assert.equal(formatarTempo(null), '—');
  assert.equal(lerTempo('4:29.34'), 269340);
  assert.equal(lerTempo('1:02:03,45'), 3723450);
  assert.equal(lerTempo('abc'), null);
});

test('cronômetro: iniciar, marcar splits, terminar no último', () => {
  let r = novaRun(3);
  r = marcar(r, 1000); // espaço com cronômetro parado inicia
  assert.equal(r.estado, 'correndo');
  r = marcar(r, 3000);
  r = marcar(r, 6500);
  assert.equal(decorrido(r, 7000), 6000);
  r = marcar(r, 9000);
  assert.equal(r.estado, 'terminado');
  assert.deepEqual(r.tempos, [2000, 5500, 8000]);
  assert.equal(decorrido(r, 99999), 8000, 'tempo congela ao terminar');
  assert.equal(marcar(r, 10000), r, 'não marca depois de terminar');
});

test('desfazer split e reiniciar', () => {
  let r = iniciar(novaRun(2), 0);
  r = marcar(r, 100);
  r = marcar(r, 300);
  assert.equal(r.estado, 'terminado');
  r = desfazer(r);
  assert.equal(r.estado, 'correndo');
  assert.deepEqual(r.tempos, [100]);
  assert.deepEqual(reiniciar(r), novaRun(2));
  assert.equal(desfazer(novaRun(2)).estado, 'parado');
});

test('primeira run completa vira PB; run pior não substitui; incompleta só melhora trechos', () => {
  let rota = novaRota({ nome: 'Any%', splits: ['A', 'B'] });
  const run = (a, b) => ({ estado: 'terminado', tempos: [a, b] });

  let r = registrarRun(rota, run(1000, 3000));
  assert.equal(r.novoPB, true);
  rota = r.rota;
  assert.equal(rota.pbTotal, 3000);
  assert.deepEqual(rota.splits.map((s) => s.pb), [1000, 3000]);

  r = registrarRun(rota, run(900, 3200)); // pior no total, mas trecho A melhor
  assert.equal(r.novoPB, false);
  rota = r.rota;
  assert.equal(rota.pbTotal, 3000);
  assert.equal(rota.splits[0].melhor, 900);
  assert.equal(rota.splits[0].pb, 1000, 'PB não muda com run pior');

  r = registrarRun(rota, { estado: 'correndo', tempos: [800] }); // reset no meio
  rota = r.rota;
  assert.equal(r.novoPB, false);
  assert.equal(rota.splits[0].melhor, 800);
  assert.equal(rota.tentativas, 3);
  assert.equal(rota.concluidas, 2);

  assert.equal(somaMelhores(rota), 800 + 2000);
  assert.deepEqual(deltas(rota, [1100, 2900]), [100, -100]);
  assert.deepEqual(trechos([1000, 3000]), [1000, 2000]);
  assert.equal(registrarRun(rota, novaRun(2)).rota, rota, 'run parada não conta');
});

test('rota nova ignora splits vazios e sempre tem ao menos um', () => {
  assert.deepEqual(novaRota({ nome: ' ', splits: ['', '  '] }).splits.map((s) => s.nome), ['Fim']);
  assert.equal(novaRota({ nome: '' }).nome, 'Nova rota');
  assert.equal(novaRota({ nome: 'x', splits: ['a', 'b', ''] }).splits.length, 2);
});
