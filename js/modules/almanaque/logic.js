// Lógica pura do Almanaque: fato do dia, sorteio, rankings, "neste dia" e curiosidades calculadas.
// Dados: js/data/almanaque.json (gerado toda semana) + js/data/curiosidades.js (base escrita à mão).

export const CAPITULOS = [
  { id: 'premios', titulo: 'Prêmios', texto: 'Todos os Jogos do Ano, indicados e vencedores' },
  { id: 'recordes', titulo: 'Recordes', texto: 'Speedruns, mais vendidos e mais jogados' },
  { id: 'neste-dia', titulo: 'Neste Dia', texto: 'O que foi lançado hoje, anos atrás' },
  { id: 'curiosidades', titulo: 'Curiosidades', texto: 'Fatos que ninguém te contou' },
];

/** Recordes de speedrun ao vivo: jogo e categoria fixos no speedrun.com (evita busca por nome). */
export const SPEEDRUNS = [
  { nome: 'Super Mario Bros.', jogo: 'om1m3625', categoria: 'w20p0zkn', rotulo: 'Any%' },
  { nome: 'Super Mario 64', jogo: 'o1y9wo6q', categoria: 'wkpoo02r', rotulo: '120 estrelas' },
  { nome: 'The Legend of Zelda: Ocarina of Time', jogo: 'j1l9qz1g', categoria: 'q25g198d', rotulo: 'Any%' },
  { nome: 'Portal', jogo: '4pd0n31e', categoria: 'lvdowokp', rotulo: 'Fora dos limites' },
  { nome: 'Celeste', jogo: 'o1y9j9v6', categoria: '7kjpl1gk', rotulo: 'Any%' },
  { nome: 'Hollow Knight', jogo: '76rqmld8', categoria: '02q8o4p2', rotulo: 'Any%' },
  { nome: 'Super Mario Odyssey', jogo: '76r55vd8', categoria: 'w20w1lzd', rotulo: 'Any%' },
  { nome: 'Elden Ring', jogo: 'nd28z0ed', categoria: '02qr00pk', rotulo: 'Any%' },
];

export const DADOS_VAZIOS = { geradoEm: null, premios: [], jogos: {}, maisVendidos: { lista: [] }, maisJogados: { lista: [] }, lancamentos: {} };

/** Aceita o JSON como veio (ou nada) e devolve sempre a mesma forma, para a tela nunca quebrar. */
export function normalizarDados(d) {
  if (!d || typeof d !== 'object') return { ...DADOS_VAZIOS };
  return {
    geradoEm: d.geradoEm || null,
    premios: Array.isArray(d.premios) ? d.premios : [],
    jogos: d.jogos && typeof d.jogos === 'object' ? d.jogos : {},
    maisVendidos: { fonte: d.maisVendidos?.fonte, lista: d.maisVendidos?.lista || [] },
    maisJogados: { fonte: d.maisJogados?.fonte, semana: d.maisJogados?.semana, lista: d.maisJogados?.lista || [] },
    lancamentos: d.lancamentos && typeof d.lancamentos === 'object' ? d.lancamentos : {},
  };
}

export const jogo = (dados, qid) => dados.jogos[qid] || null;
export const nomeDe = (dados, qid) => jogo(dados, qid)?.nome || null;
export const linkWikidata = (qid) => `https://www.wikidata.org/wiki/${qid}`;

