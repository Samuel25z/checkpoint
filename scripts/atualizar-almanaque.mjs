// atualizar-almanaque.mjs — monta js/data/almanaque.json com dados abertos que se atualizam:
//   prêmios de Jogo do Ano (Wikidata), mais vendidos (Wikipedia), mais jogados (Steam) e lançamentos por dia (Wikidata).
// Uso: node scripts/atualizar-almanaque.mjs   (o GitHub Actions roda toda semana)
// Se uma fonte falhar, mantém aquela parte do arquivo anterior: nunca grava vazio por cima de dado bom.
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const PREMIOS = [
  { id: 'tga', qid: 'Q78762377', nome: 'The Game Awards', categoria: 'Jogo do Ano', url: 'https://www.wikidata.org/wiki/Q78762377' },
  { id: 'bafta', qid: 'Q16969671', nome: 'BAFTA Games Awards', categoria: 'Melhor Jogo', url: 'https://www.wikidata.org/wiki/Q16969671' },
  { id: 'gdc', qid: 'Q24956138', nome: 'Game Developers Choice Awards', categoria: 'Jogo do Ano', url: 'https://www.wikidata.org/wiki/Q24956138' },
  { id: 'dice', qid: 'Q56033669', nome: 'D.I.C.E. Awards', categoria: 'Jogo do Ano', url: 'https://www.wikidata.org/wiki/Q56033669' },
];
const SPARQL = 'https://query.wikidata.org/sparql';
const AGENTE = 'CheckpointAlmanaque/1.0 (https://github.com/Samuel25z/checkpoint)';
const URL_VENDAS = 'https://en.wikipedia.org/wiki/List_of_best-selling_video_games';
const POR_DIA = 8;
// Programas que a Steam conta como jogo mas não são (aparecem no ranking de mais usados).
const NAO_JOGOS = new Set([431960 /* Wallpaper Engine */, 2923300 /* Banana (clicador de ganhar item) */]);

const qid = (uri) => String(uri).split('/').pop();
const ehCodigo = (t) => /^Q\d+$/.test(t || '');

/* ---------- conversores puros (testados sem internet) ---------- */

/** Linhas do SPARQL de um prêmio → [{ ano, vencedores:[qid], indicados:[qid] }], do mais novo ao mais antigo. */
export function converterPremio(bindings) {
  const anos = new Map();
  for (const b of bindings) {
    const ano = Number(b.ano?.value);
    if (!ano) continue;
    const a = anos.get(ano) || { ano, vencedores: new Set(), indicados: new Set() };
    const j = qid(b.jogo.value);
    if (b.tipo.value === 'v') a.vencedores.add(j); else a.indicados.add(j);
    anos.set(ano, a);
  }
  return [...anos.values()].sort((x, y) => y.ano - x.ano).map((a) => ({
    ano: a.ano, vencedores: [...a.vencedores].sort(), indicados: [...a.indicados].filter((j) => !a.vencedores.has(j)).sort()
  }));
}

/** Linhas do SPARQL de detalhes → { qid: { nome, steam?, estudio?, ano?, links } }. Nome em português, senão inglês ou multilíngue. */
export function converterJogos(bindings) {
  const jogos = {};
  for (const b of bindings) {
    const id = qid(b.jogo.value);
    const j = jogos[id] || (jogos[id] = {});
    const nome = b.jogoLabel?.value;
    if (nome && !ehCodigo(nome)) j.nome = j.nome || nome;
    if (b.steam?.value && !j.steam) j.steam = Number(b.steam.value) || undefined;
    if (b.devLabel?.value && !ehCodigo(b.devLabel.value)) j.estudio = j.estudio || b.devLabel.value;
    if (b.ano?.value) j.ano = Math.min(j.ano || 9999, Number(b.ano.value));
    if (b.links?.value) j.links = Number(b.links.value);
  }
  for (const [id, j] of Object.entries(jogos)) if (!j.nome) delete jogos[id];
  return jogos;
}

const limpar = (c) => c.replace(/<sup.*?<\/sup>/gs, '').replace(/<[^>]+>/g, '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
  .replace(/[\s\u200a\u2009\u00a0]+/g, ' ').trim();

/** HTML da lista da Wikipedia → [{ posicao, nome, vendas (milhões), serie, ano, empresa }]. Empates herdam a posição anterior. */
export function converterVendas(html, limite = 25) {
  const tabela = html.match(/<table class="[^"]*wikitable.*?<\/table>/s)?.[0];
  if (!tabela) return [];
  const lista = [];
  let posicao = 0;
  for (const linha of tabela.match(/<tr.*?<\/tr>/gs).slice(1)) {
    const c = [...linha.matchAll(/<t[hd][^>]*>(.*?)<\/t[hd]>/gs)].map((m) => limpar(m[1]));
    if (c.length < 5) continue;
    if (/^\d+$/.test(c[0])) { posicao = Number(c[0]); c.shift(); }
    const [nome, vendas, serie, , ano, empresa] = c;
    const v = Number(String(vendas).replace(',', ''));
    if (!nome || !v) continue;
    lista.push({ posicao, nome, vendas: v, serie: serie === 'None' ? null : serie, ano: Number(ano) || null, empresa: empresa || null });
    if (lista.length >= limite) break;
  }
  return lista;
}

