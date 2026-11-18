// app.js — liga o Checkpoint: tema, menu de abas e roteador.
import { storage } from './storage.js';
import { registro } from './modules/registry.js';
import { criarRoteador, irPara } from './core/router.js';
import { icone } from './core/icons.js';
import { h, toast } from './core/ui.js';
import { iniciarConta } from './core/conta.js';

const raiz = document.documentElement;

/* ---------- tema ---------- */
function aplicarTema(tema) {
  raiz.dataset.tema = tema;
  const botao = document.getElementById('botao-tema');
  const outro = tema === 'escuro' ? 'claro' : 'escuro';
  botao.innerHTML = icone(tema === 'escuro' ? 'sol' : 'lua');
  botao.setAttribute('aria-label', `Mudar para o tema ${outro}`);
  botao.title = `Tema ${outro}`;
  document.querySelector('meta[name="theme-color"]').content = tema === 'escuro' ? '#161a21' : '#f4f5f8';
}

function iniciarTema() {
  const salvo = storage.ler('pref:tema');
  aplicarTema(salvo || raiz.dataset.tema || 'escuro');
  document.getElementById('botao-tema').addEventListener('click', () => {
    const novo = raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro';
    raiz.classList.add('trocando-tema');
    aplicarTema(novo);
    storage.gravar('pref:tema', novo);
    setTimeout(() => raiz.classList.remove('trocando-tema'), 300);
  });
}

/* ---------- menu ---------- */
function montarMenu() {
  const lista = document.getElementById('nav-lista');
  lista.replaceChildren(...registro.todos().map((m) =>
    h('li', {}, h('a', { href: `#/${m.rota}`, class: 'nav-item', 'data-rota': m.rota, html: `${icone(m.icone)}<span>${m.titulo}</span>` }))));
}

function marcarMenu(mod) {
  document.querySelectorAll('.nav-item').forEach((a) => {
    const ativo = a.dataset.rota === mod.rota;
    a.classList.toggle('ativo', ativo);
    if (ativo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  document.title = mod.id === 'inicio' ? 'Checkpoint — seu hub de jogos' : `${mod.titulo} · Checkpoint`;
}

/* ---------- início ---------- */
function iniciar() {
  storage.migrar();
  iniciarTema();
  montarMenu();
  const ctx = { storage, registro, irPara, toast };
  window.checkpoint = ctx; // ponto de acesso para extensões (sync, controle)
  const roteador = criarRoteador({ registro, palco: document.getElementById('palco'), ctx, aoTrocar: marcarMenu });
  ctx.roteador = roteador;
  ctx.conta = iniciarConta(ctx);
  window.addEventListener('error', (e) => console.error('[checkpoint]', e.message));
  roteador.navegar();
  document.dispatchEvent(new CustomEvent('checkpoint:pronto', { detail: ctx }));
}

iniciar();
