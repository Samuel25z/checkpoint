// configuracoes.js — botão de configurações: visual, idioma e ajuda do controle.
import { h, modal } from './ui.js';
import { icone } from './icons.js';
import { IDIOMAS } from './i18n.js';
import { VISUAIS, aplicarVisual, visualValido } from './visual.js';

function miniatura(v) {
  const [fundo, a, b] = v.cores;
  return h('span', { class: `vis-mini vis-${v.id}`, 'aria-hidden': 'true', style: `--m-fundo:${fundo};--m-a:${a};--m-b:${b}` },
    h('i', { class: 'm-trilho' }), h('i', { class: 'm-banner' }), h('i', { class: 'm-c1' }), h('i', { class: 'm-c2' }), h('i', { class: 'm-c3' }));
}

export function iniciarConfiguracoes(ctx) {
  const botao = h('button', { class: 'btn-icone', id: 'botao-config', type: 'button', 'aria-label': 'Configurações', title: 'Configurações', html: icone('config') });
  document.getElementById('botao-tema').before(botao);
  botao.addEventListener('click', async () => {
    const atual = ctx.storage.ler('pref:idioma', 'pt');
    const visualAtual = visualValido(ctx.storage.ler('pref:visual'));

    const visuais = h('div', { class: 'vis-opcoes', role: 'radiogroup', 'aria-label': 'Visual' },
      VISUAIS.map((v) => h('button', { type: 'button', role: 'radio', class: 'vis-opcao', 'data-visual': v.id, 'aria-checked': String(v.id === visualAtual), onclick: (e) => {
        visuais.querySelectorAll('.vis-opcao').forEach((b) => b.setAttribute('aria-checked', String(b === e.currentTarget)));
        aplicarVisual(v.id, ctx.storage);
        ctx.toast(`Visual ${v.nome} aplicado`, 'sucesso');
      } }, miniatura(v), h('span', { class: 'vis-texto' }, h('strong', {}, v.nome, v.id === 'deck' ? h('span', { class: 'vis-padrao' }, 'padrão') : null), h('span', {}, v.descricao)))));

    const idioma = h('div', { class: 'segmentos', role: 'radiogroup', 'aria-label': 'Idioma' },
      IDIOMAS.map((i) => h('button', { type: 'button', role: 'radio', 'aria-checked': String(i.id === atual), 'aria-selected': String(i.id === atual), 'data-idioma': i.id, onclick: () => {
        if (i.id === atual) { modal.fecharAtual(null); return; }
        ctx.storage.gravar('pref:idioma', i.id);
        location.reload();
      } }, i.rotulo)));

    await modal({ titulo: 'Configurações', largo: true, conteudo: h('div', { class: 'config' },
      h('div', { class: 'campo' }, h('span', { class: 'rotulo' }, 'Visual'), visuais),
      h('div', { class: 'campo' }, h('span', { class: 'rotulo' }, 'Idioma'), idioma),
      h('div', { class: 'config-controle' }, h('span', { html: icone('controle') }), h('div', {}, h('strong', {}, 'Controle de videogame'),
        h('p', { class: 'texto-2' }, 'Conecte um controle de Xbox ou PlayStation e aperte qualquer botão. Direcional move, A confirma, B volta, LB/RB trocam de aba, X marca o split.')))) });
  });
}
