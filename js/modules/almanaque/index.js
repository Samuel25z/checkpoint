// Almanaque — o livro dos recordes dos games: capa com Fato do Dia, 4 capítulos e "Me surpreenda".
// Dados em js/data/almanaque.json (o robô do GitHub atualiza toda semana) + curiosidades escritas à mão.
import { h, usarEstilo, cabecalho, carregando, erro, modal, toast } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { irPara } from '../../core/router.js';
import { CURIOSIDADES } from '../../data/curiosidades.js';
import { speedrun } from '../../services/speedrun.js';
import { lerJogos, salvarJogo } from '../diario/dados.js';
import {
  CAPITULOS, SPEEDRUNS, normalizarDados, montarFatos, fatoDoDia, sortear, edicoes, rankingJogos, rankingEstudios,
  nesteDia, textoAnosAtras, arteSteam, linkWikidata, dataBR, tempoRun
} from './logic.js';

const URL_DADOS = new URL('../../data/almanaque.json', import.meta.url);
let dadosCache = null;
let ultimoSorteado = null;
const recordesAoVivo = new Map();

async function carregarDados() {
  if (dadosCache) return dadosCache;
  const r = await fetch(URL_DADOS);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  dadosCache = normalizarDados(await r.json());
  return dadosCache;
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const hojeExtenso = (d = new Date()) => `${d.getDate()} de ${MESES[d.getMonth()]}`;

function fonte(url, texto = 'Fonte') {
  return url ? h('a', { class: 'alm-fonte', href: url, target: '_blank', rel: 'noopener', html: `<span>${texto}</span>${icone('externo')}` }) : null;
}

/** Arte do jogo (Steam) com o padrão hexagonal da marca de reserva. */
function arte(appid, nome, classe = '') {
  const caixa = h('div', { class: `alm-arte padrao-hex ${classe}` });
  const url = arteSteam(appid);
  if (url) {
    const i = h('img', { src: url, alt: `Arte de ${nome}`, loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' });
    i.addEventListener('error', () => i.remove());
    caixa.append(i);
  }
  return caixa;
}

/** Botão que põe o jogo no Diário como "Quero jogar" (ou avisa que já está). */
function botaoDiario(ctx, nome) {
  const ja = () => lerJogos(ctx.storage).some((j) => j.nome.toLowerCase() === nome.toLowerCase());
  const b = h('button', { type: 'button', class: 'btn btn-pequeno', disabled: ja(), html: `${icone(ja() ? 'livro' : 'mais')}<span>${ja() ? 'No seu diário' : 'Quero jogar'}</span>` });
  b.addEventListener('click', () => {
    if (ja()) return;
    salvarJogo(ctx.storage, { nome, status: 'quero', nota: null, horas: 0, plataforma: '' });
    toast(`${nome} adicionado ao diário`, 'sucesso');
    b.disabled = true;
    b.innerHTML = `${icone('livro')}<span>No seu diário</span>`;
  });
  return b;
}

/* ---------- Me surpreenda ---------- */
function cartaoFato(f) {
  const cap = CAPITULOS.find((c) => c.id === f.capitulo);
  return h('article', { class: 'alm-fato-grande', 'data-fato': f.id },
    h('p', { class: 'alm-selo' }, cap ? cap.titulo : 'Curiosidade'),
    h('h3', {}, f.titulo),
    h('p', { class: 'alm-fato-texto' }, f.texto),
    fonte(f.fonte));
}

function meSurpreenda(fatos) {
  const area = h('div', { class: 'alm-surpresa', 'aria-live': 'polite' });
  const mostrar = () => {
    const f = sortear(fatos, ultimoSorteado);
    if (!f) return;
    ultimoSorteado = f.id;
    area.replaceChildren(cartaoFato(f));
  };
  mostrar();
  const corpo = h('div', { class: 'alm-surpresa-corpo' }, area,
    h('div', { class: 'modal-acoes form-acoes' },
      h('button', { type: 'button', class: 'btn', onclick: () => modal.fecharAtual(null) }, 'Fechar'),
      h('button', { type: 'button', class: 'btn btn-primario', id: 'alm-outro', onclick: mostrar, html: `${icone('refazer')}<span>Outro</span>` })));
  return modal({ titulo: 'Me surpreenda', conteudo: corpo, acoes: [], largo: true });
}

/* ---------- capa ---------- */
function telaCapa(dados, fatos) {
  const dia = fatoDoDia(fatos);
  const numeros = {
    premios: `${dados.premios.reduce((a, p) => a + p.anos.length, 0)} edições`,
    recordes: `${SPEEDRUNS.length} recordes ao vivo`,
    'neste-dia': `${nesteDia(dados).length} jogos hoje`,
    curiosidades: `${fatos.filter((f) => f.capitulo === 'curiosidades').length} fatos`,
  };
  return h('div', { class: 'alm-capa' },
    dia ? h('section', { class: 'alm-dia padrao-hex', 'aria-label': 'Fato do dia' },
      h('p', { class: 'alm-selo' }, `Fato do dia · ${hojeExtenso()}`),
      h('h2', {}, dia.titulo),
      h('p', { class: 'alm-fato-texto' }, dia.texto),
      fonte(dia.fonte)) : null,
    h('nav', { class: 'alm-capitulos', 'aria-label': 'Capítulos do Almanaque' }, CAPITULOS.map((c, i) =>
      h('a', { class: 'alm-capitulo', href: `#/almanaque/${c.id}`, 'data-capitulo': c.id },
        h('span', { class: 'alm-num' }, String(i + 1).padStart(2, '0')),
        h('strong', {}, c.titulo),
        h('span', { class: 'texto-2' }, c.texto),
        h('span', { class: 'alm-conta' }, numeros[c.id])))));
}

/* ---------- capítulos ---------- */
function capPremios(dados, ctx, premioId) {
  const premio = dados.premios.find((p) => p.id === premioId) || dados.premios[0];
  if (!premio) return h('p', { class: 'texto-2' }, 'Os prêmios ainda não foram carregados.');
  const anoAtual = new Date().getFullYear();
  const linha = h('ol', { class: 'alm-linha' }, edicoes(dados, premio.id).map((a) => h('li', { class: 'alm-edicao', 'data-ano': a.ano },
    h('span', { class: 'alm-ano' }, String(a.ano)),
    h('div', { class: 'alm-edicao-corpo' },
      a.vencedores.length ? a.vencedores.map((v) => h('div', { class: 'alm-vencedor' },
        arte(v.steam, v.nome),
        h('div', {},
          h('p', { class: 'alm-selo' }, `${premio.categoria} · vencedor`),
          h('h3', {}, v.nome),
          v.estudio ? h('p', { class: 'texto-2' }, v.estudio) : null,
          h('div', { class: 'alm-acoes' }, botaoDiario(ctx, v.nome), fonte(linkWikidata(v.qid), 'Ver no Wikidata')))))
        : h('p', { class: 'alm-aguardando' }, a.ano >= anoAtual ? 'Vencedor ainda não anunciado' : 'Vencedor não informado na fonte'),
      a.indicados.length ? h('div', { class: 'alm-indicados' }, h('span', { class: 'texto-3' }, 'Indicados:'), a.indicados.map((i) => h('span', { class: 'alm-chip' }, i.nome))) : null))));
  const jogos = rankingJogos(dados, 8);
  const estudios = rankingEstudios(dados, 6);
  return h('div', { class: 'alm-premios' },
    h('div', { class: 'alm-abas', role: 'tablist', 'aria-label': 'Prêmio' }, dados.premios.map((p) =>
      h('button', { type: 'button', role: 'tab', class: 'alm-aba', 'data-premio': p.id, 'aria-selected': String(p.id === premio.id), onclick: () => irPara('almanaque', 'premios', p.id) }, p.nome))),
    h('div', { class: 'alm-premios-grade' },
      h('div', {}, h('p', { class: 'texto-2 alm-intro' }, `${premio.nome} · ${premio.categoria}. `, fonte(premio.url, 'Fonte dos dados')), linha),
      h('aside', { class: 'alm-lateral' },
        h('section', { class: 'alm-ranking' }, h('h3', {}, 'Quem mais ganhou'), h('p', { class: 'texto-3' }, 'Somando os 4 prêmios'),
          h('ol', {}, jogos.map((j) => h('li', {}, h('span', {}, j.nome), h('strong', {}, `${j.vitorias}×`))))),
        h('section', { class: 'alm-ranking' }, h('h3', {}, 'Estúdios campeões'),
          h('ol', {}, estudios.map((e) => h('li', { title: e.jogos.join(', ') }, h('span', {}, e.estudio), h('strong', {}, `${e.vitorias}×`))))))));
}

function capRecordes(dados) {
  const grade = h('div', { class: 'alm-runs', id: 'alm-runs' }, SPEEDRUNS.map((s) => h('article', { class: 'alm-run', 'data-run': s.jogo },
    h('p', { class: 'alm-selo' }, s.rotulo), h('h3', {}, s.nome),
    h('p', { class: 'alm-tempo' }, recordesAoVivo.get(s.jogo)?.tempo ?? '…'),
    h('p', { class: 'texto-3 alm-quem' }, recordesAoVivo.get(s.jogo)?.quem ?? 'buscando no speedrun.com'))));
  // ao vivo: um pedido por jogo, com cache de 10 min no serviço
  SPEEDRUNS.forEach(async (s) => {
    try {
      const [wr] = await speedrun.ranking(s.jogo, s.categoria, 1);
      const info = wr ? { tempo: tempoRun(wr.tempo / 1000), quem: `${wr.jogador}${wr.data ? ` · ${dataBR(wr.data)}` : ''}`, link: wr.link } : { tempo: '—', quem: 'Sem recorde agora' };
      recordesAoVivo.set(s.jogo, info);
      const el = grade.querySelector(`[data-run="${s.jogo}"]`);
      if (!el) return;
      el.querySelector('.alm-tempo').textContent = info.tempo;
      el.querySelector('.alm-quem').textContent = info.quem;
      if (info.link && !el.querySelector('.alm-fonte')) el.append(fonte(info.link, 'Ver a run'));
    } catch {
      const el = grade.querySelector(`[data-run="${s.jogo}"]`);
      if (el) { el.querySelector('.alm-tempo').textContent = '—'; el.querySelector('.alm-quem').textContent = 'speedrun.com fora do ar agora'; }
    }
  });
  const vendas = dados.maisVendidos.lista;
  const maior = vendas[0]?.vendas || 1;
  return h('div', { class: 'alm-recordes' },
    h('section', {}, h('h2', { class: 'alm-titulo-secao' }, 'Recordes mundiais de speedrun'), h('p', { class: 'texto-3' }, 'Ao vivo do speedrun.com, o 1º lugar de cada categoria.'), grade),
    h('div', { class: 'alm-duas' },
      h('section', {}, h('h2', { class: 'alm-titulo-secao' }, 'Os mais vendidos da história'),
        h('ol', { class: 'alm-barras' }, vendas.slice(0, 12).map((v) => h('li', {},
          h('span', { class: 'alm-pos' }, `${v.posicao}º`),
          h('div', {}, h('strong', {}, v.nome), h('span', { class: 'texto-3' }, [v.ano, v.empresa].filter(Boolean).join(' · ')),
            h('span', { class: 'alm-barra', 'aria-hidden': 'true' }, h('i', { style: `width:${Math.max(4, (v.vendas / maior) * 100)}%` }))),
          h('span', { class: 'alm-valor' }, `${String(v.vendas).replace('.', ',')} mi`)))),
        fonte(dados.maisVendidos.fonte, 'Fonte: Wikipedia')),
      h('section', {}, h('h2', { class: 'alm-titulo-secao' }, 'Mais jogados na Steam'),
        h('p', { class: 'texto-3' }, dados.maisJogados.semana ? `Pico de jogadores ao mesmo tempo, semana de ${dataBR(dados.maisJogados.semana)}` : ''),
        h('ol', { class: 'alm-steam' }, dados.maisJogados.lista.slice(0, 10).map((j) => h('li', {},
          arte(j.steam, j.nome, 'alm-arte-mini'),
          h('div', {}, h('strong', {}, j.nome), h('span', { class: 'texto-3' }, `${j.pico.toLocaleString('pt-BR')} jogadores`))))),
        fonte(dados.maisJogados.fonte, 'Fonte: Steam'))));
}

function capNesteDia(dados, ctx) {
  const lista = nesteDia(dados);
  if (!lista.length) return h('p', { class: 'texto-2' }, 'Nenhum lançamento famoso registrado para hoje. Volte amanhã!');
  return h('div', {},
    h('h2', { class: 'alm-titulo-secao' }, `${hojeExtenso()}, nos anos passados`),
    h('ol', { class: 'alm-dias' }, lista.map((j) => h('li', { class: 'alm-dia-item' },
      h('span', { class: 'alm-ha' }, textoAnosAtras(j.anos)),
      h('div', {}, h('strong', {}, j.nome), h('span', { class: 'texto-3' }, `Lançado em ${j.ano}`)),
      h('div', { class: 'alm-acoes' }, botaoDiario(ctx, j.nome), fonte(linkWikidata(j.qid), 'Ver no Wikidata'))))));
}

function capCuriosidades(fatos) {
  const lista = fatos.filter((f) => f.capitulo !== 'neste-dia');
  return h('div', { class: 'alm-cards' }, lista.map((f, i) => h('article', { class: 'alm-card', style: `--atraso:${Math.min(i, 12) * 40}ms` },
    h('p', { class: 'alm-selo' }, CAPITULOS.find((c) => c.id === f.capitulo)?.titulo || 'Curiosidade'),
    h('h3', {}, f.titulo), h('p', {}, f.texto), fonte(f.fonte))));
}

/* ---------- montagem ---------- */
function desenhar(el, ctx, dados) {
  const fatos = montarFatos(dados, CURIOSIDADES);
  const capitulo = CAPITULOS.find((c) => c.id === ctx.params[0]);
  const botao = h('button', { class: 'btn btn-primario', id: 'botao-surpreenda', onclick: () => meSurpreenda(fatos), html: `${icone('brilho')}<span>Me surpreenda</span>` });
  const topo = cabecalho('Almanaque', 'O livro dos recordes dos games: prêmios, recordes, curiosidades e o que aconteceu neste dia.', botao);
  const rodape = h('p', { class: 'texto-3 alm-rodape' }, dados.geradoEm ? `Dados atualizados em ${dataBR(dados.geradoEm)}, toda semana, a partir do Wikidata, da Wikipedia e da Steam.` : 'Dados ainda não carregados.');
  if (!capitulo) { el.replaceChildren(topo, telaCapa(dados, fatos), rodape); return; }
  const navegacao = h('nav', { class: 'alm-nav', 'aria-label': 'Capítulos' },
    h('a', { class: 'btn btn-pequeno btn-fantasma', href: '#/almanaque', html: `${icone('voltar')}<span>Capa</span>` }),
    CAPITULOS.map((c) => h('a', { class: 'alm-nav-item', href: `#/almanaque/${c.id}`, 'aria-current': c.id === capitulo.id ? 'page' : null }, c.titulo)));
  const conteudo = {
    premios: () => capPremios(dados, ctx, ctx.params[1]),
    recordes: () => capRecordes(dados),
    'neste-dia': () => capNesteDia(dados, ctx),
    curiosidades: () => capCuriosidades(fatos),
  }[capitulo.id]();
  el.replaceChildren(topo, navegacao, h('section', { class: `alm-capitulo-tela alm-${capitulo.id}`, 'aria-label': capitulo.titulo }, conteudo), rodape);
}

export default {
  async montar(el, ctx) {
    usarEstilo('js/modules/almanaque/estilo.css');
    el.replaceChildren(carregando('Abrindo o Almanaque…'));
    try {
      desenhar(el, ctx, await carregarDados());
    } catch {
      el.replaceChildren(erro({ titulo: 'Não deu para abrir o Almanaque', texto: 'Confira a internet e tente de novo.', tentar: () => this.montar(el, ctx) }));
    }
  },
  painelInicio() {
    if (!dadosCache) return null;
    const f = fatoDoDia(montarFatos(dadosCache, CURIOSIDADES));
    return f ? { titulo: 'Fato do dia no Almanaque', link: 'Abrir', el: h('p', { class: 'texto-2' }, `${f.titulo}: ${f.texto}`) } : null;
  }
};
