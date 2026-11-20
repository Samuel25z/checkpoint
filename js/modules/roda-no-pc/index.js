// "Roda no meu PC?" — detecta o hardware e compara com os requisitos do catálogo.
import { h, usarEstilo, cabecalho, vazio, modal, confirmar, capa } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { novoId } from '../../storage.js';
import { JOGOS, imagens } from '../../games.js';
import { CPUS, GPUS } from '../../data/hardware.js';
import { NIVEIS, ROTULO_NIVEL, RAMS, explicar, resultado, resumo, validarPc, encontrarCpu, encontrarGpu,
  RESOLUCOES, tabelaFps, qualidadeSugerida, sensacao, comparar, placaPara60, limitante, fpsDoNivel, textoFps } from './logic.js';
import { combobox } from '../../core/combobox.js';
import { detectar } from './detect.js';

const CH_PCS = 'hardware:pcs';
const CH_ATUAL = 'hardware:pcAtual';
const CH_RES = 'hardware:resolucao';
const NOME_PECA = { cpu: 'Processador', gpu: 'Placa de vídeo', ram: 'Memória' };
const classeFps = (fps) => (fps === null ? 'fps-nao' : fps < 30 ? 'fps-ruim' : fps < 60 ? 'fps-ok' : 'fps-bom');
const fmtX = (n) => (n === 1 ? 'igual ao recomendado' : `${String(n).replace('.', ',')}× o recomendado`);
const rotuloRes = (id) => RESOLUCOES.find((x) => x.id === id).rotulo;

