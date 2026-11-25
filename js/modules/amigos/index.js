// Amigos — perfil público com @, seguir pessoas, amigos (quem segue de volta) e o que eles andam jogando.
import { h, usarEstilo, cabecalho, vazio, carregando, erro, toast, capa, capaGerada } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { ROTULO_STATUS } from '../diario/logic.js';
import { lerJogos } from '../diario/dados.js';
import { lerPerfil } from '../perfil/logic.js';
import { criarSocial } from '../../services/social.js';
import { validarUsuario, sugerirUsuario, termoBusca, amigos, feed, erroSocial, linkPerfil } from './logic.js';
import { dadosPublicos, atualizarPublico, CHAVE_PERFIL } from './publicar.js';

let aba = 'feed';
const fmt = (n) => Number(n || 0).toLocaleString('pt-BR');
const seguidores = (n) => `${fmt(n)} ${n === 1 ? 'seguidor' : 'seguidores'}`;
const GRAU = { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro' };

function avatar(p, classe = 'am-avatar') {
  const nome = p.nome || p.usuario;
  const { tom, iniciais } = capaGerada(nome);
  const el = h('span', { class: classe, style: `--tom:${tom}`, 'aria-hidden': 'true' }, iniciais);
  if (p.avatar_url) {
    const i = h('img', { src: p.avatar_url, alt: '', referrerpolicy: 'no-referrer' });
    i.addEventListener('error', () => i.remove());
    el.append(i);
  }
  return el;
}

function botaoSeguir(social, p, sigo, aoMudar) {
  const b = h('button', { type: 'button', class: `btn btn-pequeno ${sigo ? '' : 'btn-primario'}`, 'data-seguir': p.usuario, 'aria-pressed': String(sigo) }, sigo ? 'Seguindo' : 'Seguir');
  b.addEventListener('click', async () => {
    b.disabled = true;
    try {
      if (sigo) await social.deixarDeSeguir(p.user_id); else await social.seguir(p.user_id);
      toast(sigo ? `Você deixou de seguir @${p.usuario}` : `Agora você segue @${p.usuario}`, 'sucesso');
      aoMudar();
    } catch (e) { toast(erroSocial(e), 'erro'); b.disabled = false; }
  });
  return b;
}

function cartaoPessoa(social, p, { sigo, meSegue, aoMudar }) {
  return h('li', { class: 'am-pessoa', 'data-pessoa': p.usuario },
    h('a', { class: 'am-pessoa-link', href: linkPerfil(p.usuario) }, avatar(p),
      h('span', { class: 'am-pessoa-texto' }, h('strong', {}, p.nome || p.usuario), h('span', { class: 'texto-3' }, `@${p.usuario}${p.resumo?.nivel ? ` · Nível ${p.resumo.nivel.nivel}` : ''}${meSegue ? ' · segue você' : ''}`))),
    p.user_id === social.meuId() ? h('span', { class: 'texto-3' }, 'Você') : botaoSeguir(social, p, sigo, aoMudar));
}

/* ---------- criar o @ ---------- */
function telaCriar(el, ctx, social) {
  const perfil = lerPerfil(ctx.storage.ler(CHAVE_PERFIL, {}), lerJogos(ctx.storage));
  const sugestao = sugerirUsuario(perfil.nome || ctx.conta.usuario?.user_metadata?.full_name || (ctx.conta.usuario?.email || '').split('@')[0]);
  const campo = h('input', { class: 'entrada', name: 'usuario', value: sugestao, maxlength: 21, autocomplete: 'username', spellcheck: 'false', 'aria-label': 'Nome de usuário', placeholder: 'seu_nome' });
  const privado = h('input', { type: 'checkbox', name: 'privado' });
  const aviso = h('p', { class: 'campo-erro', 'aria-live': 'polite' });
  const form = h('form', { class: 'am-criar', novalidate: true },
    h('h2', {}, 'Escolha o seu @'),
    h('p', { class: 'texto-2' }, 'É assim que seus amigos vão te achar. Seu perfil público mostra nome, foto, banner, nível, favoritos, medalhas e o que você anda jogando. Resenhas e datas não aparecem.'),
    h('label', { class: 'campo' }, h('span', {}, 'Nome de usuário'), h('span', { class: 'am-arroba' }, h('span', { 'aria-hidden': 'true' }, '@'), campo), h('span', { class: 'texto-3' }, 'De 3 a 20 letras sem acento, números ou _.')),
    h('label', { class: 'am-check' }, privado, h('span', {}, 'Deixar meu perfil privado (ninguém vê, mas eu ainda posso seguir os outros)')),
    aviso,
    h('button', { type: 'submit', class: 'btn btn-primario', id: 'criar-perfil-publico' }, 'Criar meu perfil público'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = validarUsuario(campo.value);
    if (!v.ok) { aviso.textContent = v.erro; campo.focus(); return; }
    aviso.textContent = '';
    form.querySelector('button').disabled = true;
    try {
      await social.salvarPerfil({ usuario: v.usuario, privado: privado.checked, ...dadosPublicos(ctx.storage) });
      toast(`Perfil @${v.usuario} criado`, 'sucesso');
      desenhar(el, ctx);
    } catch (err) { aviso.textContent = erroSocial(err); form.querySelector('button').disabled = false; }
  });
  el.replaceChildren(cabecalho('Amigos', 'Siga outros jogadores e veja o que eles andam jogando.'), form);
}

/* ---------- perfil de outra pessoa ---------- */
async function telaPerfil(el, ctx, social, usuario) {
  el.replaceChildren(carregando('Abrindo o perfil…'));
  let p, con = { seguindo: [], seguidores: [] }, meus = { seguindo: [] };
  try {
    p = await social.porUsuario(usuario);
    if (p && social.logado()) [con, meus] = await Promise.all([social.conexoes(p.user_id), social.conexoes()]);
  } catch (e) { el.replaceChildren(erro({ texto: erroSocial(e), tentar: () => telaPerfil(el, ctx, social, usuario) })); return; }
  const voltar = h('a', { class: 'btn btn-pequeno btn-fantasma am-voltar', href: '#/amigos', html: `${icone('voltar')}<span>Amigos</span>` });
  if (!p) { el.replaceChildren(voltar, vazio({ titulo: `@${usuario} não encontrado`, texto: 'Esse perfil não existe ou é privado.' })); return; }
  const r = p.resumo || {};
  const n = r.numeros || {};
  const fundo = h('div', { class: 'pf-capa-fundo padrao-hex' });
  const hero = p.banner_url || (r.favoritos || []).find((f) => f.coroado)?.capa;
  if (hero) { const i = h('img', { src: hero, alt: '', referrerpolicy: 'no-referrer' }); i.addEventListener('error', () => i.remove()); fundo.append(i); }
  const sigo = meus.seguindo.includes(p.user_id);
  const ehEu = p.user_id === social.meuId();
  const copiar = h('button', { type: 'button', class: 'btn btn-pequeno', onclick: async () => {
    const url = location.origin + location.pathname + linkPerfil(p.usuario);
    try { await navigator.clipboard.writeText(url); toast('Link do perfil copiado', 'sucesso'); } catch { toast(url); }
  } }, 'Copiar link');
  el.replaceChildren(voltar,
    h('section', { class: 'pf-capa am-capa', 'aria-label': `Perfil de @${p.usuario}` }, fundo,
      h('div', { class: 'pf-capa-conteudo' },
        avatar(p, 'pf-avatar am-avatar-grande'),
        h('div', { class: 'pf-quem' },
          h('h2', {}, p.nome || p.usuario, r.nivel ? h('span', { class: 'pf-titulo' }, r.nivel.titulo) : null),
          h('p', { class: 'texto-2' }, `@${p.usuario}`),
          p.frase ? h('p', { class: 'pf-frase' }, `“${p.frase}”`) : null,
          h('p', { class: 'texto-3 am-contagem' }, `${r.nivel ? `Nível ${r.nivel.nivel} · ` : ''}${seguidores(con.seguidores.length)} · segue ${fmt(con.seguindo.length)}`)),
        h('div', { class: 'am-acoes' }, ehEu ? h('span', { class: 'texto-3' }, 'Este é você') : social.logado() ? botaoSeguir(social, p, sigo, () => telaPerfil(el, ctx, social, usuario)) : h('button', { type: 'button', class: 'btn btn-primario btn-pequeno', onclick: () => document.getElementById('botao-conta')?.click() }, 'Entrar para seguir'), copiar)),
      h('dl', { class: 'pf-numeros' }, [['Jogos', fmt(n.jogos)], ['Finalizados', fmt(n.finalizados)], ['Platinados', fmt(n.platinados)], ['Horas', fmt(n.horas)], ['Nota média', n.media == null ? '—' : String(n.media).replace('.', ',')]]
        .map(([a, b]) => h('div', {}, h('dd', {}, b), h('dt', {}, a))))),
    (r.favoritos || []).length ? h('section', { class: 'pf-bloco am-bloco' }, h('div', { class: 'pf-bloco-topo' }, h('h3', {}, 'Jogos favoritos')),
      h('div', { class: 'pf-favoritos' }, r.favoritos.map((f) => h('div', { class: `pf-jogo ${f.coroado ? 'coroado' : ''}` }, f.coroado ? h('span', { class: 'pf-coroa', html: icone('coroa'), 'aria-hidden': 'true' }) : null, capa(f.capa, f.nome, 'pf-jogo-capa'), h('span', { class: 'pf-jogo-nome' }, f.nome), h('span', { class: 'texto-3' }, f.horas ? `${fmt(f.horas)} h` : ROTULO_STATUS[f.status] || ''))))) : null,
    (r.medalhas || []).length ? h('section', { class: 'pf-bloco am-bloco' }, h('div', { class: 'pf-bloco-topo' }, h('h3', {}, 'Medalhas')),
      h('ul', { class: 'am-medalhas' }, r.medalhas.map((m) => h('li', { class: `pf-medalha ${m.grau}` }, h('span', { class: 'pf-medalha-icone', 'aria-hidden': 'true', html: '<svg viewBox="0 0 34 34"><path d="M17 1.8 30.2 9.4v15.2L17 32.2 3.8 24.6V9.4Z"/></svg>' }), h('div', {}, h('strong', {}, m.nome), h('span', { class: 'pf-grau' }, GRAU[m.grau])))))) : null,
    (r.jogando || []).length ? h('section', { class: 'pf-bloco am-bloco' }, h('div', { class: 'pf-bloco-topo' }, h('h3', {}, 'Jogando agora')),
      h('div', { class: 'pf-recentes' }, r.jogando.map((j) => h('div', { class: 'pf-jogo' }, capa(j.capa, j.nome, 'pf-jogo-capa'), h('span', { class: 'pf-jogo-nome' }, j.nome))))) : null);
}

/* ---------- tela principal ---------- */
async function telaPrincipal(el, ctx, social, meu) {
  el.replaceChildren(carregando('Carregando seus amigos…'));
  let con, pessoas = [];
  try {
    con = await social.conexoes();
    pessoas = await social.perfisDe([...new Set([...con.seguindo, ...con.seguidores])]);
  } catch (e) { el.replaceChildren(erro({ texto: erroSocial(e), tentar: () => desenhar(el, ctx) })); return; }
  const porId = Object.fromEntries(pessoas.map((p) => [p.user_id, p]));
  const recarregar = () => telaPrincipal(el, ctx, social, meu);
  const listaDe = (ids, vazioTexto) => {
    const ps = ids.map((id) => porId[id]).filter(Boolean);
    return ps.length ? h('ul', { class: 'am-lista' }, ps.map((p) => cartaoPessoa(social, p, { sigo: con.seguindo.includes(p.user_id), meSegue: con.seguidores.includes(p.user_id), aoMudar: recarregar })))
      : h('p', { class: 'texto-2 am-vazio' }, vazioTexto);
  };
  const ids = { amigos: amigos(con.seguindo, con.seguidores), seguindo: con.seguindo, seguidores: con.seguidores };
  const itensFeed = feed(con.seguindo.map((id) => porId[id]).filter(Boolean));
  const conteudo = h('div', { class: 'am-conteudo' });
  const pintar = () => {
    el.querySelectorAll('.am-aba').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.aba === aba)));
    if (aba === 'feed') {
      conteudo.replaceChildren(itensFeed.length ? h('ol', { class: 'am-feed' }, itensFeed.map((i) => h('li', {},
        h('a', { href: linkPerfil(i.usuario), class: 'am-feed-quem' }, avatar({ nome: i.nomePessoa, usuario: i.usuario, avatar_url: i.avatar }), h('strong', {}, i.nomePessoa)),
        h('span', { class: 'am-feed-texto' }, `${ROTULO_STATUS[i.status] ? `${ROTULO_STATUS[i.status].toLowerCase()} · ` : ''}`, h('strong', {}, i.nome), i.horas ? ` · ${fmt(i.horas)} h` : ''),
        capa(i.capa, i.nome, 'capa-mini')))) : h('p', { class: 'texto-2 am-vazio' }, 'Quando você seguir alguém, o que a pessoa anda jogando aparece aqui.'));
    } else conteudo.replaceChildren(listaDe(ids[aba], { amigos: 'Amigos são quem você segue e te segue de volta.', seguindo: 'Você ainda não segue ninguém. Busque pelo @ acima.', seguidores: 'Ninguém te segue ainda. Mande o link do seu perfil para os amigos.' }[aba]));
  };
  // busca por @
  const busca = h('input', { class: 'entrada', type: 'search', placeholder: 'Buscar pelo @ (ex.: samuel)', 'aria-label': 'Buscar jogadores pelo @', id: 'busca-amigos' });
  const resultados = h('ul', { class: 'am-lista am-resultados', 'aria-live': 'polite' });
  let espera;
  busca.addEventListener('input', () => {
    clearTimeout(espera);
    const t = termoBusca(busca.value);
    if (!t) { resultados.replaceChildren(); return; }
    espera = setTimeout(async () => {
      try {
        const achados = await social.buscar(t);
        resultados.replaceChildren(...(achados.length ? achados.map((p) => cartaoPessoa(social, p, { sigo: con.seguindo.includes(p.user_id), meSegue: con.seguidores.includes(p.user_id), aoMudar: recarregar }))
          : [h('li', { class: 'texto-2 am-vazio' }, `Ninguém com @${t}…`)]));
      } catch (e) { resultados.replaceChildren(h('li', { class: 'campo-erro' }, erroSocial(e))); }
    }, 300);
  });
  const privado = h('input', { type: 'checkbox', checked: meu.privado, id: 'perfil-privado' });
  privado.addEventListener('change', async () => {
    try { meu = await social.salvarPerfil({ usuario: meu.usuario, privado: privado.checked, ...dadosPublicos(ctx.storage) }); toast(privado.checked ? 'Seu perfil agora é privado' : 'Seu perfil agora é público', 'sucesso'); }
    catch (e) { privado.checked = !privado.checked; toast(erroSocial(e), 'erro'); }
  });
  el.replaceChildren(
    cabecalho('Amigos', 'Siga outros jogadores e veja o que eles andam jogando.'),
    h('section', { class: 'am-eu' },
      avatar(meu),
      h('div', { class: 'am-pessoa-texto' }, h('strong', {}, meu.nome || meu.usuario), h('span', { class: 'texto-3' }, `@${meu.usuario} · ${seguidores(con.seguidores.length)} · segue ${fmt(con.seguindo.length)}`)),
      h('label', { class: 'am-check' }, privado, h('span', {}, 'Perfil privado')),
      h('a', { class: 'btn btn-pequeno', href: linkPerfil(meu.usuario), id: 'ver-meu-perfil-publico' }, 'Ver meu perfil público')),
    h('div', { class: 'am-busca' }, busca, resultados),
    h('div', { class: 'am-abas', role: 'tablist', 'aria-label': 'Listas' },
      [['feed', 'Jogando agora'], ['amigos', `Amigos (${ids.amigos.length})`], ['seguindo', `Seguindo (${ids.seguindo.length})`], ['seguidores', `Seguidores (${ids.seguidores.length})`]]
        .map(([id, r]) => h('button', { type: 'button', role: 'tab', class: 'am-aba', 'data-aba': id, 'aria-selected': String(aba === id), onclick: () => { aba = id; pintar(); } }, r))),
    conteudo);
  pintar();
}

