// "Que jogo eu jogo hoje?" — recomendação sem IA, com motivo, imagem do jogo e trailer.
import { h, usarEstilo, cabecalho, vazio, capa } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { JOGOS, imagens, linkTrailer } from '../../games.js';
import { lerJogos, salvarJogo } from '../diario/dados.js';
import { HUMORES, TEMPOS, COMPANHIAS, PLATAFORMAS, recomendar, sugestaoDoDia, nomeEtiqueta } from './logic.js';

const CH_RESPOSTAS = 'recomendador:respostas';

function grupo(titulo, nome, opcoes, valor, aoEscolher) {
  return h('fieldset', { class: 'pergunta' },
    h('legend', {}, titulo),
    h('div', { class: 'opcoes' }, opcoes.map((o) => {
      const id = o.id ?? o;
      return h('button', { type: 'button', class: 'opcao', 'data-grupo': nome, 'data-valor': id, 'aria-pressed': String(valor === id), onclick: (e) => {
        e.currentTarget.parentElement.querySelectorAll('.opcao').forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
        aoEscolher(id);
      } }, o.rotulo ?? o);
    })));
}

function cartaoSugestao(r, ctx, posicao, aoAdicionar) {
  const { jogo, motivos } = r;
  const img = imagens(jogo);
  const noDiario = lerJogos(ctx.storage).some((d) => d.jogoId === jogo.id);
  const frame = h('div', { class: 'sug-frame' });
  if (img.frame) {
    const i = h('img', { src: img.frame, alt: `Imagem de ${jogo.nome}`, loading: 'lazy', referrerpolicy: 'no-referrer' });
    i.addEventListener('error', () => { i.remove(); frame.append(capa(null, jogo.nome)); });
    frame.append(i);
  } else frame.append(capa(null, jogo.nome));
  return h('article', { class: 'sugestao', style: `--atraso:${posicao * 90}ms`, 'data-jogo': jogo.id },
    frame,
    h('div', { class: 'sug-corpo' },
      h('p', { class: 'sug-meta texto-3' }, `${jogo.generos.join(' · ')} · ${jogo.ano} · ~${jogo.horas} h`),
      h('h3', {}, jogo.nome),
      h('ul', { class: 'sug-motivos' }, motivos.map((m) => h('li', {}, m))),
      h('p', { class: 'sug-etiquetas' }, jogo.etiquetas.slice(0, 5).map((e) => h('span', {}, nomeEtiqueta(e)))),
      h('div', { class: 'sug-acoes' },
        h('a', { class: 'btn btn-pequeno', href: linkTrailer(jogo), target: '_blank', rel: 'noopener', html: `${icone('play')}<span>Ver trailer</span>` }),
        noDiario ? h('a', { class: 'btn btn-pequeno btn-fantasma', href: '#/diario' }, 'Já está no diário')
          : h('button', { class: 'btn btn-pequeno btn-primario', type: 'button', 'data-acao': 'quero', onclick: (e) => aoAdicionar(jogo, e.currentTarget) }, h('span', { html: icone('mais') }), 'Quero jogar'))));
}

export default {
  montar(el, ctx) {
    usarEstilo('js/modules/recomendador/estilo.css');
    const respostas = { humor: 'historia', tempo: 'medio', companhia: 'sozinho', plataforma: 'Qualquer', ...ctx.storage.ler(CH_RESPOSTAS, {}) };
    let vistos = [];
    const resultado = h('section', { class: 'sugestoes', id: 'sugestoes', 'aria-live': 'polite' });

    const adicionar = (jogo, botao) => {
      salvarJogo(ctx.storage, { nome: jogo.nome, jogoId: jogo.id, capa: imagens(jogo).capa, tituloWiki: jogo.wiki, ano: jogo.ano, status: 'quero', nota: null, horas: 0, plataforma: '', favorito: false });
      ctx.toast(`${jogo.nome} foi para “Quero jogar”`, 'sucesso');
      botao.replaceWith(h('a', { class: 'btn btn-pequeno btn-fantasma', href: '#/diario' }, 'Já está no diário'));
    };

    function mostrar(novo) {
      if (novo) vistos = [];
      const lista = recomendar(respostas, lerJogos(ctx.storage), JOGOS, { excluir: vistos });
      if (!lista.length) {
        resultado.replaceChildren(vazio({ titulo: 'Acabaram as sugestões', texto: 'Você já viu todas que combinam com essas respostas. Mude o humor ou a plataforma.', acao: { rotulo: 'Recomeçar', onclick: () => mostrar(true) } }));
        return;
      }
      vistos.push(...lista.map((r) => r.jogo.id));
      resultado.replaceChildren(
        h('div', { class: 'secao-topo' }, h('h2', {}, 'Para hoje'),
          h('button', { class: 'btn btn-pequeno', type: 'button', id: 'outra-sugestao', onclick: () => mostrar(false), html: `${icone('refazer')}<span>Outra sugestão</span>` })),
        h('div', { class: 'sug-lista' }, lista.map((r, i) => cartaoSugestao(r, ctx, i, adicionar))));
    }

    const salvarResp = (campo) => (v) => { respostas[campo] = v; ctx.storage.gravar(CH_RESPOSTAS, respostas); };
    const form = h('form', { class: 'perguntas', onsubmit: (e) => { e.preventDefault(); mostrar(true); resultado.scrollIntoView({ behavior: 'smooth', block: 'start' }); } },
      grupo('Você quer…', 'humor', HUMORES, respostas.humor, salvarResp('humor')),
      grupo('Quanto tempo você tem?', 'tempo', TEMPOS, respostas.tempo, salvarResp('tempo')),
      grupo('Vai jogar…', 'companhia', COMPANHIAS, respostas.companhia, salvarResp('companhia')),
      grupo('Onde?', 'plataforma', PLATAFORMAS, respostas.plataforma, salvarResp('plataforma')),
      h('button', { class: 'btn btn-primario btn-grande', type: 'submit', id: 'recomendar', html: `${icone('brilho')}<span>Me recomenda</span>` }));

    const temNotas = lerJogos(ctx.storage).some((j) => j.nota !== null && j.nota !== undefined);
    el.append(...[
      cabecalho('Que jogo eu jogo hoje?', 'Responda quatro perguntas. As sugestões usam o seu humor e as notas que você deu no diário — sem IA.'),
      temNotas ? null : h('p', { class: 'dica-diario' }, 'Dica: dê notas aos jogos no ', h('a', { href: '#/diario' }, 'diário'), ' para as sugestões ficarem com a sua cara.'),
      form, resultado].filter(Boolean));
  },
  painelInicio(ctx) {
    const s = sugestaoDoDia(lerJogos(ctx.storage), JOGOS);
    if (!s) return null;
    const img = imagens(s.jogo);
    return { titulo: 'Sugestão do dia', link: 'Mais sugestões',
      el: h('a', { class: 'sug-dia', href: '#/recomendador' },
        img.frame ? h('img', { src: img.frame, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' }) : capa(null, s.jogo.nome),
        h('span', {}, h('strong', {}, s.jogo.nome), h('span', { class: 'texto-3' }, `${s.jogo.generos.join(' · ')} · ~${s.jogo.horas} h`))) };
  }
};
