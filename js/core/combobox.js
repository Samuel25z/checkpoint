// combobox.js — campo de escolha com busca (substitui o <datalist>, que esconde as outras opções
// quando já tem valor e se comporta diferente no celular).
import { h } from './ui.js';
import { icone } from './icons.js';

const norm = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Filtra opções: todas as partes digitadas precisam aparecer, em qualquer ordem. */
export function filtrarOpcoes(opcoes, texto, limite = 60) {
  const partes = norm(texto).split(/\s+/).filter(Boolean);
  if (!partes.length) return opcoes.slice(0, limite);
  const achadas = opcoes.filter((o) => { const n = norm(o); return partes.every((p) => n.includes(p)); });
  // as que começam pelo modelo digitado vêm primeiro
  return achadas.sort((a, b) => Number(!norm(b).includes(partes.join(' '))) - Number(!norm(a).includes(partes.join(' '))) || a.length - b.length).slice(0, limite);
}

let seq = 0;

/** Cria o campo. Retorna o elemento; o valor fica em el.input (name) para FormData. */
export function combobox({ name, opcoes, valor = '', placeholder = '', rotulo }) {
  const id = `cb-${++seq}`;
  const input = h('input', { class: 'entrada cb-entrada', name, value: valor, placeholder, autocomplete: 'off', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': `${id}-lista`, 'aria-autocomplete': 'list', 'aria-label': rotulo });
  const lista = h('ul', { class: 'cb-lista', id: `${id}-lista`, role: 'listbox', hidden: true });
  const limpar = h('button', { type: 'button', class: 'cb-botao cb-limpar', 'aria-label': `Limpar ${rotulo}`, html: icone('fechar') });
  const abrir = h('button', { type: 'button', class: 'cb-botao cb-abrir', 'aria-label': `Ver todas as opções de ${rotulo}`, tabindex: '-1', html: icone('seta') });
  const raiz = h('div', { class: 'cb' }, input, limpar, abrir, lista);
  let ativo = -1;
  let itens = [];
  let mostrarTudo = false;

  function pintar() {
    itens = filtrarOpcoes(opcoes, mostrarTudo ? '' : input.value);
    ativo = Math.min(ativo, itens.length - 1);
    lista.replaceChildren(...(itens.length
      ? itens.map((o, i) => h('li', { role: 'option', id: `${id}-o${i}`, class: `cb-opcao ${i === ativo ? 'ativa' : ''} ${o === input.value ? 'escolhida' : ''}`, 'aria-selected': String(o === input.value), onmousedown: (e) => { e.preventDefault(); escolher(o); } }, o))
      : [h('li', { class: 'cb-vazio' }, 'Nenhuma peça com esse nome. Tente só o número do modelo.')]));
    if (ativo >= 0) { input.setAttribute('aria-activedescendant', `${id}-o${ativo}`); lista.children[ativo]?.scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
    limpar.hidden = !input.value;
  }
  let fechamento;
  function mostrar(tudo) { clearTimeout(fechamento); mostrarTudo = tudo; lista.hidden = false; input.setAttribute('aria-expanded', 'true'); ativo = -1; pintar(); }
  function esconder() { lista.hidden = true; input.setAttribute('aria-expanded', 'false'); }
  function escolher(o) { input.value = o; esconder(); limpar.hidden = false; input.dispatchEvent(new Event('change', { bubbles: true })); }

  input.addEventListener('focus', () => mostrar(true));
  input.addEventListener('click', () => { if (lista.hidden) mostrar(true); });
  input.addEventListener('input', () => { mostrar(false); });
  // fecha um pouco depois de sair do campo (para o clique na opção valer); voltar ao campo cancela
  input.addEventListener('blur', () => { clearTimeout(fechamento); fechamento = setTimeout(esconder, 120); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (lista.hidden) mostrar(true); ativo = Math.min(itens.length - 1, ativo + 1); pintar(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); ativo = Math.max(0, ativo - 1); pintar(); }
    else if (e.key === 'Enter' && !lista.hidden && itens.length) { e.preventDefault(); escolher(itens[Math.max(0, ativo)]); }
    else if (e.key === 'Escape' && !lista.hidden) { e.stopPropagation(); esconder(); }
  });
  limpar.addEventListener('click', () => { input.value = ''; input.focus(); mostrar(true); });
  abrir.addEventListener('click', () => { input.focus(); mostrar(true); });
  limpar.hidden = !valor;
  raiz.input = input;
  return raiz;
}
