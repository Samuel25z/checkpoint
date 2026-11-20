// "Roda no meu PC?" — detecta o hardware e compara com os requisitos do catálogo.
import { h, usarEstilo, cabecalho, vazio, modal, confirmar, capa } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { novoId } from '../../storage.js';
import { JOGOS, imagens } from '../../games.js';
import { CPUS, GPUS } from '../../data/hardware.js';
import { NIVEIS, ROTULO_NIVEL, RAMS, explicar, resultado, resumo, validarPc, encontrarCpu, encontrarGpu } from './logic.js';
import { combobox } from '../../core/combobox.js';
import { detectar } from './detect.js';

const CH_PCS = 'hardware:pcs';
const CH_ATUAL = 'hardware:pcAtual';
let filtro = { nivel: 'todos', texto: '' };

async function formularioPc(base) {
  const det = detectar();
  const pc = { nome: 'Meu PC', ram: 16, ...base };
  if (!base) { if (det.gpu) pc.gpu = det.gpu; if (det.ramAprox && det.ramAprox >= 8) pc.ram = Math.max(8, det.ramAprox); }
  const campoCpu = combobox({ name: 'cpu', opcoes: Object.keys(CPUS), valor: pc.cpu || '', placeholder: 'Digite parte do nome: 10400, Ryzen 5 3600…', rotulo: 'Processador' });
  const campoGpu = combobox({ name: 'gpu', opcoes: Object.keys(GPUS), valor: pc.gpu || '', placeholder: 'Digite parte do nome: 3060, RX 580…', rotulo: 'Placa de vídeo' });
  const form = h('form', { class: 'form-pc', novalidate: true },
    h('div', { class: 'deteccao', id: 'deteccao' },
      h('span', { html: icone('chip') }),
      h('div', {},
        h('strong', {}, det.gpu ? `Detectamos: ${det.gpu}` : 'Não deu para reconhecer sua placa de vídeo'),
        h('p', { class: 'texto-3' }, det.textoGpu ? `O navegador informou “${det.textoGpu.slice(0, 90)}”. ` : '', det.nucleos ? `Seu processador tem ${det.nucleos} núcleos lógicos — escolha o modelo abaixo.` : 'Escolha as peças nas listas.'))),
    h('label', { class: 'campo' }, h('span', {}, 'Nome'), h('input', { class: 'entrada', name: 'nome', value: pc.nome, placeholder: 'Meu PC' }), h('span', { class: 'campo-erro', 'data-erro': 'nome' })),
    h('div', { class: 'campo' }, h('span', {}, 'Processador'), campoCpu, h('span', { class: 'campo-erro', 'data-erro': 'cpu' })),
    h('div', { class: 'campo' }, h('span', {}, 'Placa de vídeo'), campoGpu, h('span', { class: 'campo-erro', 'data-erro': 'gpu' })),
    h('label', { class: 'campo' }, h('span', {}, 'Memória RAM'), h('select', { class: 'entrada', name: 'ram' }, RAMS.map((r) => h('option', { value: r, selected: r === Number(pc.ram) }, `${r} GB`))), h('span', { class: 'campo-erro', 'data-erro': 'ram' })),
    h('div', { class: 'modal-acoes form-acoes' },
      h('button', { type: 'button', class: 'btn', onclick: () => modal.fecharAtual(null) }, 'Cancelar'),
      h('button', { type: 'submit', class: 'btn btn-primario' }, base ? 'Salvar PC' : 'Ver o que roda')));
  const p = modal({ titulo: base ? 'Editar PC' : 'Seu PC', conteudo: form, acoes: [] });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    f.cpu = CPUS[f.cpu] ? f.cpu : encontrarCpu(f.cpu) || f.cpu;
    f.gpu = GPUS[f.gpu] ? f.gpu : encontrarGpu(f.gpu) || f.gpu;
    const { ok, erros, valor } = validarPc(f);
    form.querySelectorAll('[data-erro]').forEach((el) => { el.textContent = erros[el.dataset.erro] || ''; });
    if (ok) modal.fecharAtual(valor);
  });
  return p;
}

