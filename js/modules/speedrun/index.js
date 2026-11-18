// Central de Speedrun — recordes do speedrun.com e cronômetro com splits.
import { h, usarEstilo, cabecalho, vazio, carregando, erro, modal, confirmar, capa, dataCurta } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { novoId } from '../../storage.js';
import { speedrun } from '../../services/speedrun.js';
import { formatarTempo, novaRun, marcar, desfazer, reiniciar, decorrido, novaRota, deltas, somaMelhores, registrarRun } from './logic.js';

const CH_ROTAS = 'speedrun:rotas';
const CH_ATUAL = 'speedrun:rotaAtual';

let limpar = [];
const lerRotas = (s) => s.ler(CH_ROTAS, []);
const gravarRotas = (s, l) => s.gravar(CH_ROTAS, l);

/* ---------- formulário de rota ---------- */
async function formularioRota(rota) {
  const form = h('form', { class: 'form-rota', novalidate: true },
    h('label', { class: 'campo' }, h('span', {}, 'Nome da rota'), h('input', { class: 'entrada', name: 'nome', required: true, placeholder: 'Hollow Knight — Any%', value: rota?.nome || '' }), h('span', { class: 'campo-erro', 'data-erro': 'nome' })),
    h('label', { class: 'campo' }, h('span', {}, 'Jogo'), h('input', { class: 'entrada', name: 'jogo', placeholder: 'Hollow Knight', value: rota?.jogo || '' })),
    h('label', { class: 'campo' }, h('span', {}, 'Splits (um por linha, na ordem)'),
      h('textarea', { class: 'entrada', name: 'splits', rows: '6', placeholder: 'Falso Cavaleiro\nHornet\nFim' }, rota ? rota.splits.map((s) => s.nome).join('\n') : ''),
      h('span', { class: 'texto-3 dica' }, rota?.pbTotal ? 'Mudar a quantidade de splits apaga o PB desta rota.' : 'Sem splits? Deixe só "Fim".')),
    h('div', { class: 'modal-acoes form-acoes' },
      h('button', { type: 'button', class: 'btn', onclick: () => modal.fecharAtual(null) }, 'Cancelar'),
      h('button', { type: 'submit', class: 'btn btn-primario' }, rota ? 'Salvar rota' : 'Criar rota')));
  const p = modal({ titulo: rota ? 'Editar rota' : 'Nova rota', conteudo: form, acoes: [] });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    if (!String(f.get('nome')).trim()) { form.querySelector('[data-erro="nome"]').textContent = 'Dê um nome para a rota.'; return; }
    modal.fecharAtual({ nome: f.get('nome'), jogo: f.get('jogo'), splits: String(f.get('splits')).split('\n') });
  });
  return p;
}