async function desenhar(el, ctx) {
  const social = criarSocial(ctx.conta);
  const alvo = String(ctx.params?.[0] || '');
  if (!social.disponivel()) { el.replaceChildren(cabecalho('Amigos', 'Siga outros jogadores e veja o que eles andam jogando.'), vazio({ titulo: 'O login ainda não foi ligado', texto: 'Os amigos precisam de conta. Tudo o resto do site funciona normalmente.' })); return; }
  if (alvo.startsWith('@')) { await telaPerfil(el, ctx, social, alvo.slice(1).toLowerCase()); return; }
  if (!social.logado()) {
    el.replaceChildren(cabecalho('Amigos', 'Siga outros jogadores e veja o que eles andam jogando.'),
      vazio({ titulo: 'Entre para seguir seus amigos', texto: 'Com uma conta você escolhe o seu @, segue outras pessoas e vê o que elas andam jogando.', acao: { rotulo: 'Entrar', onclick: () => document.getElementById('botao-conta')?.click() } }));
    return;
  }
  el.replaceChildren(carregando('Abrindo…'));
  let meu;
  try { meu = await social.meuPerfil(); } catch (e) { el.replaceChildren(erro({ texto: erroSocial(e), tentar: () => desenhar(el, ctx) })); return; }
  if (!meu) { telaCriar(el, ctx, social); return; }
  atualizarPublico(social, ctx.storage, meu).then((novo) => { if (novo) meu = novo; }).catch(() => {});
  await telaPrincipal(el, ctx, social, meu);
}

let ouvindo = false;
let ctxAtual = null;
export default {
  montar(el, ctx) {
    usarEstilo('js/modules/perfil/estilo.css');
    usarEstilo('js/modules/amigos/estilo.css');
    ctxAtual = ctx;
    // entrou ou saiu da conta com a aba aberta: desenha de novo
    if (!ouvindo) { ouvindo = true; window.addEventListener('checkpoint:conta', () => { if (location.hash.startsWith('#/amigos')) ctxAtual?.roteador?.navegar(); }); }
    desenhar(el, ctx);
  }
};
