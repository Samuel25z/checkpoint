// Diário — registrar o que você joga e zera, com capa automática.
import { h, esc, usarEstilo, cabecalho, vazio, carregando, erro, modal, confirmar, capa, dataCurta } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { JOGOS, POR_ID, imagens, buscarNoCatalogo } from '../../games.js';
import { wikipedia } from '../../services/wikipedia.js';
import { STATUS, ROTULO_STATUS, PLATAFORMAS, ORDENS, validarRegistro, filtrar, ordenar, contar, idYoutube, textoAtividade, textoNota } from './logic.js';
import { lerJogos, lerAtividades, salvarJogo, removerJogo } from './dados.js';

let estado = { status: 'todos', plataforma: '', texto: '', ordem: 'recentes' };

/* ---------- peças ---------- */
export function estrelas(nota, classe = '') {
  if (nota === null || nota === undefined) return h('span', { class: `estrelas vazio ${classe}` }, 'sem nota');
  const el = h('span', { class: `estrelas ${classe}`, role: 'img', 'aria-label': textoNota(nota) });
  for (let i = 1; i <= 5; i++) {
    const tipo = nota >= i ? 'cheia' : nota >= i - 0.5 ? 'meia' : 'vazia';
    el.append(h('span', { class: `estrela ${tipo}`, html: icone('estrela') }));
  }
  return el;
}

function selo(status) {
  return h('span', { class: `selo st-${status}` }, h('span', { class: 'ponto' }), ROTULO_STATUS[status]);
}

function cartaJogo(j, aoAbrir) {
  return h('button', { class: 'carta', type: 'button', 'data-id': j.id, 'aria-label': `${j.nome}, ${ROTULO_STATUS[j.status]}`, onclick: () => aoAbrir(j) },
    h('span', { class: 'carta-selo selo st-' + j.status }, h('span', { class: 'ponto' }), ROTULO_STATUS[j.status]),
    j.favorito ? h('span', { class: 'carta-fav', html: icone('coracao'), title: 'Favorito' }) : null,
    capa(j.capa, j.nome),
    h('span', { class: 'carta-nome' }, j.nome),
    h('span', { class: 'carta-meta' }, j.nota !== null && j.nota !== undefined ? estrelas(j.nota, 'mini') : null, j.horas ? `${String(j.horas).replace('.', ',')} h` : null));
}

/* ---------- formulário ---------- */
function campo(rotulo, entrada, nomeErro) {
  return h('label', { class: 'campo' }, h('span', {}, rotulo), entrada, h('span', { class: 'campo-erro', 'data-erro': nomeErro }));
}

function seletorNota(valor) {
  const wrap = h('div', { class: 'nota-input' });
  const range = h('input', { type: 'range', min: '0', max: '5', step: '0.5', name: 'nota', value: valor ?? 0, 'aria-label': 'Nota de 0 a 5 estrelas' });
  const semNota = h('input', { type: 'checkbox', name: 'semNota' });
  if (valor === null || valor === undefined) semNota.checked = true;
  const visor = h('span', { class: 'nota-visor' });
  const pintar = () => {
    visor.replaceChildren(semNota.checked ? h('span', { class: 'texto-3' }, 'sem nota') : estrelas(Number(range.value)));
    range.disabled = semNota.checked;
  };
  range.addEventListener('input', () => { semNota.checked = false; pintar(); });
  semNota.addEventListener('change', pintar);
  pintar();
  wrap.append(visor, range, h('label', { class: 'check' }, semNota, 'Ainda sem nota'));
  return wrap;
}

