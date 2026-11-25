// Meu Perfil — cartão de visitas do jogador: capa, nível, números, favoritos com coroa, estatísticas e medalhas.
// Tudo é calculado do Diário; o perfil só guarda nome, frase, favoritos e o coroado.
import { h, usarEstilo, cabecalho, modal, toast, capa, vazio } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { irPara } from '../../core/router.js';
import { arteDoRegistro } from '../../games.js';
import { lerJogos, lerAtividades } from '../diario/dados.js';
import { ROTULO_STATUS } from '../diario/logic.js';
import {
  lerPerfil, validarPerfil, iniciais, numeros, xp, nivel, medalhas, distribuicaoNotas, generos, radar, mapaAtividade,
  destaques, resumoDoAno, recentes, desde
} from './logic.js';
import { CHAVE_IMAGENS, LIMITES, kb, lerImagens, validarLink, prepararArquivo, linkAbre } from './imagens.js';
import { criarSocial } from '../../services/social.js';
import { atualizarPublico } from '../amigos/publicar.js';

const CHAVE = 'perfil:dados';
const fmt = (n) => Number(n).toLocaleString('pt-BR');
const nota = (n) => String(n).replace('.', ',');

/* ---------- edição ---------- */
/** Bloco de escolha de foto ou banner: arquivo do aparelho, link ou remover. Mexe em imgs[alvo]. */
function seletorImagem(alvo, imgs, perfil) {
  const nomeAlvo = alvo === 'avatar' ? 'Foto' : 'Banner';
  const previa = h('div', { class: `pf-previa pf-previa-${alvo}` });
  const aviso = h('p', { class: 'campo-erro', 'data-erro': `img-${alvo}`, 'aria-live': 'polite' });
  const arquivo = h('input', { type: 'file', accept: 'image/gif,image/png,image/jpeg,image/webp', class: 'sr', 'aria-label': `Arquivo do ${nomeAlvo.toLowerCase()}`, 'data-arquivo': alvo });
  const linkCampo = h('input', { class: 'entrada', type: 'url', inputmode: 'url', placeholder: 'https://…/imagem.gif', 'aria-label': `Link do ${nomeAlvo.toLowerCase()}`, 'data-link': alvo });
  const caixaLink = h('div', { class: 'pf-link-caixa', hidden: true }, linkCampo,
    h('button', { type: 'button', class: 'btn btn-pequeno', 'data-usar-link': alvo, onclick: async () => {
      const v = validarLink(linkCampo.value);
      if (!v.ok) { aviso.textContent = v.erro; return; }
      aviso.textContent = 'Conferindo o link…';
      if (!await linkAbre(v.url)) { aviso.textContent = 'Não deu para abrir essa imagem. Confira se o link é da imagem em si (termina em .gif, .png, .jpg ou .webp).'; return; }
      imgs[alvo] = { origem: 'link', url: v.url }; aviso.textContent = ''; caixaLink.hidden = true; pintar();
    } }, 'Usar link'));
  const pintar = () => {
    const atual = imgs[alvo];
    previa.replaceChildren(atual
      ? h('img', { src: atual.url, alt: `${nomeAlvo} escolhido`, referrerpolicy: 'no-referrer' })
      : alvo === 'avatar' ? h('span', { class: 'pf-previa-iniciais' }, iniciais(perfil.nome)) : h('span', { class: 'texto-3' }, 'Sem banner: usa a arte do jogo coroado'));
    remover.hidden = !atual;
    origem.textContent = atual ? (atual.origem === 'link' ? 'Por link' : 'Arquivo enviado') : '';
  };
  const origem = h('span', { class: 'texto-3' });
  const remover = h('button', { type: 'button', class: 'btn btn-pequeno btn-fantasma', 'data-remover': alvo, onclick: () => { delete imgs[alvo]; aviso.textContent = ''; pintar(); } }, 'Remover');
  arquivo.addEventListener('change', async () => {
    const f = arquivo.files?.[0];
    arquivo.value = '';
    if (!f) return;
    aviso.textContent = 'Preparando a imagem…';
    const r = await prepararArquivo(f, alvo);
    if (r.erro) { aviso.textContent = r.erro; return; }
    imgs[alvo] = { origem: 'arquivo', url: r.url }; aviso.textContent = ''; pintar();
  });
  pintar();
  return h('div', { class: 'pf-imagem', 'data-imagem': alvo },
    h('div', { class: 'pf-imagem-topo' }, h('strong', {}, nomeAlvo), origem),
    previa,
    h('div', { class: 'pf-imagem-acoes' },
      h('button', { type: 'button', class: 'btn btn-pequeno', 'data-enviar': alvo, onclick: () => arquivo.click(), html: `${icone('mais')}<span>Enviar arquivo</span>` }),
      h('button', { type: 'button', class: 'btn btn-pequeno', 'data-abrir-link': alvo, onclick: () => { caixaLink.hidden = !caixaLink.hidden; if (!caixaLink.hidden) linkCampo.focus(); } }, 'Usar um link'),
      remover, arquivo),
    caixaLink, aviso,
    h('p', { class: 'texto-3' }, `Foto é reduzida sozinha. GIF até ${kb(LIMITES[alvo])}; maior que isso, use um link.`));
}