/** Arte do jogo na Steam (cabeçalho 460x215, existe para quase todo jogo da loja). */
export const arteSteam = (appid) => (appid ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg` : null);

/** "2026-11-25" → "11-25" (data local). */
export function chaveDoDia(data = new Date()) {
  return `${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

export const anosAtras = (ano, data = new Date()) => data.getFullYear() - ano;

export function textoAnosAtras(n) {
  if (n <= 0) return 'Neste ano';
  return n === 1 ? 'Há 1 ano' : `Há ${n} anos`;
}

/** Jogos lançados no dia de hoje, só os que já saíram, do mais antigo ao mais novo. */
export function nesteDia(dados, data = new Date()) {
  return (dados.lancamentos[chaveDoDia(data)] || [])
    .filter((j) => j.ano < data.getFullYear() || (j.ano === data.getFullYear()))
    .map((j) => ({ ...j, anos: anosAtras(j.ano, data) }))
    .sort((a, b) => a.ano - b.ano || a.nome.localeCompare(b.nome));
}

/** Edições de um prêmio com nomes; jogo sem nome conhecido fica de fora (não mostra código). */
export function edicoes(dados, premioId) {
  const p = dados.premios.find((x) => x.id === premioId);
  if (!p) return [];
  return p.anos.map((a) => ({
    ano: a.ano,
    vencedores: a.vencedores.filter((q) => nomeDe(dados, q)).map((q) => ({ qid: q, ...jogo(dados, q) })),
    indicados: a.indicados.filter((q) => nomeDe(dados, q)).map((q) => ({ qid: q, ...jogo(dados, q) })),
  })).filter((a) => a.vencedores.length || a.indicados.length);
}

/** Quantos Jogos do Ano cada jogo ganhou, somando todos os prêmios. Empate: mais indicações, depois nome. */
export function rankingJogos(dados, limite = 10) {
  const conta = new Map();
  for (const p of dados.premios) for (const a of p.anos) {
    for (const q of a.vencedores) { const c = conta.get(q) || { qid: q, vitorias: 0, indicacoes: 0, premios: new Set() }; c.vitorias++; c.indicacoes++; c.premios.add(p.nome); conta.set(q, c); }
    for (const q of a.indicados) { const c = conta.get(q) || { qid: q, vitorias: 0, indicacoes: 0, premios: new Set() }; c.indicacoes++; conta.set(q, c); }
  }
  return [...conta.values()].filter((c) => c.vitorias && nomeDe(dados, c.qid))
    .map((c) => ({ ...c, premios: [...c.premios], nome: nomeDe(dados, c.qid), ...pick(jogo(dados, c.qid)) }))
    .sort((a, b) => b.vitorias - a.vitorias || b.indicacoes - a.indicacoes || a.nome.localeCompare(b.nome)).slice(0, limite);
}
const pick = (j) => ({ steam: j?.steam, estudio: j?.estudio, ano: j?.ano });

/** Estúdios com mais Jogos do Ano (um jogo premiado em vários prêmios conta cada vitória). */
export function rankingEstudios(dados, limite = 8) {
  const conta = new Map();
  for (const p of dados.premios) for (const a of p.anos) for (const q of a.vencedores) {
    const e = jogo(dados, q)?.estudio;
    if (!e) continue;
    const c = conta.get(e) || { estudio: e, vitorias: 0, jogos: new Set() };
    c.vitorias++; c.jogos.add(nomeDe(dados, q)); conta.set(e, c);
  }
  return [...conta.values()].map((c) => ({ ...c, jogos: [...c.jogos] }))
    .sort((a, b) => b.vitorias - a.vitorias || a.estudio.localeCompare(b.estudio)).slice(0, limite);
}

/** O jogo indicado mais vezes sem nunca vencer. */
export function maisIndicadoSemVencer(dados) {
  const venceu = new Set(), ind = new Map();
  for (const p of dados.premios) for (const a of p.anos) {
    a.vencedores.forEach((q) => venceu.add(q));
    a.indicados.forEach((q) => ind.set(q, (ind.get(q) || 0) + 1));
  }
  const lista = [...ind.entries()].filter(([q]) => !venceu.has(q) && nomeDe(dados, q)).sort((a, b) => b[1] - a[1] || nomeDe(dados, a[0]).localeCompare(nomeDe(dados, b[0])));
  return lista.length && lista[0][1] >= 2 ? { qid: lista[0][0], nome: nomeDe(dados, lista[0][0]), indicacoes: lista[0][1] } : null;
}

const milhoes = (v) => `${String(v).replace('.', ',')} milhões`;
const milhar = (n) => n.toLocaleString('pt-BR');

/**
 * Todos os fatos do Almanaque num formato só { id, capitulo, titulo, texto, fonte }:
 * a base escrita à mão + os calculados dos dados (que mudam sozinhos quando o robô atualiza).
 */
export function montarFatos(dados, curiosidades = [], data = new Date()) {
  const fatos = curiosidades.map((c) => ({ ...c, capitulo: 'curiosidades' }));
  const ranking = rankingJogos(dados, 1)[0];
  if (ranking && ranking.vitorias >= 2) fatos.push({ id: 'calc-mais-premiado', capitulo: 'premios', titulo: 'O mais premiado', texto: `${ranking.nome} ganhou ${ranking.vitorias} prêmios de Jogo do Ano (${ranking.premios.join(', ')}).`, fonte: linkWikidata(ranking.qid) });
  const estudio = rankingEstudios(dados, 1)[0];
  if (estudio && estudio.vitorias >= 2) fatos.push({ id: 'calc-estudio', capitulo: 'premios', titulo: 'O estúdio que mais ganhou', texto: `${estudio.estudio} soma ${estudio.vitorias} prêmios de Jogo do Ano, com ${estudio.jogos.join(', ')}.`, fonte: 'https://www.wikidata.org' });
  const azarado = maisIndicadoSemVencer(dados);
  if (azarado) fatos.push({ id: 'calc-azarado', capitulo: 'premios', titulo: 'Sempre indicado, nunca campeão', texto: `${azarado.nome} foi indicado ${azarado.indicacoes} vezes a Jogo do Ano e não levou nenhuma.`, fonte: linkWikidata(azarado.qid) });
  const tga = dados.premios.find((p) => p.id === 'tga');
  const primeiro = tga?.anos.at(-1);
  if (primeiro?.vencedores[0] && nomeDe(dados, primeiro.vencedores[0])) fatos.push({ id: 'calc-tga-primeiro', capitulo: 'premios', titulo: `O primeiro do The Game Awards`, texto: `Em ${primeiro.ano}, o primeiro Jogo do Ano do The Game Awards foi ${nomeDe(dados, primeiro.vencedores[0])}.`, fonte: tga.url });
  const vendas = dados.maisVendidos.lista;
  if (vendas[0]) fatos.push({ id: 'calc-mais-vendido', capitulo: 'recordes', titulo: 'O jogo mais vendido da história', texto: `${vendas[0].nome} vendeu cerca de ${milhoes(vendas[0].vendas)} de cópias${vendas[1] ? `, à frente de ${vendas[1].nome} (${milhoes(vendas[1].vendas)})` : ''}.`, fonte: dados.maisVendidos.fonte });
  const velho = [...vendas].filter((v) => v.ano).sort((a, b) => a.ano - b.ano)[0];
  if (velho && velho !== vendas[0]) fatos.push({ id: 'calc-veterano', capitulo: 'recordes', titulo: 'Veterano entre os mais vendidos', texto: `${velho.nome}, de ${velho.ano}, ainda está entre os jogos mais vendidos de todos os tempos, com ${milhoes(velho.vendas)} de cópias.`, fonte: dados.maisVendidos.fonte });
  const steam = dados.maisJogados.lista[0];
  if (steam) fatos.push({ id: 'calc-steam', capitulo: 'recordes', titulo: 'O mais jogado da semana na Steam', texto: `${steam.nome} chegou a ${milhar(steam.pico)} jogadores ao mesmo tempo na semana de ${dataBR(dados.maisJogados.semana)}.`, fonte: dados.maisJogados.fonte });
  for (const j of nesteDia(dados, data).filter((x) => x.anos > 0).slice(0, 3)) {
    fatos.push({ id: `dia-${j.qid}`, capitulo: 'neste-dia', titulo: textoAnosAtras(j.anos), texto: `Neste dia, em ${j.ano}, era lançado ${j.nome}.`, fonte: linkWikidata(j.qid) });
  }
  return fatos;
}

export function dataBR(iso) {
  if (!iso) return '';
  const [a, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

/** Número estável a partir de um texto (o mesmo dia dá o mesmo fato para todo mundo). */
export function hash(texto) {
  let n = 2166136261;
  for (const c of String(texto)) n = Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0;
  return n;
}

/** Fato do dia: escolhido pela data, igual para todos no mesmo dia. Prefere curiosidades e prêmios. */
export function fatoDoDia(fatos, data = new Date()) {
  if (!fatos.length) return null;
  const chave = `${data.getFullYear()}-${chaveDoDia(data)}`;
  const preferidos = fatos.filter((f) => f.capitulo !== 'neste-dia');
  const base = preferidos.length ? preferidos : fatos;
  return base[hash(chave) % base.length];
}

/** "Me surpreenda": um fato aleatório que não seja o último mostrado. */
export function sortear(fatos, ultimoId = null, aleatorio = Math.random) {
  if (!fatos.length) return null;
  const opcoes = fatos.length > 1 ? fatos.filter((f) => f.id !== ultimoId) : fatos;
  return opcoes[Math.floor(aleatorio() * opcoes.length) % opcoes.length];
}

/** Segundos → "1:35:14" ou "4:54.3" (recorde de speedrun). */
export function tempoRun(seg) {
  if (!(seg > 0)) return '—';
  const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = Math.floor(seg % 60);
  const ms = Math.round((seg - Math.floor(seg)) * 1000);
  const ss = String(s).padStart(2, '0') + (ms ? `.${String(ms).padStart(3, '0')}` : '');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
