// Lógica pura do Torneio: eliminação simples com byes, avanço, desfazer e campeão.

export const MIN = 4;
export const MAX = 32;

export function validarJogadores(nomes) {
  const lista = nomes.map((n) => String(n || '').trim()).filter(Boolean);
  if (lista.length < MIN) return { ok: false, erro: `Coloque pelo menos ${MIN} jogadores (um por linha).`, lista };
  if (lista.length > MAX) return { ok: false, erro: `O máximo é ${MAX} jogadores.`, lista };
  const vistos = new Set();
  for (const n of lista) {
    const k = n.toLowerCase();
    if (vistos.has(k)) return { ok: false, erro: `“${n}” aparece duas vezes. Use nomes diferentes.`, lista };
    vistos.add(k);
  }
  return { ok: true, erro: null, lista };
}

export function embaralhar(lista, aleatorio = Math.random) {
  const c = [...lista];
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(aleatorio() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c;
}

const proximaPotencia = (n) => 2 ** Math.ceil(Math.log2(n));

/** Nome de cada rodada a partir do total de rodadas. */
export function nomeRodada(indice, total) {
  const faltam = total - indice;
  if (faltam === 1) return 'Final';
  if (faltam === 2) return 'Semifinal';
  if (faltam === 3) return 'Quartas de final';
  if (faltam === 4) return 'Oitavas de final';
  return `Rodada ${indice + 1}`;
}

/**
 * Gera a chave. jogadores: [{ id, nome, foto? }]. Byes vão para os primeiros sorteados
 * e nunca há partida com dois lugares vazios.
 */
export function gerarChave(jogadores, aleatorio = Math.random) {
  const sorteio = embaralhar(jogadores, aleatorio);
  const tamanho = proximaPotencia(sorteio.length);
  const byes = tamanho - sorteio.length;
  const primeira = [];
  let k = 0;
  for (let i = 0; i < tamanho / 2; i++) {
    if (i < byes) primeira.push({ a: sorteio[k++].id, b: null, vencedor: null });
    else { primeira.push({ a: sorteio[k++].id, b: sorteio[k++].id, vencedor: null }); }
  }
  const rodadas = [primeira];
  for (let n = tamanho / 4; n >= 1; n /= 2) rodadas.push(Array.from({ length: n }, () => ({ a: null, b: null, vencedor: null })));
  let chave = { rodadas };
  // byes avançam sozinhos
  primeira.forEach((p, i) => { if (p.b === null) chave = definirVencedor(chave, 0, i, p.a); });
  return chave;
}

function copiar(chave) { return { ...chave, rodadas: chave.rodadas.map((r) => r.map((p) => ({ ...p }))) }; }

/** Limpa o resultado de uma partida e tudo que dependia dele nas rodadas seguintes. */
function limparAdiante(rodadas, r, i) {
  const p = rodadas[r][i];
  const saiu = p.vencedor;
  p.vencedor = null;
  if (r + 1 >= rodadas.length || saiu === null) return;
  const prox = rodadas[r + 1][Math.floor(i / 2)];
  const lado = i % 2 === 0 ? 'a' : 'b';
  if (prox[lado] === saiu) {
    if (prox.vencedor !== null) limparAdiante(rodadas, r + 1, Math.floor(i / 2));
    prox[lado] = null;
  }
}

/** Define quem venceu a partida i da rodada r e leva o vencedor para a próxima. */
export function definirVencedor(chave, r, i, jogadorId) {
  const c = copiar(chave);
  const p = c.rodadas[r]?.[i];
  if (!p || (jogadorId !== p.a && jogadorId !== p.b) || jogadorId === null) return chave;
  if (p.vencedor === jogadorId) return chave;
  if (p.vencedor !== null) limparAdiante(c.rodadas, r, i);
  p.vencedor = jogadorId;
  if (r + 1 < c.rodadas.length) c.rodadas[r + 1][Math.floor(i / 2)][i % 2 === 0 ? 'a' : 'b'] = jogadorId;
  return c;
}

/** Desfaz o resultado (e o que veio depois dele). Byes não se desfazem. */
export function desfazer(chave, r, i) {
  const p = chave.rodadas[r]?.[i];
  if (!p || p.vencedor === null || (r === 0 && p.b === null)) return chave;
  const c = copiar(chave);
  limparAdiante(c.rodadas, r, i);
  return c;
}

export function campeao(chave) {
  const final = chave.rodadas[chave.rodadas.length - 1][0];
  return final.vencedor;
}

/** Rodada atual (primeira com partida jogável sem vencedor). */
export function rodadaAtual(chave) {
  const i = chave.rodadas.findIndex((r) => r.some((p) => p.a !== null && p.b !== null && p.vencedor === null));
  return i === -1 ? chave.rodadas.length - 1 : i;
}