/** Detalhe de um jogo: FPS por qualidade e resolução, peça por peça, gargalo e o que trocar. */
function detalheJogo(r, pc, res) {
  const req = r.jogo.requisitos;
  const rotRes = rotuloRes(res);
  const sug = qualidadeSugerida(pc, req, res);
  const tabela = tabelaFps(pc, req);
  const pecas = comparar(pc, req);
  const roda = r.nivel !== 'nao';
  const altoFps = tabela.find((q) => q.id === 'alto').fps[res];
  const placa = roda && altoFps < 60 ? placaPara60(pc, req, res) : null;
  const fpsNivel = roda ? fpsDoNivel(pc, req, r.nivel, res) : null;
  const rotNivel = ROTULO_NIVEL[r.nivel];
  const lim = roda ? limitante(pc, req, { qualidade: r.nivel, resolucao: res }) : null;
  const dica = !sug ? null : sug.fps < 60 ? `Nem no Baixo passa de 60 FPS em ${rotRes}: o máximo fica em ${textoFps(sug.fps)}.`
    : sug.id !== r.nivel ? `Para ficar acima de 60 FPS em ${rotRes}, use o ${sug.rotulo} (${textoFps(sug.fps)} FPS).` : `O ${sug.rotulo} já fica acima de 60 FPS em ${rotRes}.`;
  let troca;
  if (!roda) troca = `${NOME_PECA[r.gargalo]} abaixo do mínimo: o jogo não deve abrir ou fica impraticável.`;
  else if (altoFps >= 60) troca = `Já passa de 60 FPS no Alto em ${rotRes}. Nada a trocar.`;
  else if (placa) troca = `Para ~60 FPS no Alto em ${rotRes}, uma ${placa} já resolve (com o resto do PC igual).`;
  else troca = `Trocar só a placa não chega a 60 FPS no Alto em ${rotRes}: o processador segura.`;
  const qtd = (c, v) => (c.peca === 'ram' ? `${v} GB` : v);
  const corpo = h('div', { class: 'pc-detalhe' },
    h('div', { class: 'pc-det-topo' }, capa(imagens(r.jogo).capa, r.jogo.nome, 'capa-det'),
      h('div', {},
        h('span', { class: `nivel nivel-${r.nivel}` }, ROTULO_NIVEL[r.nivel]),
        h('p', { class: 'pc-det-fps' }, roda ? [h('strong', { class: 'numero' }, textoFps(fpsNivel)), h('span', {}, ` FPS no ${rotNivel} em ${rotRes}`)] : h('strong', {}, 'Não roda')),
        h('p', { class: 'texto-2' }, roda ? `${sensacao(fpsNivel)}. ${explicar(r)}.` : `${explicar(r)}.`),
        dica ? h('p', { class: 'texto-2' }, dica) : null,
        lim ? h('p', { class: 'texto-3' }, `Quem limita o FPS nessa configuração: ${NOME_PECA[lim].toLowerCase()}.`) : null)),
    h('h3', { class: 'pc-det-titulo' }, 'FPS estimado por qualidade'),
    h('div', { class: 'pc-tabela-rolagem' }, h('table', { class: 'pc-tabela' },
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Qualidade'), RESOLUCOES.map((x) => h('th', { scope: 'col', class: x.id === res ? 'atual' : '' }, x.rotulo)))),
      h('tbody', {}, tabela.map((q) => h('tr', {}, h('th', { scope: 'row' }, q.rotulo),
        RESOLUCOES.map((x) => h('td', { class: `${classeFps(q.fps[x.id])} ${x.id === res ? 'atual' : ''}` }, textoFps(q.fps[x.id])))))))),
    h('p', { class: 'texto-3 pc-legenda' }, h('i', { class: 'fps-bom' }), '60 ou mais: liso', h('i', { class: 'fps-ok' }), '30 a 59: jogável', h('i', { class: 'fps-ruim' }), 'abaixo de 30: travando'),
    h('h3', { class: 'pc-det-titulo' }, 'Seu PC peça por peça'),
    h('ul', { class: 'pc-comp' }, pecas.map((c) => h('li', { class: `comp-${c.situacao}` },
      h('div', { class: 'comp-linha' }, h('strong', {}, NOME_PECA[c.peca]),
        h('span', { class: 'comp-sit' }, c.situacao === 'abaixo' ? 'abaixo do mínimo' : c.situacao === 'entre' ? 'entre o mínimo e o recomendado' : fmtX(c.vsRec))),
      h('div', { class: 'comp-barra', 'aria-hidden': 'true' }, h('span', { style: `width:${Math.min(100, c.vsRec * 50)}%` }), h('i', { class: 'marca-rec' })),
      h('p', { class: 'texto-3' }, `Seu: ${c.nome} · Mínimo: ${qtd(c, c.min)} · Recomendado: ${qtd(c, c.rec)}`)))),
    h('h3', { class: 'pc-det-titulo' }, 'O que trocar'),
    h('p', { class: 'pc-troca' }, troca),
    h('p', { class: 'texto-3 pc-nota' }, 'Como calculamos: o requisito recomendado do jogo mira cerca de 60 FPS no Alto em 1080p. A sua placa aumenta ou diminui isso na proporção da força dela, o processador limita o teto e memória abaixo do recomendado tira uns 15%. É uma estimativa: drivers, ray tracing e DLSS/FSR mudam o resultado.'));
  return modal({ titulo: r.jogo.nome, conteudo: corpo, largo: true });
}
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

  const res = RESOLUCOES.some((x) => x.id === s.ler(CH_RES)) ? s.ler(CH_RES) : '1080p';
  const lista = resultado(atual, JOGOS);
  const cont = resumo(lista);
  const linhas = h('ol', { class: 'pc-lista', id: 'lista-jogos-pc' });
  const pintar = () => {
    const t = filtro.texto.toLowerCase();
    const vis = lista.filter((r) => (filtro.nivel === 'todos' || r.nivel === filtro.nivel) && (!t || r.jogo.nome.toLowerCase().includes(t)));
    linhas.replaceChildren(...(vis.length ? vis.map((r) => { const fps = fpsDoNivel(atual, r.jogo.requisitos, r.nivel, res); const abrir = () => detalheJogo(r, atual, res); return h('li', { class: 'pc-jogo', 'data-jogo': r.jogo.id, tabindex: '0', role: 'button', 'aria-label': `${r.jogo.nome}: ver detalhes`,
      onclick: abrir, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); } } },
      capa(imagens(r.jogo).capa, r.jogo.nome, 'capa-mini'),
      h('div', { class: 'pc-jogo-texto' }, h('strong', {}, r.jogo.nome), h('span', { class: 'texto-3' }, explicar(r))),
      h('span', { class: `pc-fps ${classeFps(fps)}` }, h('strong', {}, fps === null ? '—' : `${textoFps(fps)} FPS`), h('small', {}, fps === null ? 'sem FPS' : `${ROTULO_NIVEL[r.nivel]} · ${rotuloRes(res)}`)),
      h('span', { class: `nivel nivel-${r.nivel}` }, h('span', { class: 'barras', 'aria-hidden': 'true' }, NIVEIS.slice(1).map((n, i) => h('i', { class: i < NIVEIS.findIndex((x) => x.id === r.nivel) ? 'cheia' : '' }))), ROTULO_NIVEL[r.nivel])); }) : [h('li', { class: 'texto-2 sem-resultado' }, 'Nenhum jogo com esse filtro.')]));
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
    h('div', { class: 'pc-res', role: 'group', 'aria-label': 'Resolução do monitor' }, h('span', { class: 'texto-3' }, 'Resolução do monitor:'),
      RESOLUCOES.map((x) => h('button', { type: 'button', class: 'pc-res-op', 'data-res': x.id, 'aria-pressed': String(x.id === res), onclick: () => { s.gravar(CH_RES, x.id); desenhar(el, ctx); } }, x.rotulo))),
    h('label', { class: 'busca pc-busca' }, h('span', { class: 'sr' }, 'Filtrar jogos'), h('span', { html: icone('busca') }),
      h('input', { class: 'entrada', type: 'search', placeholder: 'Filtrar jogos', value: filtro.texto, oninput: (e) => { filtro.texto = e.target.value; pintar(); } })),
    linhas,
    h('p', { class: 'texto-3 pc-nota' }, 'FPS e nível são estimativas a partir dos requisitos mínimos e recomendados divulgados pelos jogos. Clique num jogo para ver a conta, peça por peça.'));
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
