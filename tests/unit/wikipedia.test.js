import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarWikipedia, converterBusca, limparTitulo } from '../../js/services/wikipedia.js';

const resposta = {
  query: {
    pages: {
      2: { pageid: 2, index: 2, title: 'Hornet (Hollow Knight)', extract: 'Hornet is a fictional character in the video game Hollow Knight.', thumbnail: { source: 'https://x/h.png' } },
      1: { pageid: 1, index: 1, title: 'Hollow Knight', extract: 'Hollow Knight is a 2017 Metroidvania video game developed by Team Cherry.', thumbnail: { source: 'https://upload.wikimedia.org/hk.jpg?utm=1' }, langlinks: [{ lang: 'pt', '*': 'Hollow Knight' }] },
      3: { pageid: 3, index: 3, title: 'Music of Hollow Knight', extract: 'The music of the game...' },
      4: { pageid: 4, index: 4, title: 'Celeste (video game)', extract: 'Celeste is a 2018 platform game.' },
      5: { pageid: 5, index: 5, title: 'Hollow Knight: Silksong pre-release community', extract: 'A community formed around the game.' }
    }
  }
};

test('converte a busca em jogos, com capa limpa, ano e título em português', () => {
  const r = converterBusca(resposta);
  assert.deepEqual(r.map((x) => x.titulo), ['Hollow Knight', 'Celeste']);
  assert.equal(r[0].capa, 'https://upload.wikimedia.org/hk.jpg');
  assert.equal(r[0].ano, 2017);
  assert.equal(r[0].tituloPt, 'Hollow Knight');
  assert.equal(r[1].capa, null);
});

test('limpa o sufixo (video game) do título', () => {
  assert.equal(limparTitulo('Hades (2020 video game)'), 'Hades');
  assert.equal(limparTitulo('Hades'), 'Hades');
});

test('pede capas não livres (pilicense=any), usa cache e ignora termo curto', async () => {
  const urls = [];
  const w = criarWikipedia({ buscar: async (u) => { urls.push(u); return resposta; } });
  assert.deepEqual(await w.pesquisar('h'), []);
  await w.pesquisar('Hollow Knight');
  await w.pesquisar('hollow knight');
  assert.equal(urls.length, 1);
  assert.match(urls[0], /pilicense=any/);
  assert.match(urls[0], /origin=\*/);
});

test('falha de rede é propagada para a tela tratar (sem quebrar o cache)', async () => {
  let vezes = 0;
  const w = criarWikipedia({ buscar: async () => { vezes++; throw new Error('offline'); } });
  await assert.rejects(() => w.pesquisar('Celeste'), /offline/);
  await assert.rejects(() => w.pesquisar('Celeste'), /offline/);
  assert.equal(vezes, 2);
});

test('resumo prefere o artigo em português', async () => {
  const w = criarWikipedia({ buscar: async (u) => u.includes('pt.wikipedia')
    ? { query: { pages: { 9: { extract: 'Hollow Knight é um jogo eletrônico.' } } } }
    : { query: { pages: { 1: { extract: 'Hollow Knight is a game.', langlinks: [{ '*': 'Hollow Knight' }] } } } } });
  assert.equal(await w.resumo('Hollow Knight'), 'Hollow Knight é um jogo eletrônico.');
});
