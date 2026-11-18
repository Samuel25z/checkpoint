// Início — painel que junta um resumo de cada aba.
// Cada módulo pode exportar painelInicio(ctx) → { titulo, rota, el } para aparecer aqui.
import { h, usarEstilo } from '../../core/ui.js';
import { icone } from '../../core/icons.js';

const DESCRICOES = {
  diario: 'Registre o que joga e zera',
  speedrun: 'Recordes e cronômetro',
  recomps: 'Ports e recomps do GitHub',
  'roda-no-pc': 'Veja se seu PC aguenta',
  torneio: 'Monte a chave com os amigos',
  recomendador: 'Que jogo eu jogo hoje?',
  wrapped: 'Seu ano em jogos'
};

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 5) return 'Boa madrugada';
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default {
  async montar(el, ctx) {
    usarEstilo('js/modules/inicio/estilo.css');
    const outros = ctx.registro.todos().filter((m) => m.id !== 'inicio');

    el.append(
      h('section', { class: 'inicio-topo' },
        h('p', { class: 'inicio-ola' }, saudacao()),
        h('h1', {}, 'Seu checkpoint'),
        h('p', { class: 'aba-sub' }, 'O que você está jogando, seus recordes e seus torneios, salvos num lugar só.')),
      h('nav', { class: 'atalhos', 'aria-label': 'Atalhos para as abas' },
        outros.map((m) => h('a', { class: 'atalho', href: `#/${m.rota}`, 'data-rota': m.rota },
          h('span', { class: 'atalho-icone', html: icone(m.icone) }),
          h('span', { class: 'atalho-texto' }, h('strong', {}, m.titulo), h('span', {}, DESCRICOES[m.id] || ''))))));

    if (!outros.length) {
      el.append(h('p', { class: 'texto-2 secao' }, 'As abas aparecem aqui assim que forem adicionadas ao registro.'));
      return;
    }

    const paineis = h('div', { class: 'inicio-paineis' });
    el.append(paineis);
    for (const m of outros) {
      try {
        const { default: mod } = await m.carregar();
        if (typeof mod.painelInicio !== 'function') continue;
        const painel = await mod.painelInicio(ctx);
        if (!painel) continue;
        paineis.append(h('section', { class: `secao inicio-painel painel-${m.id}` },
          h('div', { class: 'secao-topo' }, h('h2', {}, painel.titulo), h('a', { href: `#/${painel.rota || m.rota}` }, painel.link || `Abrir ${m.titulo}`)),
          painel.el));
      } catch (e) {
        console.warn(`Painel de ${m.id} indisponível`, e);
      }
    }
  }
};