/* ---------- cronômetro ---------- */
function telaCronometro(el, ctx, trocar) {
  const s = ctx.storage;
  let rotas = lerRotas(s);
  let rotaId = s.ler(CH_ATUAL, rotas[0]?.id);
  let rota = rotas.find((r) => r.id === rotaId) || rotas[0];

  const criar = async (base = {}) => {
    const dados = base.nome ? base : await formularioRota(null);
    if (!dados) return;
    const nova = { id: novoId(), ...novaRota(dados), categoria: base.categoria || null };
    gravarRotas(s, [nova, ...lerRotas(s)]);
    s.gravar(CH_ATUAL, nova.id);
    ctx.toast('Rota criada', 'sucesso');
    trocar('cronometro');
  };

  if (!rota) {
    el.replaceChildren(vazio({ titulo: 'Crie sua primeira rota', texto: 'Uma rota é o jogo + a categoria + os splits. Depois é só apertar espaço e correr.', acao: { rotulo: 'Criar rota', onclick: () => criar() } }),
      h('p', { class: 'texto-3 centro' }, 'Ou busque um jogo em ', h('a', { href: '#/speedrun/recordes' }, 'Recordes'), ' e crie a rota a partir da categoria.'));
    return;
  }

  let run = novaRun(rota.splits.length);
  let registrada = false;
  let quadro;

  const relogio = h('div', { class: 'relogio numero', id: 'relogio', 'aria-live': 'off' }, formatarTempo(0));
  const estadoTxt = h('p', { class: 'relogio-estado', 'aria-live': 'polite' }, 'Pronto');
  const botaoPrincipal = h('button', { class: 'btn btn-primario btn-grande', id: 'botao-split' });
  const botaoDesfazer = h('button', { class: 'btn', id: 'botao-desfazer', html: `${icone('voltar')}<span>Desfazer</span>` });
  const botaoReiniciar = h('button', { class: 'btn', id: 'botao-reiniciar', html: `${icone('refazer')}<span>Reiniciar</span>` });
  const botaoFoco = h('button', { class: 'btn btn-fantasma', id: 'botao-foco', html: `${icone('cronometro')}<span>Modo foco</span>` });
  const tabela = h('ol', { class: 'splits', id: 'lista-splits' });
  const placar = h('dl', { class: 'placar' });

  function salvarRota(nova) {
    rotas = lerRotas(s).map((r) => (r.id === nova.id ? nova : r));
    gravarRotas(s, rotas);
    rota = nova;
  }

  function pintarPlacar() {
    const wr = rota.categoria?.wr;
    placar.replaceChildren(...[
      h('div', {}, h('dt', {}, 'Recorde pessoal'), h('dd', { class: 'numero', id: 'pb' }, formatarTempo(rota.pbTotal))),
      h('div', {}, h('dt', {}, 'Soma dos melhores'), h('dd', { class: 'numero' }, formatarTempo(somaMelhores(rota)))),
      h('div', {}, h('dt', {}, 'Tentativas'), h('dd', { class: 'numero' }, `${rota.concluidas}/${rota.tentativas}`)),
      wr ? h('div', { class: 'placar-wr' }, h('dt', {}, 'Recorde mundial'), h('dd', { class: 'numero' }, formatarTempo(wr.tempo), h('span', { class: 'texto-3' }, ` ${wr.jogador}`))) : null].filter(Boolean));
  }

  function pintarSplits(agora) {
    const d = deltas(rota, run.tempos);
    tabela.replaceChildren(...rota.splits.map((sp, i) => {
      const feito = i < run.tempos.length;
      const atual = run.estado === 'correndo' && i === run.tempos.length;
      const delta = feito ? d[i] : null;
      const trecho = feito ? run.tempos[i] - (i ? run.tempos[i - 1] : 0) : null;
      const ouro = feito && sp.melhor !== null && trecho <= sp.melhor;
      return h('li', { class: `split ${feito ? 'feito' : ''} ${atual ? 'atual' : ''}` },
        h('span', { class: 'split-nome' }, sp.nome),
        h('span', { class: `split-delta numero ${delta === null ? '' : ouro ? 'ouro' : delta <= 0 ? 'ganhou' : 'perdeu'}` }, delta === null ? '' : formatarTempo(delta, { sinal: true, casas: 1 })),
        h('span', { class: 'split-tempo numero' }, feito ? formatarTempo(run.tempos[i]) : atual ? formatarTempo(decorrido(run, agora)) : formatarTempo(sp.pb)));
    }));
  }

  function pintar() {
    const agora = performance.now();
    relogio.textContent = formatarTempo(decorrido(run, agora));
    const d = deltas(rota, run.tempos);
    const ultimo = d[d.length - 1];
    relogio.className = `relogio numero ${run.estado} ${ultimo === null || ultimo === undefined ? '' : ultimo <= 0 ? 'ganhou' : 'perdeu'}`;
    botaoPrincipal.textContent = run.estado === 'parado' ? 'Iniciar' : run.estado === 'terminado' ? 'Nova tentativa' : run.tempos.length === rota.splits.length - 1 ? 'Terminar' : 'Split';
    botaoDesfazer.disabled = !run.tempos.length;
    estadoTxt.textContent = run.estado === 'parado' ? 'Pronto — aperte espaço' : run.estado === 'terminado' ? 'Run terminada' : `Split ${run.tempos.length + 1} de ${rota.splits.length}: ${rota.splits[run.tempos.length].nome}`;
    pintarSplits(agora);
  }

  function laco() {
    pintar();
    if (run.estado === 'correndo') quadro = requestAnimationFrame(laco);
  }

  function finalizarSeTerminou() {
    if (run.estado !== 'terminado' || registrada) return;
    registrada = true;
    const r = registrarRun(rota, run);
    salvarRota(r.rota);
    pintarPlacar();
    if (r.novoPB) { ctx.toast('Novo recorde pessoal!', 'sucesso'); relogio.classList.add('pb-novo'); }
  }

  const acoes = {
    split() {
      if (run.estado === 'terminado') { acoes.reiniciar(); return; }
      run = marcar(run, performance.now());
      finalizarSeTerminou();
      cancelAnimationFrame(quadro); laco();
    },
    desfazer() {
      if (run.estado === 'terminado' && registrada) return; // run já registrada não volta
      run = desfazer(run); laco();
    },
    reiniciar() {
      if (run.estado === 'correndo' && run.tempos.length) { salvarRota(registrarRun(rota, run).rota); pintarPlacar(); }
      run = reiniciar(run); registrada = false; cancelAnimationFrame(quadro); relogio.classList.remove('pb-novo'); pintar();
    },
    foco() {
      const ligado = painelTempo.classList.toggle('foco');
      botaoFoco.innerHTML = ligado ? `${icone('fechar')}<span>Sair do foco</span>` : `${icone('cronometro')}<span>Modo foco</span>`;
      document.body.classList.toggle('sem-rolagem', ligado);
    }
  };
  botaoPrincipal.addEventListener('click', acoes.split);
  botaoDesfazer.addEventListener('click', acoes.desfazer);
  botaoReiniciar.addEventListener('click', acoes.reiniciar);
  botaoFoco.addEventListener('click', acoes.foco);

  const teclas = (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable]') || document.querySelector('[data-modal]')) return;
    if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); acoes.split(); }
    else if (e.key === 'r' || e.key === 'R') acoes.reiniciar();
    else if (e.key === 'z' || e.key === 'Z') acoes.desfazer();
    else if (e.key === 'Escape' && painelTempo.classList.contains('foco')) acoes.foco();
  };
  document.addEventListener('keydown', teclas);
  limpar.push(() => { document.removeEventListener('keydown', teclas); cancelAnimationFrame(quadro); document.body.classList.remove('sem-rolagem'); });

  const seletor = h('select', { class: 'entrada', id: 'seletor-rota', 'aria-label': 'Rota', onchange: (e) => { s.gravar(CH_ATUAL, e.target.value); trocar('cronometro'); } },
    rotas.map((r) => h('option', { value: r.id, selected: r.id === rota.id }, r.nome)));

  const editar = async () => {
    const d = await formularioRota(rota);
    if (!d) return;
    const base = novaRota(d);
    const mesmo = base.splits.length === rota.splits.length;
    salvarRota({ ...rota, nome: base.nome, jogo: base.jogo, splits: base.splits.map((sp, i) => (mesmo ? { ...rota.splits[i], nome: sp.nome } : sp)), pbTotal: mesmo ? rota.pbTotal : null });
    ctx.toast('Rota salva'); trocar('cronometro');
  };
  const excluir = async () => {
    if (!await confirmar('Excluir rota?', `“${rota.nome}” e o PB dela serão apagados.`, 'Excluir', true)) return;
    gravarRotas(s, lerRotas(s).filter((r) => r.id !== rota.id));
    s.remover(CH_ATUAL);
    ctx.toast('Rota excluída'); trocar('cronometro');
  };

  const painelTempo = h('section', { class: 'painel-tempo', 'aria-label': 'Cronômetro' },
    h('p', { class: 'rota-nome' }, rota.nome, rota.jogo ? h('span', { class: 'texto-3' }, ` · ${rota.jogo}`) : null),
    relogio, estadoTxt,
    h('div', { class: 'controles' }, botaoPrincipal, botaoDesfazer, botaoReiniciar, botaoFoco),
    h('p', { class: 'atalhos-teclado texto-3' }, h('kbd', {}, 'Espaço'), ' iniciar/split · ', h('kbd', {}, 'Z'), ' desfazer · ', h('kbd', {}, 'R'), ' reiniciar'),
    placar);

  el.replaceChildren(
    h('div', { class: 'rota-barra' },
      h('label', { class: 'rota-seletor' }, h('span', { class: 'sr' }, 'Escolher rota'), seletor),
      h('button', { class: 'btn', onclick: () => criar(), html: `${icone('mais')}<span>Nova rota</span>` }),
      h('button', { class: 'btn btn-fantasma', onclick: editar, html: `${icone('editar')}<span>Editar</span>` }),
      h('button', { class: 'btn btn-fantasma', onclick: excluir, html: `${icone('lixeira')}<span>Excluir</span>` }),
      rota.categoria?.link ? h('a', { class: 'btn btn-fantasma', href: rota.categoria.link, target: '_blank', rel: 'noopener', html: `${icone('externo')}<span>Enviar no speedrun.com</span>` }) : null),
    h('div', { class: 'cronometro-grade' }, painelTempo, h('section', { class: 'painel-splits', 'aria-label': 'Splits' }, tabela)));
  pintarPlacar();
  pintar();
}