async function abrirFormulario(base, ctx) {
  const r = { status: 'jogando', plataforma: 'PC', horas: '', nota: null, favorito: false, ...base };
  const form = h('form', { class: 'form-jogo', novalidate: true });
  const topo = h('div', { class: 'form-topo' }, capa(r.capa, r.nome, 'capa-form'),
    h('div', {}, h('h3', {}, r.nome), r.ano ? h('p', { class: 'texto-3' }, String(r.ano)) : null,
      h('div', { class: 'chips status-escolha', role: 'radiogroup', 'aria-label': 'Status' },
        STATUS.map((s) => h('button', { type: 'button', class: `chip st-${s.id}`, role: 'radio', 'aria-checked': String(r.status === s.id), 'aria-pressed': String(r.status === s.id), 'data-status': s.id, onclick: (e) => {
          form.querySelectorAll('[data-status]').forEach((b) => { const sel = b === e.currentTarget; b.setAttribute('aria-pressed', sel); b.setAttribute('aria-checked', sel); });
          r.status = s.id;
        } }, h('span', { class: 'ponto' }), s.rotulo)))));
  form.append(topo,
    h('span', { class: 'campo-erro', 'data-erro': 'status' }),
    h('div', { class: 'grade-campos' },
      campo('Plataforma', h('select', { class: 'entrada', name: 'plataforma' }, PLATAFORMAS.map((p) => h('option', { value: p, selected: p === r.plataforma }, p))), 'plataforma'),
      campo('Horas jogadas', h('input', { class: 'entrada', name: 'horas', inputmode: 'decimal', placeholder: '12,5', value: r.horas ? String(r.horas).replace('.', ',') : '' }), 'horas'),
      campo('Começou em', h('input', { class: 'entrada', type: 'date', name: 'inicio', value: r.inicio || '' }), 'inicio'),
      campo('Zerou em', h('input', { class: 'entrada', type: 'date', name: 'fim', value: r.fim || '' }), 'fim')),
    h('div', { class: 'campo' }, h('span', {}, 'Sua nota'), seletorNota(r.nota), h('span', { class: 'campo-erro', 'data-erro': 'nota' })),
    campo('Resenha curta', h('textarea', { class: 'entrada', name: 'resenha', maxlength: '1000', placeholder: 'O que achou? Vale a pena?' }, r.resenha || ''), 'resenha'),
    campo('Vídeo do YouTube (opcional)', h('input', { class: 'entrada', name: 'video', placeholder: 'https://youtu.be/…', value: r.video || '' }), 'video'),
    h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'favorito', checked: r.favorito }), 'Marcar como favorito'));

  const acoes = h('div', { class: 'modal-acoes form-acoes' },
    h('button', { type: 'button', class: 'btn', 'data-acao': 'cancelar' }, 'Cancelar'),
    h('button', { type: 'submit', class: 'btn btn-primario', 'data-acao': 'salvar' }, r.id ? 'Salvar alterações' : 'Adicionar ao diário'));
  form.append(acoes);

  const promessa = modal({ titulo: r.id ? 'Editar jogo' : 'Adicionar ao diário', conteudo: form, acoes: [], largo: true });
  acoes.querySelector('[data-acao="cancelar"]').addEventListener('click', () => modal.fecharAtual(null));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const { ok, erros, valor } = validarRegistro({
      ...r, plataforma: f.get('plataforma'), horas: f.get('horas'), inicio: f.get('inicio'), fim: f.get('fim'),
      nota: f.get('semNota') ? null : f.get('nota'), resenha: f.get('resenha'), video: f.get('video'), favorito: f.get('favorito') === 'on'
    });
    form.querySelectorAll('[data-erro]').forEach((el) => { el.textContent = erros[el.dataset.erro] || ''; });
    if (!ok) { form.querySelector('.campo-erro:not(:empty)')?.scrollIntoView({ block: 'center' }); return; }
    try {
      const salvo = salvarJogo(ctx.storage, valor);
      modal.fecharAtual(salvo);
    } catch (err) {
      ctx.toast(err.message, 'erro');
    }
  });
  return promessa;
}

/* ---------- busca para adicionar ---------- */
async function abrirBusca(ctx) {
  const resultados = h('div', { class: 'busca-resultados', 'aria-live': 'polite' });
  const entrada = h('input', { class: 'entrada', type: 'search', name: 'busca-jogo', placeholder: 'Nome do jogo (ex.: Hollow Knight)', autocomplete: 'off', 'aria-label': 'Buscar jogo' });
  const corpo = h('div', { class: 'busca-adicionar' }, h('div', { class: 'busca' }, h('span', { html: icone('busca') }), entrada), resultados,
    h('p', { class: 'texto-3 busca-nota' }, 'Capas e resumos vêm da Wikipedia. Não achou? Use o nome que você digitou.'));
  let escolhido = null;
  let tempo;

  const escolher = (item) => { escolhido = item; modal.fecharAtual('escolhido'); };
  const linha = (item, origem) => h('button', { type: 'button', class: 'resultado', 'data-origem': origem, onclick: () => escolher(item) },
    capa(item.capa, item.nome, 'capa-mini'),
    h('span', { class: 'resultado-texto' }, h('strong', {}, item.nome), h('span', { class: 'texto-3' }, [item.ano, origem === 'wiki' ? 'Wikipedia' : 'Catálogo do Checkpoint'].filter(Boolean).join(' · '))));

  async function pesquisar() {
    const t = entrada.value.trim();
    if (t.length < 2) { resultados.replaceChildren(); return; }
    const locais = buscarNoCatalogo(t).map((j) => ({ nome: j.nome, ano: j.ano, capa: imagens(j).capa, jogoId: j.id, tituloWiki: j.wiki }));
    const manual = h('button', { type: 'button', class: 'resultado resultado-manual', onclick: () => escolher({ nome: t }) },
      h('span', { class: 'capa-mini capa', html: icone('mais') }), h('span', { class: 'resultado-texto' }, h('strong', {}, `Adicionar “${t}”`), h('span', { class: 'texto-3' }, 'sem capa automática')));
    resultados.replaceChildren(...locais.map((l) => linha(l, 'catalogo')), carregando('Buscando na Wikipedia…'), manual);
    try {
      const wiki = await wikipedia.pesquisar(t);
      if (entrada.value.trim() !== t) return;
      const nomesLocais = new Set(locais.map((l) => l.nome.toLowerCase()));
      const extras = wiki.filter((w) => !nomesLocais.has(w.titulo.toLowerCase())).map((w) => ({ nome: w.titulo, ano: w.ano, capa: w.capa, resumo: w.resumo, tituloPt: w.tituloPt, tituloWiki: w.tituloWiki }));
      resultados.replaceChildren(...locais.map((l) => linha(l, 'catalogo')), ...extras.map((w) => linha(w, 'wiki')), manual);
    } catch {
      if (entrada.value.trim() !== t) return;
      resultados.replaceChildren(...locais.map((l) => linha(l, 'catalogo')),
        h('p', { class: 'aviso-rede' }, 'Sem conexão com a Wikipedia agora. Você ainda pode usar o catálogo ou adicionar pelo nome.'), manual);
    }
  }
  entrada.addEventListener('input', () => { clearTimeout(tempo); tempo = setTimeout(pesquisar, 300); });
  entrada.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(tempo); pesquisar(); } });

  const r = await modal({ titulo: 'Adicionar jogo', conteudo: corpo, acoes: [], largo: true });
  if (r !== 'escolhido' || !escolhido) return null;
  return abrirFormulario(escolhido, ctx);
}