function desenhar(el, ctx) {
  const s = ctx.storage;
  const pcs = s.ler(CH_PCS, []);
  const atual = pcs.find((p) => p.id === s.ler(CH_ATUAL)) || pcs[0];
  const novo = async () => {
    const v = await formularioPc(null);
    if (!v) return;
    const pc = { id: novoId(), ...v, atualizadoEm: new Date().toISOString() };
    s.gravar(CH_PCS, [...s.ler(CH_PCS, []), pc]);
    s.gravar(CH_ATUAL, pc.id);
    ctx.toast(`${pc.nome} salvo`, 'sucesso');
    desenhar(el, ctx);
  };
  const topo = cabecalho('Roda no meu PC?', 'Descubra em que qualidade cada jogo do catálogo roda no seu computador. É uma estimativa pelos requisitos oficiais.',
    h('button', { class: 'btn btn-primario', id: 'botao-novo-pc', onclick: novo, html: `${icone('mais')}<span>${pcs.length ? 'Adicionar PC' : 'Analisar meu PC'}</span>` }));

  if (!atual) {
    el.replaceChildren(topo, vazio({ titulo: 'Vamos olhar seu PC', texto: 'O site tenta reconhecer sua placa de vídeo sozinho. Você confirma o processador e a memória.', acao: { rotulo: 'Analisar meu PC', onclick: novo } }));
    return;
  }

  const editar = async () => {
    const v = await formularioPc(atual);
    if (!v) return;
    s.gravar(CH_PCS, s.ler(CH_PCS, []).map((p) => (p.id === atual.id ? { ...p, ...v, atualizadoEm: new Date().toISOString() } : p)));
    desenhar(el, ctx);
  };
  const excluir = async () => {
    if (!await confirmar('Excluir este PC?', `“${atual.nome}” sai da sua lista.`, 'Excluir', true)) return;
    s.gravar(CH_PCS, s.ler(CH_PCS, []).filter((p) => p.id !== atual.id));
    s.remover(CH_ATUAL);
    desenhar(el, ctx);
  };

  const lista = resultado(atual, JOGOS);
  const cont = resumo(lista);
  const linhas = h('ol', { class: 'pc-lista', id: 'lista-jogos-pc' });
  const pintar = () => {
    const t = filtro.texto.toLowerCase();
    const vis = lista.filter((r) => (filtro.nivel === 'todos' || r.nivel === filtro.nivel) && (!t || r.jogo.nome.toLowerCase().includes(t)));
    linhas.replaceChildren(...(vis.length ? vis.map((r) => h('li', { class: 'pc-jogo', 'data-jogo': r.jogo.id },
      capa(imagens(r.jogo).capa, r.jogo.nome, 'capa-mini'),
      h('div', { class: 'pc-jogo-texto' }, h('strong', {}, r.jogo.nome), h('span', { class: 'texto-3' }, explicar(r))),
      h('span', { class: `nivel nivel-${r.nivel}` }, h('span', { class: 'barras', 'aria-hidden': 'true' }, NIVEIS.slice(1).map((n, i) => h('i', { class: i < NIVEIS.findIndex((x) => x.id === r.nivel) ? 'cheia' : '' }))), ROTULO_NIVEL[r.nivel]))) : [h('li', { class: 'texto-2 sem-resultado' }, 'Nenhum jogo com esse filtro.')]));
  };
  pintar();

  el.replaceChildren(topo,
    h('div', { class: 'pc-cartao' },
      h('div', { class: 'pc-abas', role: 'tablist', 'aria-label': 'Seus PCs' }, pcs.map((p) => h('button', { role: 'tab', type: 'button', 'aria-selected': String(p.id === atual.id), onclick: () => { s.gravar(CH_ATUAL, p.id); desenhar(el, ctx); } }, p.nome))),
      h('dl', { class: 'pc-pecas' },
        h('div', {}, h('dt', {}, 'Processador'), h('dd', {}, atual.cpu)),
        h('div', {}, h('dt', {}, 'Placa de vídeo'), h('dd', {}, atual.gpu)),
        h('div', {}, h('dt', {}, 'Memória'), h('dd', {}, `${atual.ram} GB`))),
      h('div', { class: 'pc-acoes' },
        h('button', { class: 'btn btn-pequeno', onclick: editar, html: `${icone('editar')}<span>Editar</span>` }),
        h('button', { class: 'btn btn-pequeno btn-fantasma', onclick: excluir, html: `${icone('lixeira')}<span>Excluir</span>` }))),
    h('div', { class: 'pc-resumo', id: 'resumo-pc' }, [...NIVEIS].reverse().map((n) => h('button', { type: 'button', class: `pc-total nivel-${n.id}`, 'aria-pressed': String(filtro.nivel === n.id), 'data-nivel': n.id,
      onclick: () => { filtro.nivel = filtro.nivel === n.id ? 'todos' : n.id; el.querySelectorAll('.pc-total').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.nivel === filtro.nivel))); pintar(); } },
      h('strong', { class: 'numero' }, cont[n.id]), h('span', {}, n.rotulo)))),
    h('label', { class: 'busca pc-busca' }, h('span', { class: 'sr' }, 'Filtrar jogos'), h('span', { html: icone('busca') }),
      h('input', { class: 'entrada', type: 'search', placeholder: 'Filtrar jogos', value: filtro.texto, oninput: (e) => { filtro.texto = e.target.value; pintar(); } })),
    linhas,
    h('p', { class: 'texto-3 pc-nota' }, 'Estimativa a partir dos requisitos mínimos e recomendados divulgados pelos jogos. Resolução, drivers e otimizações mudam o resultado.'));
}

export default {
  montar(el, ctx) { usarEstilo('js/modules/roda-no-pc/estilo.css'); desenhar(el, ctx); },
  painelInicio(ctx) {
    const pcs = ctx.storage.ler(CH_PCS, []);
    if (!pcs.length) return null;
    const pc = pcs.find((p) => p.id === ctx.storage.ler(CH_ATUAL)) || pcs[0];
    const c = resumo(resultado(pc, JOGOS));
    return { titulo: `O que roda no ${pc.nome}`, link: 'Ver todos', el: h('p', { class: 'texto-2' }, `${c.ultra + c.alto} jogos no alto ou ultra, ${c.medio + c.baixo} no médio ou baixo e ${c.nao} que não rodam.`) };
  }
};
