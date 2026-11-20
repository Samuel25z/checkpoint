// Início — banner do jogo em andamento, sua estante e o resumo de cada aba.
// Cada módulo pode exportar painelInicio(ctx) → { titulo, rota, el } para aparecer aqui.
import { h, usarEstilo, capa, dataCurta } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { arteDoRegistro } from '../../games.js';
import { lerJogos } from '../diario/dados.js';
import { ROTULO_STATUS } from '../diario/logic.js';

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

const num = (n) => String(n).replace('.', ',');

/** Fundo do banner: arte larga do jogo, senão a capa desfocada, senão o padrão da marca. */
function fundoBanner(r) {
  const { hero, capa: c } = arteDoRegistro(r);
  const fundo = h('div', { class: 'banner-fundo', 'aria-hidden': 'true' });
  if (hero || c) {
    const img = h('img', { src: hero || c, alt: '', class: hero ? 'arte' : 'arte desfocada', referrerpolicy: 'no-referrer', decoding: 'async' });
    img.addEventListener('error', () => { if (hero && c && img.src !== c) { img.src = c; img.className = 'arte desfocada'; } else img.remove(); });
    fundo.append(img);
  }
  return fundo;
}

function banner(jogo, ctx) {
  if (!jogo) {
    return h('section', { class: 'banner banner-vazio' },
      h('div', { class: 'banner-fundo padrao-hex', 'aria-hidden': 'true' }),
      h('div', { class: 'banner-texto' },
        h('p', { class: 'banner-kicker' }, saudacao()),
        h('h1', {}, 'Seu checkpoint'),
        h('p', { class: 'banner-sub' }, 'O que você está jogando, seus recordes e seus torneios, salvos num lugar só.'),
        h('div', { class: 'banner-acoes' },
          h('a', { class: 'btn btn-primario', href: '#/diario/adicionar', html: `${icone('mais')}<span>Adicionar jogo</span>` }),
          h('a', { class: 'btn', href: '#/recomendador', html: `${icone('brilho')}<span>Que jogo eu jogo hoje?</span>` }))));
  }
  const c = jogo.conquistas;
  const pct = c?.total ? Math.round((c.feitas / c.total) * 100) : null;
  const dados = [
    jogo.nota !== null && jogo.nota !== undefined ? [`${num(jogo.nota)}/5`, 'sua nota'] : null,
    c?.total ? [`${c.feitas}/${c.total}`, 'conquistas'] : null,
    jogo.ultimaVez ? [dataCurta(jogo.ultimaVez).replace(/ de \d{4}$/, ''), 'última vez'] : jogo.inicio ? [dataCurta(jogo.inicio).replace(/ de \d{4}$/, ''), 'começou'] : null
  ].filter(Boolean);
  return h('section', { class: 'banner', 'aria-label': `Continuar jogando: ${jogo.nome}` },
    fundoBanner(jogo),
    h('div', { class: 'banner-texto' },
      h('p', { class: 'banner-kicker' }, `Continuar jogando${jogo.horas ? ` · ${num(jogo.horas)} h` : ''}`),
      h('h2', { class: 'banner-titulo' }, jogo.nome),
      dados.length ? h('dl', { class: 'banner-dados' }, dados.map(([v, r]) => h('div', {}, h('dt', {}, r), h('dd', {}, v)))) : null,
      h('div', { class: 'banner-acoes' },
        h('a', { class: 'btn btn-primario', href: `#/diario/${encodeURIComponent(jogo.id)}` }, 'Abrir no diário'),
        h('a', { class: 'btn btn-vidro', href: '#/speedrun' }, 'Cronometrar run'))),
    pct !== null ? h('div', { class: 'anel', style: `--pct:${pct}`, role: 'img', 'aria-label': `${pct}% das conquistas` }, h('span', {}, `${pct}%`, h('small', {}, 'conquistas'))) : null);
}

export default {
  async montar(el, ctx) {
    usarEstilo('js/modules/inicio/estilo.css');
    const outros = ctx.registro.todos().filter((m) => m.id !== 'inicio');
    const diario = lerJogos(ctx.storage);
    const ordem = (a, b) => String(b.ultimaVez || b.atualizadoEm || '').localeCompare(String(a.ultimaVez || a.atualizadoEm || ''));
    const jogando = diario.filter((j) => j.status === 'jogando').sort(ordem);
    const estante = [...diario].sort(ordem).slice(0, 8);

    el.append(banner(jogando[0], ctx));

    if (estante.length) {
      el.append(h('section', { class: 'secao estante' },
        h('div', { class: 'secao-topo' }, h('h2', {}, 'Sua estante'), h('a', { href: '#/diario' }, 'Ver diário')),
        h('div', { class: 'estante-grade' }, estante.map((j) => {
          const cx = capa(arteDoRegistro(j).capa, j.nome);
          cx.prepend(h('span', { class: `faixa st-${j.status}` }, ROTULO_STATUS[j.status]));
          return h('a', { class: 'carta', href: `#/diario/${encodeURIComponent(j.id)}`, 'aria-label': `${j.nome}, ${ROTULO_STATUS[j.status]}` }, cx, h('span', { class: 'carta-nome' }, j.nome));
        }))));
    }

    el.append(h('nav', { class: 'atalhos secao', 'aria-label': 'Atalhos para as abas' },
      outros.map((m) => h('a', { class: 'atalho', href: `#/${m.rota}`, 'data-rota': m.rota },
        h('span', { class: 'atalho-icone', html: icone(m.icone) }),
        h('span', { class: 'atalho-texto' }, h('strong', {}, m.titulo), h('span', {}, DESCRICOES[m.id] || ''))))));

    const paineis = h('div', { class: 'inicio-paineis' });
    el.append(paineis);
    for (const m of outros) {
      if (m.id === 'diario') continue; // o diário já aparece no banner e na estante
      try {
        const { default: mod } = await m.carregar();
        if (typeof mod.painelInicio !== 'function') continue;
        usarEstilo(`js/modules/${m.id}/estilo.css`); // o painel usa o visual da própria aba
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
