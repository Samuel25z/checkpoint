// configuracoes.js — botão de configurações: idioma e ajuda do controle.
import { h, modal } from './ui.js';
import { icone } from './icons.js';
import { IDIOMAS } from './i18n.js';

export function iniciarConfiguracoes(ctx) {
  const botao = h('button', { class: 'btn-icone', id: 'botao-config', type: 'button', 'aria-label': 'Configurações', title: 'Configurações', html: icone('config') });
  document.getElementById('botao-tema').before(botao);
  botao.addEventListener('click', async () => {
    const atual = ctx.storage.ler('pref:idioma', 'pt');
    const escolha = h('div', { class: 'segmentos', role: 'radiogroup', 'aria-label': 'Idioma' },
      IDIOMAS.map((i) => h('button', { type: 'button', role: 'radio', 'aria-checked': String(i.id === atual), 'aria-selected': String(i.id === atual), 'data-idioma': i.id, onclick: () => {
        if (i.id === atual) { modal.fecharAtual(null); return; }
        ctx.storage.gravar('pref:idioma', i.id);
        location.reload();
      } }, i.rotulo)));
    await modal({ titulo: 'Configurações', conteudo: h('div', { class: 'config' },
      h('div', { class: 'campo' }, h('span', { class: 'rotulo' }, 'Idioma'), escolha),
      h('div', { class: 'config-controle' }, h('span', { html: icone('controle') }), h('div', {}, h('strong', {}, 'Controle de videogame'),
        h('p', { class: 'texto-2' }, 'Conecte um controle de Xbox ou PlayStation e aperte qualquer botão. Direcional move, A confirma, B volta, LB/RB trocam de aba, X marca o split.')))) });
  });
}