/* ---------- detalhe ---------- */
async function abrirDetalhe(j, ctx, redesenhar) {
  const resumo = h('p', { class: 'detalhe-resumo' }, j.resumo || '');
  const video = idYoutube(j.video);
  const corpo = h('div', { class: 'detalhe' },
    h('div', { class: 'detalhe-lado' }, capa(j.capa, j.nome, 'capa-detalhe')),
    h('div', { class: 'detalhe-info' },
      h('div', { class: 'detalhe-selos' }, selo(j.status), j.favorito ? h('span', { class: 'selo fav' }, h('span', { html: icone('coracao') }), 'Favorito') : null),
      estrelas(j.nota),
      h('dl', { class: 'detalhe-dados' },
        j.plataforma ? [h('dt', {}, 'Plataforma'), h('dd', {}, j.plataforma)] : null,
        [h('dt', {}, 'Horas'), h('dd', {}, j.horas ? `${String(j.horas).replace('.', ',')} h` : '—')],
        j.inicio ? [h('dt', {}, 'Começou'), h('dd', {}, dataCurta(j.inicio))] : null,
        j.fim ? [h('dt', {}, 'Zerou'), h('dd', {}, dataCurta(j.fim))] : null),
      j.resenha ? h('blockquote', { class: 'detalhe-resenha' }, j.resenha) : null,
      resumo,
      video ? h('div', { class: 'video' }, h('iframe', { src: `https://www.youtube-nocookie.com/embed/${video}`, title: `Vídeo de ${j.nome}`, loading: 'lazy', allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen', allowfullscreen: true })) : null));

  // Resumo em português quando existe; o texto em inglês da busca fica de reserva.
  const pedido = j.tituloPt ? wikipedia.resumoPt(j.tituloPt) : j.tituloWiki ? wikipedia.resumo(j.tituloWiki) : null;
  pedido?.then((t) => { if (t) resumo.textContent = t; }).catch(() => { /* sem rede: fica o resumo salvo */ });

  const acao = await modal({
    titulo: j.nome, conteudo: corpo, largo: true,
    acoes: [
      { rotulo: 'Excluir', valor: 'excluir', tipo: 'perigo' },
      { rotulo: j.favorito ? 'Tirar dos favoritos' : 'Favoritar', valor: 'favoritar' },
      { rotulo: 'Editar', valor: 'editar', tipo: 'primario' }
    ]
  });
  if (acao === 'editar') { const s = await abrirFormulario(j, ctx); if (s) { ctx.toast('Alterações salvas', 'sucesso'); redesenhar(); } }
  if (acao === 'favoritar') { salvarJogo(ctx.storage, { ...j, favorito: !j.favorito }); ctx.toast(j.favorito ? 'Removido dos favoritos' : 'Adicionado aos favoritos'); redesenhar(); }
  if (acao === 'excluir' && await confirmar('Excluir do diário?', `${j.nome} sai do seu diário. Isso não pode ser desfeito.`, 'Excluir', true)) {
    removerJogo(ctx.storage, j.id); ctx.toast('Jogo excluído'); redesenhar();
  }
}

/* ---------- tela ---------- */
function desenhar(el, ctx) {
  const todos = lerJogos(ctx.storage);
  const c = contar(todos);
  const adicionar = async () => { const s = await abrirBusca(ctx); if (s) { ctx.toast(`${s.nome} adicionado ao diário`, 'sucesso'); desenhar(el, ctx); } };
  const redesenhar = () => desenhar(el, ctx);

  const topo = cabecalho('Diário', 'Tudo o que você joga, zera e quer jogar, com capa automática.',
    h('button', { class: 'btn btn-primario', id: 'botao-adicionar', onclick: adicionar, html: `${icone('mais')}<span>Adicionar jogo</span>` }));

  if (!todos.length) {
    el.replaceChildren(topo, vazio({ titulo: 'Comece seu diário', texto: 'Adicione o jogo que você está jogando agora. A capa aparece sozinha.', acao: { rotulo: 'Adicionar primeiro jogo', onclick: adicionar } }));
    return;
  }

  const filtros = [{ id: 'todos', rotulo: 'Todos' }, ...STATUS, { id: 'favoritos', rotulo: 'Favoritos' }];
  const barra = h('div', { class: 'diario-barra' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Filtrar por status' }, filtros.map((f) =>
      h('button', { type: 'button', class: `chip ${f.id !== 'todos' && f.id !== 'favoritos' ? 'st-' + f.id : ''}`, 'aria-pressed': String(estado.status === f.id), 'data-filtro': f.id,
        onclick: () => { estado.status = f.id; redesenhar(); } }, f.rotulo, h('span', { class: 'chip-num' }, c[f.id] ?? 0)))),
    h('div', { class: 'diario-controles' },
      h('label', { class: 'busca' }, h('span', { class: 'sr' }, 'Buscar no diário'), h('span', { html: icone('busca') }),
        h('input', { class: 'entrada', type: 'search', placeholder: 'Buscar no diário', value: estado.texto, id: 'busca-diario', oninput: (e) => { estado.texto = e.target.value; pintarGrade(); } })),
      h('label', {}, h('span', { class: 'sr' }, 'Plataforma'), h('select', { class: 'entrada', id: 'filtro-plataforma', onchange: (e) => { estado.plataforma = e.target.value; pintarGrade(); } },
        h('option', { value: '' }, 'Todas as plataformas'), PLATAFORMAS.map((p) => h('option', { value: p, selected: estado.plataforma === p }, p)))),
      h('label', {}, h('span', { class: 'sr' }, 'Ordenar'), h('select', { class: 'entrada', id: 'ordem', onchange: (e) => { estado.ordem = e.target.value; pintarGrade(); } },
        ORDENS.map((o) => h('option', { value: o.id, selected: estado.ordem === o.id }, o.rotulo))))));

  const grade = h('div', { class: 'grade-capas', id: 'grade-diario' });
  function pintarGrade() {
    const lista = ordenar(filtrar(todos, estado), estado.ordem);
    if (!lista.length) { grade.replaceChildren(h('p', { class: 'texto-2 sem-resultado' }, 'Nenhum jogo com esses filtros.')); return; }
    grade.replaceChildren(...lista.map((j) => cartaJogo(j, (x) => abrirDetalhe(x, ctx, redesenhar))));
  }
  pintarGrade();

  const ativ = lerAtividades(ctx.storage).slice(0, 8);
  const historico = h('section', { class: 'secao' }, h('div', { class: 'secao-topo' }, h('h2', {}, 'Histórico')),
    ativ.length ? h('ol', { class: 'historico', id: 'historico' }, ativ.map((a) => h('li', {}, h('span', { class: 'historico-texto' }, 'Você ' + textoAtividade(a)), h('time', { datetime: a.quando, class: 'texto-3' }, dataCurta(a.quando)))))
      : h('p', { class: 'texto-3' }, 'As mudanças no diário aparecem aqui.'));

  el.replaceChildren(topo, barra, grade, historico);
}

export default {
  montar(el, ctx) {
    usarEstilo('js/modules/diario/estilo.css');
    desenhar(el, ctx);
    if (ctx.params[0] === 'adicionar') el.querySelector('#botao-adicionar')?.click();
  },
  painelInicio(ctx) {
    usarEstilo('js/modules/diario/estilo.css');
    const jogando = ordenar(lerJogos(ctx.storage).filter((j) => j.status === 'jogando'), 'recentes').slice(0, 10);
    const abrir = () => ctx.irPara('diario');
    const el = jogando.length
      ? h('div', { class: 'fileira' }, jogando.map((j) => cartaJogo(j, abrir)))
      : h('div', { class: 'painel painel-vazio' }, h('p', {}, 'Nada em andamento. O que você está jogando agora?'), h('a', { class: 'btn btn-primario btn-pequeno', href: '#/diario/adicionar' }, 'Adicionar jogo'));
    return { titulo: 'Continuar jogando', el, link: 'Abrir diário' };
  }
};