/* ---------- recordes ---------- */
function telaRecordes(el, ctx, trocar) {
  const lista = h('div', { class: 'sr-jogos', id: 'resultado-jogos' });
  const detalhe = h('div', { class: 'sr-detalhe', id: 'detalhe-jogo' });
  const entrada = h('input', { class: 'entrada', type: 'search', id: 'busca-speedrun', placeholder: 'Buscar jogo no speedrun.com', 'aria-label': 'Buscar jogo no speedrun.com' });

  async function buscar() {
    const t = entrada.value.trim();
    if (t.length < 2) return;
    detalhe.replaceChildren();
    lista.replaceChildren(carregando('Buscando jogos…'));
    try {
      const jogos = await speedrun.jogos(t);
      if (!jogos.length) { lista.replaceChildren(h('p', { class: 'texto-2' }, `Nenhum jogo encontrado para “${t}”.`)); return; }
      lista.replaceChildren(...jogos.map((j) => h('button', { class: 'carta sr-carta', type: 'button', onclick: () => abrirJogo(j) }, capa(j.capa, j.nome), h('span', { class: 'carta-nome' }, j.nome), h('span', { class: 'carta-meta' }, j.ano || ''))));
    } catch {
      lista.replaceChildren(erro({ titulo: 'O speedrun.com não respondeu', texto: 'Confira sua internet e tente de novo em instantes.', tentar: buscar }));
    }
  }

  async function abrirJogo(jogo) {
    detalhe.replaceChildren(carregando('Carregando categorias…'));
    detalhe.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      const cats = await speedrun.categorias(jogo.id);
      if (!cats.length) { detalhe.replaceChildren(h('p', { class: 'texto-2' }, 'Este jogo não tem categorias de jogo completo.')); return; }
      const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Categorias' });
      const tabela = h('div', { class: 'sr-tabela' });
      detalhe.replaceChildren(h('div', { class: 'sr-jogo-topo' }, capa(jogo.capa, jogo.nome, 'capa-mini'), h('h2', {}, jogo.nome)), chips, tabela);
      const abrirCat = async (cat) => {
        chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.id === cat.id)));
        tabela.replaceChildren(carregando('Carregando ranking…'));
        try {
          const ranking = await speedrun.ranking(jogo.id, cat.id);
          const wr = ranking[0];
          tabela.replaceChildren(
            h('div', { class: 'sr-acoes' },
              h('button', { class: 'btn btn-primario', id: 'criar-rota-categoria', onclick: () => criarDaCategoria(jogo, cat, wr) }, 'Criar rota com esta categoria'),
              h('a', { class: 'btn', href: cat.link, target: '_blank', rel: 'noopener', html: `${icone('externo')}<span>Enviar sua run</span>` })),
            ranking.length ? h('table', { class: 'ranking' },
              h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, '#'), h('th', { scope: 'col' }, 'Jogador'), h('th', { scope: 'col' }, 'Tempo'), h('th', { scope: 'col', class: 'col-data' }, 'Data'), h('th', { scope: 'col' }, 'Vídeo'))),
              h('tbody', {}, ranking.map((r) => h('tr', { class: r.posicao === 1 ? 'wr' : '' },
                h('td', { class: 'numero' }, r.posicao === 1 ? h('span', { html: icone('trofeu'), title: 'Recorde mundial' }) : r.posicao),
                h('td', {}, r.jogador), h('td', { class: 'numero' }, formatarTempo(r.tempo)), h('td', { class: 'col-data texto-3' }, r.data ? dataCurta(r.data) : '—'),
                h('td', {}, r.video ? h('a', { href: r.video, target: '_blank', rel: 'noopener' }, 'Assistir') : h('span', { class: 'texto-3' }, '—'))))))
              : h('p', { class: 'texto-2' }, 'Ainda não há runs nesta categoria.'));
        } catch {
          tabela.replaceChildren(erro({ titulo: 'Não deu para carregar o ranking', tentar: () => abrirCat(cat) }));
        }
      };
      chips.append(...cats.map((c) => h('button', { class: 'chip', type: 'button', 'data-id': c.id, 'aria-pressed': 'false', onclick: () => abrirCat(c) }, c.nome)));
      abrirCat(cats[0]);
    } catch {
      detalhe.replaceChildren(erro({ titulo: 'Não deu para carregar o jogo', tentar: () => abrirJogo(jogo) }));
    }
  }

  function criarDaCategoria(jogo, cat, wr) {
    const s = ctx.storage;
    const nova = { id: novoId(), ...novaRota({ nome: `${jogo.nome} — ${cat.nome}`, jogo: jogo.nome, splits: ['Fim'] }),
      categoria: { jogoId: jogo.id, categoriaId: cat.id, nome: cat.nome, link: cat.link, wr: wr ? { tempo: wr.tempo, jogador: wr.jogador } : null } };
    s.gravar(CH_ROTAS, [nova, ...lerRotas(s)]);
    s.gravar(CH_ATUAL, nova.id);
    ctx.toast('Rota criada. Edite os splits quando quiser.', 'sucesso');
    trocar('cronometro');
  }

  entrada.addEventListener('keydown', (e) => { if (e.key === 'Enter') buscar(); });
  el.replaceChildren(
    h('form', { class: 'sr-busca', onsubmit: (e) => { e.preventDefault(); buscar(); } },
      h('label', { class: 'busca' }, h('span', { html: icone('busca') }), entrada),
      h('button', { class: 'btn btn-primario', type: 'submit' }, 'Buscar')),
    lista, detalhe);
  if (!lista.childElementCount) lista.append(h('p', { class: 'texto-3' }, 'Busque um jogo para ver os recordes mundiais de cada categoria.'));
}