/** Ranking da Steam + nomes { appid: nome } → [{ posicao, steam, nome, pico }]. */
export function converterMaisJogados(ranks, nomes, limite = 15) {
  return ranks.filter((r) => nomes[r.appid]).slice(0, limite).map((r, i) => ({ posicao: i + 1, steam: r.appid, nome: nomes[r.appid], pico: r.peak_in_game }));
}

/** Lançamentos do Wikidata → { "MM-DD": [{ nome, ano, qid }] }, a data mais antiga de cada jogo, os mais famosos primeiro. */
export function converterLancamentos(bindings, porDia = POR_DIA) {
  const jogos = new Map();
  for (const b of bindings) {
    const id = qid(b.jogo.value);
    const nome = b.jogoLabel?.value;
    if (!nome || ehCodigo(nome)) continue;
    const data = b.data.value.slice(0, 10);
    const atual = jogos.get(id);
    if (!atual || data < atual.data) jogos.set(id, { qid: id, nome, data, links: Number(b.links?.value || 0) });
  }
  const dias = {};
  for (const j of jogos.values()) (dias[j.data.slice(5)] ||= []).push(j);
  for (const d of Object.keys(dias)) {
    dias[d] = dias[d].sort((a, b) => b.links - a.links || a.nome.localeCompare(b.nome)).slice(0, porDia).map((j) => ({ nome: j.nome, ano: Number(j.data.slice(0, 4)), qid: j.qid }));
  }
  return Object.fromEntries(Object.entries(dias).sort(([a], [b]) => a.localeCompare(b)));
}

/* ---------- consultas ---------- */

const consultaPremio = (q) => `SELECT ?jogo ?tipo ?ano WHERE {
  { ?jogo p:P166 ?s . ?s ps:P166 wd:${q} . BIND("v" AS ?tipo) } UNION { ?jogo p:P1411 ?s . ?s ps:P1411 wd:${q} . BIND("i" AS ?tipo) }
  OPTIONAL { ?s pq:P585 ?d } BIND(YEAR(?d) AS ?ano) }`;
// Nomes pelo serviço de rótulos (pt, en e "mul", o rótulo multilíngue que o Wikidata passou a usar).
// Só entram itens que são jogo eletrônico (Q7889) ou subclasse: prêmio dado a pessoa ou estúdio fica de fora.
const consultaJogos = (ids) => `SELECT ?jogo ?jogoLabel ?steam ?devLabel ?ano ?links WHERE {
  VALUES ?jogo { ${ids.map((i) => `wd:${i}`).join(' ')} }
  FILTER EXISTS { ?jogo wdt:P31/wdt:P279* wd:Q7889 }
  OPTIONAL { ?jogo wdt:P1733 ?steam }
  OPTIONAL { ?jogo wdt:P178 ?dev }
  OPTIONAL { ?jogo wdt:P577 ?data BIND(YEAR(?data) AS ?ano) }
  OPTIONAL { ?jogo wikibase:sitelinks ?links }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en,mul". } }`;
// Um mês por consulta: tudo de uma vez passa dos 60 s do Wikidata e a resposta vem cortada no meio.
const consultaLancamentos = (mes) => `SELECT ?jogo ?jogoLabel ?data ?links WHERE {
  ?jogo wdt:P31 wd:Q7889; wikibase:sitelinks ?links . FILTER(?links >= 12)
  ?jogo p:P577/psv:P577 [ wikibase:timeValue ?data; wikibase:timePrecision 11 ] . FILTER(MONTH(?data) = ${mes})
  SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en,mul". } }`;

/** JSON.parse que aguenta caractere de controle cru (quebra de linha, tab) DENTRO de texto — alguns rótulos do Wikidata vêm assim. */
export function lerJsonTolerante(texto) {
  let saida = '', dentro = false, escape = false;
  for (const c of texto) {
    if (dentro) {
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === '"') dentro = false;
      else if (c < ' ') { saida += ' '; continue; }
    } else if (c === '"') dentro = true;
    saida += c;
  }
  return JSON.parse(saida);
}

let ESPERA = 5000; // pausa entre tentativas (os testes zeram)

