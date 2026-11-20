// ui.js — peças de interface reutilizáveis: criação de elementos, avisos (toast),
// janela de confirmação própria (substitui alert/confirm) e os estados de tela.
import { icone } from './icons.js';

/** Escapa texto para uso seguro dentro de HTML. */
export function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Cria um elemento: h('button', { class: 'btn', onclick }, 'Texto', outroEl). */
export function h(tag, attrs = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat()) {
    if (f === null || f === undefined || f === false) continue;
    el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
  return el;
}

/** Cria vários elementos a partir de um trecho de HTML confiável (montado com esc()). */
export function html(trecho) {
  const t = document.createElement('template');
  t.innerHTML = trecho.trim();
  return t.content.childElementCount === 1 ? t.content.firstElementChild : t.content;
}

/* ---------- toast ---------- */
let pilha;
export function toast(mensagem, tipo = 'info', duracao = 3200) {
  if (!pilha) {
    pilha = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
    document.body.append(pilha);
  }
  const el = h('div', { class: `toast toast-${tipo}` }, mensagem);
  pilha.append(el);
  setTimeout(() => { el.classList.add('saindo'); setTimeout(() => el.remove(), 250); }, duracao);
  return el;
}

/* ---------- modal ---------- */
/**
 * Abre uma janela. conteudo: Node ou string de texto. acoes: [{ rotulo, valor, tipo }].
 * Retorna uma Promise com o valor da ação escolhida (ou null ao fechar).
 */
export function modal({ titulo, conteudo, acoes = [{ rotulo: 'Fechar', valor: null }], largo = false }) {
  return new Promise((resolver) => {
    const anterior = document.activeElement;
    const fundo = h('div', { class: 'modal-fundo', 'data-modal': '' });
    const caixa = h('div', { class: `modal ${largo ? 'modal-largo' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'modal-titulo' });
    const fechar = (valor) => {
      fundo.classList.add('saindo');
      document.removeEventListener('keydown', teclas);
      setTimeout(() => fundo.remove(), 180);
      anterior?.focus?.();
      resolver(valor);
    };
    const teclas = (e) => {
      if (e.key === 'Escape') fechar(null);
      if (e.key === 'Tab') {
        const foco = [...caixa.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled);
        if (!foco.length) return;
        const [p, u] = [foco[0], foco[foco.length - 1]];
        if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); }
        else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); }
      }
    };
    caixa.append(...[
      h('div', { class: 'modal-topo' },
        h('h2', { id: 'modal-titulo' }, titulo),
        h('button', { class: 'btn-icone', 'aria-label': 'Fechar', onclick: () => fechar(null), html: icone('fechar') })),
      h('div', { class: 'modal-corpo' }, typeof conteudo === 'string' ? h('p', {}, conteudo) : conteudo),
      acoes.length ? h('div', { class: 'modal-acoes' }, acoes.map((a) =>
        h('button', { class: `btn ${a.tipo === 'perigo' ? 'btn-perigo' : a.tipo === 'primario' ? 'btn-primario' : ''}`, 'data-acao': a.valor ?? 'fechar', onclick: () => fechar(a.valor) }, a.rotulo))) : null
    ].filter(Boolean));
    fundo.append(caixa);
    fundo.addEventListener('mousedown', (e) => { if (e.target === fundo) fechar(null); });
    document.addEventListener('keydown', teclas);
    document.body.append(fundo);
    // foco inicial: campo do formulário, senão a ação principal; nunca uma ação destrutiva
    (caixa.querySelector('.modal-corpo input, .modal-corpo select, .modal-corpo textarea') || caixa.querySelector('.modal-acoes .btn-primario')
      || caixa.querySelector('.modal-acoes .btn:not(.btn-perigo)') || caixa.querySelector('.modal-topo .btn-icone') || caixa).focus();
    modal.fecharAtual = fechar;
  });
}

/** Confirmação com o visual do site. Retorna true/false. */
export async function confirmar(titulo, texto, rotuloSim = 'Confirmar', perigo = false) {
  const r = await modal({ titulo, conteudo: texto, acoes: [{ rotulo: 'Cancelar', valor: false }, { rotulo: rotuloSim, valor: true, tipo: perigo ? 'perigo' : 'primario' }] });
  return r === true;
}

/* ---------- estados de tela ---------- */
export function carregando(texto = 'Carregando…') {
  return h('div', { class: 'estado estado-carregando', role: 'status' }, h('span', { class: 'giro', 'aria-hidden': 'true' }), h('p', {}, texto));
}

export function vazio({ titulo, texto, acao }) {
  return h('div', { class: 'estado estado-vazio' },
    h('div', { class: 'estado-icone', html: icone('bandeira') }),
    h('h3', {}, titulo), texto ? h('p', {}, texto) : null,
    acao ? h('button', { class: 'btn btn-primario', onclick: acao.onclick }, acao.rotulo) : null);
}

export function erro({ titulo = 'Algo deu errado', texto, tentar }) {
  return h('div', { class: 'estado estado-erro', role: 'alert' },
    h('div', { class: 'estado-icone', html: icone('alerta') }),
    h('h3', {}, titulo), texto ? h('p', {}, texto) : null,
    tentar ? h('button', { class: 'btn', onclick: tentar }, 'Tentar de novo') : null);
}

/** Carrega a folha de estilo de uma aba uma única vez (cada aba guarda seu CSS na própria pasta). */
export function usarEstilo(url) {
  const href = new URL(url, document.baseURI).href;
  if ([...document.styleSheets].some((s) => s.href === href) || document.querySelector(`link[data-estilo="${href}"]`)) return;
  document.head.append(h('link', { rel: 'stylesheet', href, 'data-estilo': href }));
}

/** Cabeçalho padrão de cada aba. */
export function cabecalho(titulo, subtitulo, ...acoes) {
  return h('header', { class: 'aba-topo' },
    h('div', {}, h('h1', {}, titulo), subtitulo ? h('p', { class: 'aba-sub' }, subtitulo) : null),
    acoes.length ? h('div', { class: 'aba-acoes' }, acoes) : null);
}

/** Capa gerada quando não há imagem: iniciais sobre uma cor derivada do nome. */
export function capaGerada(nome) {
  let n = 0;
  for (const c of String(nome)) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  const tom = n % 360;
  const iniciais = String(nome).split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return { tom, iniciais };
}

/** Elemento de capa com fallback automático. */
export function capa(url, nome, classe = '') {
  const { tom, iniciais } = capaGerada(nome);
  const el = h('div', { class: `capa ${classe}`, style: `--tom:${tom}` }, h('span', { class: 'capa-iniciais', 'aria-hidden': 'true' }, iniciais));
  if (url) {
    const img = h('img', { src: url, alt: `Capa de ${nome}`, loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' });
    img.addEventListener('error', () => img.remove());
    img.addEventListener('load', () => el.classList.add('com-imagem'));
    el.append(img);
  }
  return el;
}

/** Formata data ISO (AAAA-MM-DD) para 18 nov 2026. */
export function dataCurta(iso) {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '');
}