async function editar(ctx, perfil, diario) {
  const imgs = { ...lerImagens(ctx.storage.ler(CHAVE_IMAGENS, {})) };
  const escolhidos = new Set(perfil.favoritos);
  let coroado = perfil.coroado;
  const lista = h('div', { class: 'pf-escolha', role: 'group', 'aria-label': 'Jogos favoritos' });
  const contador = h('span', { class: 'texto-3', 'aria-live': 'polite' });
  const pintar = () => {
    if (!escolhidos.has(coroado)) coroado = [...escolhidos][0] || null;
    contador.textContent = `${escolhidos.size} de 5`;
    lista.replaceChildren(...[...diario].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map((r) => {
      const marcado = escolhidos.has(r.id);
      return h('div', { class: `pf-opcao ${marcado ? 'marcada' : ''}` },
        h('button', { type: 'button', class: 'pf-opcao-jogo', 'aria-pressed': String(marcado), 'data-fav': r.id, disabled: !marcado && escolhidos.size >= 5, onclick: () => { marcado ? escolhidos.delete(r.id) : escolhidos.add(r.id); pintar(); } },
          capa(arteDoRegistro(r).capa, r.nome, 'capa-mini'), h('span', {}, r.nome)),
        marcado ? h('button', { type: 'button', class: `pf-coroar ${coroado === r.id ? 'ativo' : ''}`, 'aria-pressed': String(coroado === r.id), 'aria-label': `Coroar ${r.nome}`, title: 'Destaque principal', 'data-coroa': r.id, html: icone('coroa'), onclick: () => { coroado = r.id; pintar(); } }) : null);
    }));
  };
  pintar();
  const form = h('form', { class: 'form-perfil', novalidate: true },
    h('label', { class: 'campo' }, h('span', {}, 'Nome'), h('input', { class: 'entrada', name: 'nome', value: perfil.nome, maxlength: 40, placeholder: 'Como você quer aparecer' }), h('span', { class: 'campo-erro', 'data-erro': 'nome' })),
    h('label', { class: 'campo' }, h('span', {}, 'Frase'), h('input', { class: 'entrada', name: 'frase', value: perfil.frase, maxlength: 140, placeholder: 'Uma frase sua, de jogo ou de personagem' }), h('span', { class: 'campo-erro', 'data-erro': 'frase' })),
    h('div', { class: 'campo' }, h('span', { class: 'pf-rotulo' }, 'Foto e banner'), h('p', { class: 'texto-3' }, 'Pode ser GIF. Link não ocupa espaço nenhum.'),
      h('div', { class: 'pf-imagens' }, seletorImagem('avatar', imgs, perfil), seletorImagem('banner', imgs, perfil))),
    h('div', { class: 'campo' }, h('span', { class: 'pf-rotulo' }, 'Jogos favoritos ', contador), h('p', { class: 'texto-3' }, 'Escolha até 5 do seu Diário. A coroa marca o destaque principal, que vira a capa do perfil.'),
      diario.length ? lista : h('p', { class: 'texto-2' }, 'Seu Diário está vazio. Adicione jogos para escolher favoritos.'), h('span', { class: 'campo-erro', 'data-erro': 'favoritos' })),
    h('div', { class: 'modal-acoes form-acoes' },
      h('button', { type: 'button', class: 'btn', onclick: () => modal.fecharAtual(null) }, 'Cancelar'),
      h('button', { type: 'submit', class: 'btn btn-primario' }, 'Salvar perfil')));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const { ok, erros, valor } = validarPerfil({ nome: f.get('nome'), frase: f.get('frase'), favoritos: [...escolhidos], coroado }, diario);
    form.querySelectorAll('[data-erro]').forEach((el) => { el.textContent = erros[el.dataset.erro] || ''; });
    if (ok) modal.fecharAtual(valor);
  });
  const v = await modal({ titulo: 'Editar perfil', conteudo: form, acoes: [], largo: true });
  if (!v) return false;
  ctx.storage.gravar(CHAVE, v);
  try { ctx.storage.gravar(CHAVE_IMAGENS, lerImagens(imgs)); } catch { toast('Sem espaço no navegador para a imagem. Use um link.', 'erro'); }
  toast('Perfil salvo', 'sucesso');
  if (ctx.conta?.usuario) atualizarPublico(criarSocial(ctx.conta), ctx.storage).catch(() => {});
  return true;
}