export default {
  montar(el, ctx) {
    usarEstilo('js/modules/speedrun/estilo.css');
    const area = h('div', {});
    const abas = [{ id: 'cronometro', rotulo: 'Cronômetro' }, { id: 'recordes', rotulo: 'Recordes' }];
    const seg = h('div', { class: 'segmentos', role: 'tablist', 'aria-label': 'Seções do speedrun' });
    const trocar = (id) => {
      limpar.forEach((f) => f()); limpar = [];
      seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.id === id)));
      history.replaceState(null, '', `#/speedrun/${id}`);
      (id === 'recordes' ? telaRecordes : telaCronometro)(area, ctx, trocar);
    };
    seg.append(...abas.map((a) => h('button', { type: 'button', role: 'tab', 'data-id': a.id, onclick: () => trocar(a.id) }, a.rotulo)));
    el.append(cabecalho('Speedrun', 'Recordes mundiais do speedrun.com e um cronômetro com splits para treinar.', seg), area);
    trocar(ctx.params[0] === 'recordes' ? 'recordes' : 'cronometro');
  },
  desmontar() { limpar.forEach((f) => f()); limpar = []; },
  painelInicio(ctx) {
    const comPB = lerRotas(ctx.storage).filter((r) => r.pbTotal !== null);
    const el = comPB.length
      ? h('div', { class: 'pbs' }, comPB.slice(0, 3).map((r) => h('a', { class: 'pb-cartao', href: '#/speedrun/cronometro', onclick: () => ctx.storage.gravar(CH_ATUAL, r.id) },
          h('span', { class: 'texto-3' }, r.nome), h('strong', { class: 'numero' }, formatarTempo(r.pbTotal)),
          r.categoria?.wr ? h('span', { class: 'texto-3' }, `Recorde mundial ${formatarTempo(r.categoria.wr.tempo)}`) : null)))
      : h('div', { class: 'painel painel-vazio' }, h('p', {}, 'Nenhum recorde pessoal ainda.'), h('a', { class: 'btn btn-pequeno', href: '#/speedrun/cronometro' }, 'Abrir cronômetro'));
    return { titulo: 'Seus recordes', el, link: 'Abrir speedrun' };
  }
};