async function sparql(consulta, tentativas = 3) {
  for (let t = 1; ; t++) {
    try {
      const r = await fetch(`${SPARQL}?query=${encodeURIComponent(consulta)}`, { headers: { Accept: 'application/sparql-results+json', 'User-Agent': AGENTE }, signal: AbortSignal.timeout(180000) });
      if (!r.ok) throw new Error(`Wikidata HTTP ${r.status}`);
      return lerJsonTolerante(await r.text()).results.bindings;
    } catch (e) {
      if (t >= tentativas) throw e;
      await new Promise((ok) => setTimeout(ok, ESPERA * t));
    }
  }
}

async function json(url) {
  const r = await fetch(url, { headers: { 'User-Agent': AGENTE }, signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} em ${url}`);
  return r.json();
}

async function tentar(nome, fn, anterior) {
  try { const v = await fn(); console.log(`ok  ${nome}`); return v; } catch (e) { console.warn(`FALHOU ${nome}: ${e.message} — mantendo o dado anterior`); return anterior; }
}

export async function montar(anterior = {}, { espera = 5000 } = {}) {
  ESPERA = espera;
  const premios = await tentar('prêmios', async () => {
    const lista = [];
    for (const p of PREMIOS) {
      const anos = converterPremio(await sparql(consultaPremio(p.qid)));
      if (anos.length) lista.push({ id: p.id, nome: p.nome, categoria: p.categoria, url: p.url, anos });
    }
    if (!lista.length) throw new Error('nenhum prêmio veio');
    return lista;
  }, anterior.premios);

  const ids = [...new Set((premios || []).flatMap((p) => p.anos.flatMap((a) => [...a.vencedores, ...a.indicados])))];
  const jogos = await tentar('jogos dos prêmios', async () => {
    const tudo = {};
    for (let i = 0; i < ids.length; i += 150) Object.assign(tudo, converterJogos(await sparql(consultaJogos(ids.slice(i, i + 150)))));
    if (!Object.keys(tudo).length) throw new Error('nenhum jogo veio');
    return tudo;
  }, anterior.jogos);

  const maisVendidos = await tentar('mais vendidos', async () => {
    const r = await json('https://en.wikipedia.org/w/api.php?action=parse&page=List_of_best-selling_video_games&prop=text&format=json&formatversion=2');
    const lista = converterVendas(r.parse.text);
    if (lista.length < 10) throw new Error('tabela mudou');
    return { fonte: URL_VENDAS, lista };
  }, anterior.maisVendidos);

  const maisJogados = await tentar('mais jogados na Steam', async () => {
    const r = await json('https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/');
    const ranks = r.response.ranks.filter((x) => !NAO_JOGOS.has(x.appid)).slice(0, 20);
    const nomes = {};
    for (const x of ranks) {
      const d = await json(`https://store.steampowered.com/api/appdetails?appids=${x.appid}&filters=basic`).catch(() => null);
      const info = d?.[x.appid];
      if (info?.success && info.data.type === 'game') nomes[x.appid] = info.data.name;
    }
    const lista = converterMaisJogados(ranks, nomes);
    if (lista.length < 5) throw new Error('poucos nomes');
    return { fonte: 'https://store.steampowered.com/charts/mostplayed', semana: new Date(r.response.rollup_date * 1000).toISOString().slice(0, 10), lista };
  }, anterior.maisJogados);

  const lancamentos = await tentar('lançamentos por dia', async () => {
    const linhas = [];
    for (let mes = 1; mes <= 12; mes++) linhas.push(...await sparql(consultaLancamentos(mes)));
    const dias = converterLancamentos(linhas);
    if (Object.keys(dias).length < 300) throw new Error('poucos dias');
    return dias;
  }, anterior.lancamentos);

  return { geradoEm: new Date().toISOString().slice(0, 10), fonteJogos: 'https://www.wikidata.org', premios, jogos, maisVendidos, maisJogados, lancamentos };
}

async function principal() {
  const arquivo = new URL('../js/data/almanaque.json', import.meta.url);
  let anterior = {};
  try { anterior = JSON.parse(await readFile(arquivo, 'utf8')); } catch { /* primeira vez */ }
  const novo = await montar(anterior);
  const semData = (o) => JSON.stringify({ ...o, geradoEm: null });
  if (semData(novo) === semData(anterior)) { console.log('nada mudou'); return; }
  await writeFile(arquivo, JSON.stringify(novo) + '\n');
  console.log(`gravado: ${novo.premios?.length} prêmios, ${Object.keys(novo.jogos || {}).length} jogos, ${Object.keys(novo.lancamentos || {}).length} dias`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) principal().catch((e) => { console.error(e); process.exit(1); });