/* ---------- peças ---------- */
function topo(perfil, diario, n, lv, aoEditar, imgs = {}) {
  const coroa = diario.find((r) => r.id === perfil.coroado);
  const arteJogo = coroa ? arteDoRegistro(coroa).hero : null;
  const hero = imgs.banner?.url || arteJogo;
  const fundo = h('div', { class: 'pf-capa-fundo padrao-hex' });
  if (hero) {
    const i = h('img', { src: hero, alt: '', loading: 'eager', referrerpolicy: 'no-referrer' });
    // banner que não abre (link fora do ar) volta para a arte do jogo
    i.addEventListener('error', () => { if (imgs.banner && arteJogo && i.src !== arteJogo) i.src = arteJogo; else i.remove(); });
    if (imgs.banner) fundo.classList.add('com-banner');
    fundo.append(i);
  }
  const avatar = h('div', { class: 'pf-avatar', 'aria-hidden': 'true' }, iniciais(perfil.nome));
  if (imgs.avatar) {
    const foto = h('img', { src: imgs.avatar.url, alt: '', referrerpolicy: 'no-referrer' });
    foto.addEventListener('error', () => { foto.remove(); avatar.classList.remove('com-foto'); });
    avatar.classList.add('com-foto');
    avatar.append(foto);
  }
  const quando = desde(diario);
  return h('section', { class: 'pf-capa', 'aria-label': 'Cartão do jogador' }, fundo,
    h('div', { class: 'pf-capa-conteudo' },
      avatar,
      h('div', { class: 'pf-quem' },
        h('h2', {}, perfil.nome || 'Jogador sem nome', h('span', { class: 'pf-titulo' }, lv.titulo)),
        perfil.frase ? h('p', { class: 'pf-frase' }, `“${perfil.frase}”`) : null,
        h('div', { class: 'pf-nivel' },
          h('strong', {}, `Nível ${lv.nivel}`),
          h('span', { class: 'pf-xp', role: 'progressbar', 'aria-label': 'Progresso até o próximo nível', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(lv.progresso * 100) }, h('i', { style: `width:${Math.round(lv.progresso * 100)}%` })),
          h('span', { class: 'texto-3' }, `faltam ${fmt(lv.faltam)} XP`)),
        quando ? h('p', { class: 'texto-3' }, `No Checkpoint desde ${quando}`) : null),
      h('button', { class: 'btn btn-pequeno pf-editar', id: 'botao-editar-perfil', onclick: aoEditar, html: `${icone('editar')}<span>Editar perfil</span>` })),
    h('dl', { class: 'pf-numeros' },
      [['Jogos', fmt(n.jogos)], ['Finalizados', fmt(n.finalizados)], ['Platinados', fmt(n.platinados)], ['Horas', fmt(n.horas)], ['Nota média', n.media === null ? '—' : nota(n.media)]]
        .map(([r, v]) => h('div', {}, h('dd', {}, v), h('dt', {}, r)))));
}

function cartaoJogo(r, { coroado = false } = {}) {
  const extra = [r.horas ? `${fmt(r.horas)} h` : null, r.conquistas?.total ? `${r.conquistas.feitas}/${r.conquistas.total}` : null].filter(Boolean).join(' · ');
  return h('a', { class: `pf-jogo ${coroado ? 'coroado' : ''}`, href: `#/diario/${encodeURIComponent(r.id)}`, 'aria-label': `${r.nome}${coroado ? ', destaque principal' : ''}` },
    coroado ? h('span', { class: 'pf-coroa', html: icone('coroa'), 'aria-hidden': 'true' }) : null,
    capa(arteDoRegistro(r).capa, r.nome, 'pf-jogo-capa'),
    h('span', { class: 'pf-jogo-nome' }, r.nome),
    h('span', { class: 'texto-3' }, extra || ROTULO_STATUS[r.status]));
}

