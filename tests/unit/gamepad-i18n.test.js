import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { acoesNovas, proximoFoco, BOTOES } from '../../js/core/gamepad.js';
import { EN, traduzir } from '../../js/core/i18n.js';
import { MODULOS } from '../../js/modules/registry.js';

const solto = (n = 16) => ({ botoes: Array(n).fill(false), eixos: [0, 0] });

test('botão só dispara ao ser apertado (não enquanto fica segurado)', () => {
  const a = solto(); const b = solto(); b.botoes[0] = true;
  assert.deepEqual(acoesNovas(a, b), ['confirmar']);
  assert.deepEqual(acoesNovas(b, b), []);
  const lb = solto(); lb.botoes[4] = true; lb.botoes[13] = true;
  assert.deepEqual(acoesNovas(a, lb).sort(), ['abaAnterior', 'baixo']);
  assert.equal(BOTOES[2], 'split');
});

test('analógico vira direção uma vez por empurrão', () => {
  const centro = solto();
  const direita = { ...solto(), eixos: [0.9, 0.1] };
  assert.deepEqual(acoesNovas(centro, direita), ['direita']);
  assert.deepEqual(acoesNovas(direita, direita), []);
  assert.deepEqual(acoesNovas(centro, { ...solto(), eixos: [0.3, -0.2] }), [], 'zona morta');
  assert.deepEqual(acoesNovas(centro, { ...solto(), eixos: [0, -0.8] }), ['cima']);
});

test('navegação espacial escolhe o vizinho mais alinhado', () => {
  const r = (id, x, y) => ({ id, x, y, w: 100, h: 40 });
  const atual = r('a', 0, 0);
  const lista = [atual, r('direita', 150, 0), r('diagonal', 120, 200), r('abaixo', 0, 80), r('longe', 0, 400)];
  assert.equal(proximoFoco(atual, lista, 'direita').id, 'direita');
  assert.equal(proximoFoco(atual, lista, 'baixo').id, 'abaixo');
  assert.equal(proximoFoco(atual, lista, 'cima'), null);
});

test('tradução: frases exatas, padrões e espaços preservados', () => {
  assert.equal(traduzir('Diário', 'en'), 'Journal');
  assert.equal(traduzir('  Adicionar jogo ', 'en'), '  Add game ');
  assert.equal(traduzir('6 de 32', 'en'), '6 of 32');
  assert.equal(traduzir('há 3 dias', 'en'), '3 days ago');
  assert.equal(traduzir('Diário', 'pt'), 'Diário');
  assert.equal(traduzir('Hollow Knight', 'en'), 'Hollow Knight', 'nome de jogo não muda');
});

test('dicionário completo: abas, títulos, subtítulos, estados vazios e rótulos têm inglês', () => {
  const faltando = [];
  for (const m of MODULOS) if (!EN[m.titulo]) faltando.push(m.titulo);
  for (const pasta of readdirSync('js/modules', { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const arq of readdirSync(`js/modules/${pasta.name}`).filter((f) => f.endsWith('.js'))) {
      const fonte = readFileSync(`js/modules/${pasta.name}/${arq}`, 'utf8');
      const achados = [
        ...[...fonte.matchAll(/cabecalho\('([^'`$]+)',\s*'([^'`$]+)'/g)].flatMap((x) => [x[1], x[2]]),
        ...[...fonte.matchAll(/(?:rotulo|titulo): '([^'`$]+)'/g)].map((x) => x[1]),
        ...[...fonte.matchAll(/vazio\(\{ titulo: '([^'`$]+)', texto: '([^'`$]+)'/g)].flatMap((x) => [x[1], x[2]])
      ];
      for (const t of achados) if (!EN[t] && !/^[\d\s.,:+-]+$/.test(t)) faltando.push(`${pasta.name}/${arq}: ${t}`);
    }
  }
  assert.deepEqual([...new Set(faltando)], []);
});
