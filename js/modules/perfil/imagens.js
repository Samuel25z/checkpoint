// Foto e banner do perfil: regras puras (testadas) + redução de foto no navegador.
// Arquivo vira "data URL" guardado no perfil; link guarda só o endereço (não pesa para ninguém).

export const CHAVE_IMAGENS = 'perfil:imagens';

/** Limites para GIF (não dá para reduzir sem perder a animação). Fotos são reduzidas e ficam bem abaixo disso. */
export const LIMITES = { avatar: 200 * 1024, banner: 450 * 1024 };
/** Tamanho final das fotos reduzidas. */
export const DIMENSOES = { avatar: { w: 256, h: 256 }, banner: { w: 1500, h: 500 } };

/** Descobre o tipo pela assinatura (primeiros bytes), não pela extensão. Só imagens seguras. */
export function tipoPorAssinatura(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const txt = (i, n) => String.fromCharCode(...b.slice(i, i + n));
  if (txt(0, 4) === 'GIF8') return 'image/gif';
  if (b[0] === 0x89 && txt(1, 3) === 'PNG') return 'image/png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (txt(0, 4) === 'RIFF' && txt(8, 4) === 'WEBP') return 'image/webp';
  return null;
}

/** Link aceito: só https, sem espaços, até 1000 caracteres. */
export function validarLink(texto) {
  const t = String(texto || '').trim();
  if (!t) return { ok: false, erro: 'Cole o link da imagem.' };
  if (t.length > 1000) return { ok: false, erro: 'Esse link é grande demais.' };
  let url;
  try { url = new URL(t); } catch { return { ok: false, erro: 'Isso não parece um link. Ele começa com https://' }; }
  if (url.protocol !== 'https:') return { ok: false, erro: 'Use um link seguro, que começa com https://' };
  if (/\.svg(\?|#|$)/i.test(url.pathname)) return { ok: false, erro: 'Imagens SVG não são aceitas. Use GIF, PNG, JPG ou WebP.' };
  return { ok: true, url: url.href };
}

/** Tamanho em bytes do conteúdo de um data URL (base64). */
export function tamanhoDataUrl(dataUrl) {
  const b64 = String(dataUrl).split(',')[1] || '';
  return Math.floor((b64.length * 3) / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);
}

export const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

/**
 * Decide o que fazer com um arquivo escolhido: { acao: 'reduzir' | 'guardar' | 'recusar', tipo, erro? }.
 * GIF é guardado como está (se couber); foto estática é reduzida; o resto é recusado.
 */
export function decidirArquivo(alvo, tipo, tamanho) {
  if (!tipo) return { acao: 'recusar', erro: 'Esse arquivo não é uma imagem aceita. Use GIF, PNG, JPG ou WebP.' };
  if (tipo === 'image/gif') {
    if (tamanho > LIMITES[alvo]) return { acao: 'recusar', tipo, erro: `Esse GIF tem ${kb(tamanho)} e o limite para ${alvo === 'avatar' ? 'a foto' : 'o banner'} é ${kb(LIMITES[alvo])}. Para GIF maior, use a opção de link (Giphy, Tenor, Imgur).` };
    return { acao: 'guardar', tipo };
  }
  if (tamanho > 25 * 1024 * 1024) return { acao: 'recusar', tipo, erro: 'Essa imagem é grande demais (mais de 25 MB).' };
  return { acao: 'reduzir', tipo };
}

/** Lê o pacote salvo, sempre na mesma forma, descartando o que não for seguro. */
export function lerImagens(salvo) {
  const limpo = {};
  for (const alvo of ['avatar', 'banner']) {
    const i = salvo?.[alvo];
    if (!i || typeof i.url !== 'string') continue;
    if (i.origem === 'link' && validarLink(i.url).ok) limpo[alvo] = { origem: 'link', url: i.url };
    if (i.origem === 'arquivo' && /^data:image\/(gif|png|jpeg|webp);base64,/.test(i.url) && tamanhoDataUrl(i.url) <= LIMITES[alvo]) limpo[alvo] = { origem: 'arquivo', url: i.url };
  }
  return limpo;
}

/* ---------- só no navegador ---------- */

export const lerComoDataUrl = (arquivo) => new Promise((ok, falha) => {
  const r = new FileReader();
  r.onload = () => ok(r.result);
  r.onerror = () => falha(r.error);
  r.readAsDataURL(arquivo);
});

/** Reduz e recorta (cobrindo a área, como object-fit: cover) para WebP. */
export async function reduzir(arquivo, alvo) {
  const { w, h } = DIMENSOES[alvo];
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.max(w / bitmap.width, h / bitmap.height);
  const sw = w / escala, sh = h / escala;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, (bitmap.width - sw) / 2, (bitmap.height - sh) / 2, sw, sh, 0, 0, w, h);
  bitmap.close?.();
  for (const q of [0.82, 0.7, 0.55]) {
    const url = canvas.toDataURL('image/webp', q);
    if (url.startsWith('data:image/webp') && tamanhoDataUrl(url) <= LIMITES[alvo]) return url;
    const jpg = canvas.toDataURL('image/jpeg', q);
    if (tamanhoDataUrl(jpg) <= LIMITES[alvo]) return jpg;
  }
  throw new Error('não coube');
}

/** Confere se o link abre como imagem (até 8 s). */
export const linkAbre = (url) => new Promise((ok) => {
  const i = new Image();
  const t = setTimeout(() => ok(false), 8000);
  i.onload = () => { clearTimeout(t); ok(i.naturalWidth > 0); };
  i.onerror = () => { clearTimeout(t); ok(false); };
  i.referrerPolicy = 'no-referrer';
  i.src = url;
});

/** Processa o arquivo escolhido e devolve { url } ou { erro }. */
export async function prepararArquivo(arquivo, alvo) {
  const cabeca = new Uint8Array(await arquivo.slice(0, 16).arrayBuffer());
  const tipo = tipoPorAssinatura(cabeca);
  const d = decidirArquivo(alvo, tipo, arquivo.size);
  if (d.acao === 'recusar') return { erro: d.erro };
  try {
    if (d.acao === 'guardar') return { url: await lerComoDataUrl(arquivo) };
    return { url: await reduzir(arquivo, alvo) };
  } catch {
    return { erro: 'Não deu para ler essa imagem. Tente outra.' };
  }
}