function favoritos(perfil, diario, aoEditar) {
  const lista = perfil.favoritos.map((id) => diario.find((r) => r.id === id)).filter(Boolean);
  return h('section', { class: 'pf-bloco' },
    h('div', { class: 'pf-bloco-topo' }, h('h3', {}, 'Jogos favoritos'), lista.length ? h('button', { class: 'btn btn-pequeno btn-fantasma', onclick: aoEditar }, 'Trocar') : null),
    lista.length
      ? h('div', { class: 'pf-favoritos' }, lista.map((r) => cartaoJogo(r, { coroado: r.id === perfil.coroado })))
      : h('div', { class: 'pf-vazio' }, h('p', { class: 'texto-2' }, 'Escolha até 5 jogos do Diário e coroe o seu preferido.'), h('button', { class: 'btn btn-primario btn-pequeno', id: 'botao-escolher-favoritos', onclick: aoEditar }, 'Escolher favoritos')));
}

function medalhasBloco(diario) {
  const lista = medalhas(diario);
  return h('section', { class: 'pf-bloco' },
    h('div', { class: 'pf-bloco-topo' }, h('h3', {}, 'Medalhas'), h('span', { class: 'texto-3' }, `${lista.filter((m) => m.grau).length} de ${lista.length} conquistadas`)),
    h('ul', { class: 'pf-medalhas' }, lista.map((m) => h('li', { class: `pf-medalha ${m.grau || 'bloqueada'}`, 'data-medalha': m.id },
      h('span', { class: 'pf-medalha-icone', 'aria-hidden': 'true', html: '<svg viewBox="0 0 34 34"><path d="M17 1.8 30.2 9.4v15.2L17 32.2 3.8 24.6V9.4Z"/></svg>' }),
      h('div', {},
        h('strong', {}, m.nome),
        h('span', { class: 'pf-grau' }, m.grau ? { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro' }[m.grau] : 'Bloqueada'),
        h('span', { class: 'texto-3' }, m.proximo ? `${fmt(m.valor)} de ${fmt(m.proximo)} ${m.texto}` : `${fmt(m.valor)} ${m.texto} · grau máximo`),
        h('span', { class: 'pf-barra', 'aria-hidden': 'true' }, h('i', { style: `width:${Math.round(m.progresso * 100)}%` })))))));
}

function lateral(diario, atividades) {
  const ano = resumoDoAno(diario);
  const notas = distribuicaoNotas(diario);
  const maxNota = Math.max(1, ...notas.map((x) => x.quantos));
  const gens = generos(diario);
  const pontos = radar(gens);
  const mapa = mapaAtividade(diario, atividades);
  const maxDia = Math.max(1, ...mapa.map((d) => d.quantos));
  const dest = destaques(diario);
  const svgRadar = pontos ? `<svg viewBox="-45 -12 290 224" role="img" aria-label="Gêneros mais jogados: ${gens.map((g) => g.genero).join(', ')}">
      ${[1, 0.66, 0.33].map((k) => `<polygon class="pf-radar-grade" points="${pontos.map((p) => `${100 + (p.bx - 100) * k},${100 + (p.by - 100) * k}`).join(' ')}"/>`).join('')}
      ${pontos.map((p) => `<line class="pf-radar-grade" x1="100" y1="100" x2="${p.bx}" y2="${p.by}"/>`).join('')}
      <polygon class="pf-radar-area" points="${pontos.map((p) => `${p.x},${p.y}`).join(' ')}"/>
      ${pontos.map((p) => `<circle class="pf-radar-ponto" cx="${p.x}" cy="${p.y}" r="3"/>`).join('')}
      ${pontos.map((p) => `<text x="${p.ex}" y="${p.ey}" text-anchor="${p.ex < 95 ? 'end' : p.ex > 105 ? 'start' : 'middle'}" dominant-baseline="middle">${p.genero.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`).join('')}
    </svg>` : null;
  return h('aside', { class: 'pf-lateral' },
    h('section', { class: 'pf-painel' }, h('h3', {}, `Seu ${ano.ano}`),
      h('dl', { class: 'pf-mini' }, [['Jogos', ano.jogos], ['Finalizados', ano.finalizados], ['Horas', fmt(ano.horas)]].map(([r, v]) => h('div', {}, h('dd', {}, v), h('dt', {}, r)))),
      h('a', { class: 'texto-3 pf-link', href: `#/wrapped/${ano.ano}` }, 'Ver o Wrapped do ano')),
    h('section', { class: 'pf-painel' }, h('h3', {}, 'Suas notas'),
      diario.some((r) => r.nota > 0)
        ? h('div', { class: 'pf-notas', role: 'img', 'aria-label': `Distribuição das notas: ${notas.filter((x) => x.quantos).map((x) => `${x.quantos} com ${nota(x.nota)}`).join(', ')}` },
          notas.map((x) => h('span', { title: `${nota(x.nota)} estrelas: ${x.quantos}` }, h('i', { style: `height:${Math.max(4, (x.quantos / maxNota) * 100)}%`, class: x.quantos ? '' : 'zero' }))))
        : h('p', { class: 'texto-3' }, 'Dê notas no Diário para ver o gráfico.'),
      h('div', { class: 'pf-notas-legenda texto-3' }, h('span', {}, '½ ★'), h('span', {}, '5 ★'))),
    h('section', { class: 'pf-painel' }, h('h3', {}, 'Gêneros que você mais joga'),
      svgRadar ? h('div', { class: 'pf-radar', html: svgRadar }) : h('p', { class: 'texto-3' }, 'Com 3 gêneros diferentes no Diário, o radar aparece aqui.')),
    h('section', { class: 'pf-painel' }, h('h3', {}, 'Atividade'), h('p', { class: 'texto-3' }, 'Últimos 90 dias'),
      h('div', { class: 'pf-mapa', role: 'img', 'aria-label': `${mapa.filter((d) => d.quantos).length} dias com atividade nos últimos 90` },
        ...Array.from({ length: mapa[0].semana }, () => h('span', { class: 'vazio' })),
        mapa.map((d) => h('span', { title: `${d.data.split('-').reverse().join('/')}: ${d.quantos}`, style: d.quantos ? `--n:${0.25 + 0.75 * (d.quantos / maxDia)}` : null, class: d.quantos ? 'ativo' : '' })))),
    h('section', { class: 'pf-painel' }, h('h3', {}, 'Destaques'),
      h('dl', { class: 'pf-destaques' },
        h('div', {}, h('dt', {}, 'Plataforma mais jogada'), h('dd', {}, dest.plataforma || '—')),
        h('div', {}, h('dt', {}, 'Tempo médio por jogo'), h('dd', {}, dest.media === null ? '—' : `${fmt(dest.media)} h`)),
        h('div', {}, h('dt', {}, 'Jogos platinados'), h('dd', {}, `${dest.platinados}%`)))));
}

function desenhar(el, ctx) {
  const diario = lerJogos(ctx.storage);
  const perfil = lerPerfil(ctx.storage.ler(CHAVE, {}), diario);
  const aoEditar = async () => { if (await editar(ctx, lerPerfil(ctx.storage.ler(CHAVE, {}), lerJogos(ctx.storage)), lerJogos(ctx.storage))) desenhar(el, ctx); };
  const cab = cabecalho('Meu perfil', 'Seu cartão de visitas de jogador, montado a partir do seu Diário.');
  if (!diario.length) {
    el.replaceChildren(cab, vazio({ titulo: 'Seu perfil começa no Diário', texto: 'Adicione os jogos que você joga, zera e quer jogar. Os números, medalhas e gráficos aparecem aqui sozinhos.', acao: { rotulo: 'Ir para o Diário', onclick: () => irPara('diario', 'adicionar') } }));
    return;
  }
  const n = numeros(diario);
  const lv = nivel(xp(diario));
  el.replaceChildren(cab,
    topo(perfil, diario, n, lv, aoEditar, lerImagens(ctx.storage.ler(CHAVE_IMAGENS, {}))),
    h('div', { class: 'pf-grade' },
      h('div', { class: 'pf-principal' },
        favoritos(perfil, diario, aoEditar),
        medalhasBloco(diario),
        h('section', { class: 'pf-bloco' }, h('div', { class: 'pf-bloco-topo' }, h('h3', {}, 'Jogos recentes'), h('a', { class: 'btn btn-pequeno btn-fantasma', href: '#/diario' }, 'Ver o Diário')),
          h('div', { class: 'pf-recentes' }, recentes(diario).map((r) => cartaoJogo(r))))),
      lateral(diario, lerAtividades(ctx.storage))));
}

export default {
  montar(el, ctx) { usarEstilo('js/modules/perfil/estilo.css'); desenhar(el, ctx); },
  painelInicio(ctx) {
    const diario = lerJogos(ctx.storage);
    if (!diario.length) return null;
    const lv = nivel(xp(diario));
    return { titulo: 'Seu perfil', link: 'Ver perfil', el: h('p', { class: 'texto-2' }, `Nível ${lv.nivel} · ${lv.titulo}. Faltam ${fmt(lv.faltam)} XP para o próximo nível.`) };
  }
};
