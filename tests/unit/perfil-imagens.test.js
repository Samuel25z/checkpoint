import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tipoPorAssinatura, validarLink, tamanhoDataUrl, decidirArquivo, lerImagens, LIMITES } from '../../js/modules/perfil/imagens.js';

const bytes = (...partes) => new Uint8Array(partes.flatMap((p) => (typeof p === 'string' ? [...p].map((c) => c.charCodeAt(0)) : p)));

test('tipo pela assinatura do arquivo, não pela extensão', () => {
  assert.equal(tipoPorAssinatura(bytes('GIF89a', [0, 0])), 'image/gif');
  assert.equal(tipoPorAssinatura(bytes([0x89], 'PNG', [13, 10])), 'image/png');
  assert.equal(tipoPorAssinatura(bytes([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg');
  assert.equal(tipoPorAssinatura(bytes('RIFF', [0, 0, 0, 0], 'WEBP')), 'image/webp');
  assert.equal(tipoPorAssinatura(bytes('<svg xmlns')), null, 'SVG recusado');
  assert.equal(tipoPorAssinatura(bytes('MZ', [0, 0])), null, 'executável recusado');
});

test('links: só https, sem SVG', () => {
  assert.deepEqual(validarLink(' https://media.giphy.com/media/abc/giphy.gif '), { ok: true, url: 'https://media.giphy.com/media/abc/giphy.gif' });
  assert.equal(validarLink('http://site.com/a.gif').ok, false);
  assert.equal(validarLink('javascript:alert(1)').ok, false);
  assert.equal(validarLink('data:image/gif;base64,AAA').ok, false);
  assert.equal(validarLink('https://site.com/logo.svg').ok, false);
  assert.equal(validarLink('').erro, 'Cole o link da imagem.');
  assert.equal(validarLink('nada a ver').ok, false);
});

test('tamanho de um data URL', () => {
  assert.equal(tamanhoDataUrl('data:image/gif;base64,QUJD'), 3);
  assert.equal(tamanhoDataUrl('data:image/gif;base64,QUI='), 2);
  assert.equal(tamanhoDataUrl('data:image/gif;base64,QQ=='), 1);
});

test('decidir: GIF guarda se couber, foto reduz, resto recusa', () => {
  assert.equal(decidirArquivo('avatar', 'image/gif', 150 * 1024).acao, 'guardar');
  const grande = decidirArquivo('avatar', 'image/gif', 300 * 1024);
  assert.equal(grande.acao, 'recusar');
  assert.match(grande.erro, /300 KB.*200 KB.*link/);
  assert.equal(decidirArquivo('banner', 'image/gif', 400 * 1024).acao, 'guardar');
  assert.equal(decidirArquivo('banner', 'image/png', 8 * 1024 * 1024).acao, 'reduzir');
  assert.equal(decidirArquivo('banner', null, 10).acao, 'recusar');
});

test('pacote salvo: descarta o que não é seguro ou passa do limite', () => {
  const gifPequeno = 'data:image/gif;base64,' + 'A'.repeat(400);
  const gifGigante = 'data:image/gif;base64,' + 'A'.repeat(Math.ceil((LIMITES.avatar + 10) * 4 / 3));
  assert.deepEqual(lerImagens({ avatar: { origem: 'arquivo', url: gifPequeno }, banner: { origem: 'link', url: 'https://i.imgur.com/x.gif' } }),
    { avatar: { origem: 'arquivo', url: gifPequeno }, banner: { origem: 'link', url: 'https://i.imgur.com/x.gif' } });
  assert.deepEqual(lerImagens({ avatar: { origem: 'arquivo', url: gifGigante } }), {});
  assert.deepEqual(lerImagens({ avatar: { origem: 'arquivo', url: 'data:image/svg+xml;base64,PHN2Zz4=' } }), {});
  assert.deepEqual(lerImagens({ banner: { origem: 'link', url: 'http://x.com/a.gif' } }), {});
  assert.deepEqual(lerImagens(null), {});
});

test('o pacote máximo (foto + banner em GIF) cabe no limite de 1 MB do banco', () => {
  const base64 = (n) => Math.ceil(n / 3) * 4;
  assert.ok(base64(LIMITES.avatar) + base64(LIMITES.banner) + 500 < 1024 * 1024);
});
