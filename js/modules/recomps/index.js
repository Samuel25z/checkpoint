// Recomps e ports — catálogo vivo do GitHub. O Checkpoint não hospeda nem distribui jogos.
import { h, usarEstilo, cabecalho, carregando, erro } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { criarGitHub, LimiteGitHub } from '../../services/github.js';
import { VERIFICADOS, normalizarRepo, consultaVerificados, consultaBusca, ordenarProjetos, versaoNova, suspeito, tempoRelativo, formatarEstrelas } from './logic.js';

const CH_SEGUIDOS = 'recomps:seguidos';

function mensagemErro(e) {
  if (e instanceof LimiteGitHub) {
    const quando = e.reset ? new Date(e.reset).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'daqui a pouco';
    return { titulo: 'O GitHub pediu uma pausa', texto: `O limite de consultas gratuitas acabou. Tente de novo às ${quando}.` };
  }
  return { titulo: 'O GitHub não respondeu', texto: 'Confira sua internet e tente de novo.' };
}

function cartaoProjeto(p, ctx, gh, aoMudar) {
  const seguidos = ctx.storage.ler(CH_SEGUIDOS, {});
  const seguindo = p.repo in seguidos;
  const versao = h('span', { class: 'versao texto-3' });
  const alerta = suspeito(p);

  const seguir = async () => {
    const atual = ctx.storage.ler(CH_SEGUIDOS, {});
    if (p.repo in atual) { delete atual[p.repo]; ctx.storage.gravar(CH_SEGUIDOS, atual); ctx.toast(`Você deixou de seguir ${p.nome}`); aoMudar(); return; }
    let tag = null;
    try { tag = (await gh.ultimaVersao(p.repo))?.tag || null; } catch { /* segue mesmo sem saber a versão */ }
    ctx.storage.gravar(CH_SEGUIDOS, { ...ctx.storage.ler(CH_SEGUIDOS, {}), [p.repo]: tag });
    ctx.toast(`Seguindo ${p.nome}. Avisamos quando sair versão nova.`, 'sucesso');
    aoMudar();
  };

  const verVersao = async (botao) => {
    botao.disabled = true;
    versao.textContent = 'Consultando…';
    try {
      const v = await gh.ultimaVersao(p.repo);
      versao.textContent = v ? `Última versão: ${v.nome} (${tempoRelativo(v.data)})` : 'Sem versões publicadas — compile pelo código.';
    } catch (e) { versao.textContent = mensagemErro(e).titulo + '.'; }
    botao.disabled = false;
  };

  const verBtn = h('button', { class: 'btn btn-pequeno btn-fantasma', type: 'button' }, 'Última versão');
  verBtn.addEventListener('click', () => verVersao(verBtn));

  return h('article', { class: `projeto ${p.verificado ? 'verificado' : ''} ${alerta ? 'suspeito' : ''}`, 'data-repo': p.repo },
    h('div', { class: 'projeto-topo' },
      p.verificado ? h('span', { class: 'etiqueta ok' }, h('span', { html: icone('estrela') }), 'Verificado') : h('span', { class: 'etiqueta' }, 'Não verificado'),
      p.tipo ? h('span', { class: 'etiqueta neutra' }, p.tipo) : null,
      p.console ? h('span', { class: 'texto-3 projeto-console' }, p.console) : null),
    h('h3', {}, p.jogo || p.nome),
    h('a', { class: 'projeto-repo', href: p.url, target: '_blank', rel: 'noopener' }, p.repo),
    p.descricao ? h('p', { class: 'projeto-desc' }, p.descricao) : null,
    alerta ? h('p', { class: 'projeto-alerta', html: `${icone('alerta')}<span>Promete um jogo recente rodando no PC sem ser verificado. Isso costuma ser golpe ou vírus. Não baixe.</span>` }) : null,
    h('div', { class: 'projeto-meta' },
      h('span', { title: 'Estrelas no GitHub' }, h('span', { html: icone('estrela') }), formatarEstrelas(p.estrelas)),
      p.linguagem ? h('span', {}, p.linguagem) : null,
      h('span', { class: p.ativo ? 'ativo' : 'parado' }, h('span', { class: 'ponto' }), p.arquivado ? 'Arquivado' : p.ativo ? 'Ativo' : 'Parado', ` · ${tempoRelativo(p.atualizado)}`)),
    p.precisaRom ? h('p', { class: 'texto-3 projeto-rom' }, 'Precisa da sua cópia original do jogo.') : p.precisaRom === false ? h('p', { class: 'texto-3 projeto-rom' }, 'Funciona com arquivos gratuitos.') : null,
    versao,
    h('div', { class: 'projeto-acoes' },
      alerta ? null : h('a', { class: 'btn btn-pequeno', href: p.releases, target: '_blank', rel: 'noopener', html: `${icone('externo')}<span>Página oficial</span>` }),
      verBtn,
      h('button', { class: `btn btn-pequeno ${seguindo ? 'btn-primario' : ''}`, type: 'button', 'aria-pressed': String(seguindo), 'data-acao': 'seguir', onclick: seguir }, seguindo ? 'Seguindo' : 'Seguir')));
}

async function secaoSeguidos(alvo, ctx, gh, redesenhar) {
  const seguidos = ctx.storage.ler(CH_SEGUIDOS, {});
  const repos = Object.keys(seguidos);
  if (!repos.length) { alvo.replaceChildren(); return; }
  alvo.replaceChildren(h('div', { class: 'secao-topo' }, h('h2', {}, 'Seguindo')), carregando('Conferindo versões…'));
  const linhas = await Promise.all(repos.map(async (repo) => {
    try {
      const v = await gh.ultimaVersao(repo);
      const nova = versaoNova(seguidos, repo, v?.tag);
      return h('li', { class: nova ? 'nova' : '' },
        h('a', { href: `https://github.com/${repo}`, target: '_blank', rel: 'noopener' }, repo),
        nova ? h('span', { class: 'etiqueta ok' }, `Versão nova: ${v.nome}`) : h('span', { class: 'texto-3' }, v ? `${v.nome} · ${tempoRelativo(v.data)}` : 'sem versões'),
        nova ? h('button', { class: 'btn btn-pequeno', type: 'button', onclick: () => { ctx.storage.gravar(CH_SEGUIDOS, { ...ctx.storage.ler(CH_SEGUIDOS, {}), [repo]: v.tag }); redesenhar(); } }, 'Marcar como vista') : null);
    } catch {
      return h('li', {}, h('span', {}, repo), h('span', { class: 'texto-3' }, 'não deu para conferir agora'));
    }
  }));
  alvo.replaceChildren(h('div', { class: 'secao-topo' }, h('h2', {}, 'Seguindo')), h('ul', { class: 'seguidos', id: 'lista-seguidos' }, linhas));
}

export default {
  montar(el, ctx) {
    usarEstilo('js/modules/recomps/estilo.css');
    const gh = criarGitHub({ storage: ctx.storage });
    const seguidosEl = h('section', { class: 'secao', id: 'secao-seguidos' });
    const destaquesEl = h('div', { class: 'projetos', id: 'verificados' });
    const resultadoEl = h('section', { class: 'secao', id: 'resultado-busca' });
    const entrada = h('input', { class: 'entrada', type: 'search', id: 'busca-recomps', placeholder: 'Nome do jogo (ex.: Zelda, Mario, Sonic)', 'aria-label': 'Buscar recomps e ports no GitHub' });

    const redesenhar = () => { carregarDestaques(); secaoSeguidos(seguidosEl, ctx, gh, redesenhar); if (entrada.value.trim()) buscar(); };

    async function carregarDestaques() {
      destaquesEl.replaceChildren(carregando('Buscando projetos no GitHub…'));
      try {
        const itens = (await gh.buscarRepos(consultaVerificados(), 50)).map((i) => normalizarRepo(i));
        const lista = ordenarProjetos(itens.length ? itens : []);
        if (!lista.length) { destaquesEl.replaceChildren(h('p', { class: 'texto-2' }, 'Nenhum projeto encontrado agora.')); return; }
        destaquesEl.replaceChildren(...lista.map((p) => cartaoProjeto(p, ctx, gh, redesenhar)));
      } catch (e) {
        destaquesEl.replaceChildren(erro({ ...mensagemErro(e), tentar: carregarDestaques }),
          h('ul', { class: 'lista-offline' }, VERIFICADOS.map((v) => h('li', {}, h('a', { href: `https://github.com/${v.repo}`, target: '_blank', rel: 'noopener' }, v.jogo), h('span', { class: 'texto-3' }, ` · ${v.tipo} · ${v.console}`)))));
      }
    }

    async function buscar() {
      const q = consultaBusca(entrada.value);
      if (!q) return;
      resultadoEl.replaceChildren(h('div', { class: 'secao-topo' }, h('h2', {}, `Resultados para “${entrada.value.trim()}”`)), carregando('Procurando…'));
      try {
        const lista = ordenarProjetos((await gh.buscarRepos(q, 12)).map((i) => normalizarRepo(i)));
        resultadoEl.replaceChildren(h('div', { class: 'secao-topo' }, h('h2', {}, `Resultados para “${entrada.value.trim()}”`)),
          lista.length ? h('div', { class: 'projetos' }, lista.map((p) => cartaoProjeto(p, ctx, gh, redesenhar)))
            : h('p', { class: 'texto-2' }, 'Nenhum recomp ou port encontrado. Se o jogo é recente, provavelmente ainda não existe — desconfie de quem prometer.'));
      } catch (e) {
        resultadoEl.replaceChildren(erro({ ...mensagemErro(e), tentar: buscar }));
      }
    }

    el.append(
      cabecalho('Recomps e ports', 'Projetos de código aberto que fazem jogos clássicos rodarem no PC, atualizados direto do GitHub.'),
      h('div', { class: 'aviso-legal', role: 'note' }, h('span', { html: icone('alerta') }),
        h('p', {}, h('strong', {}, 'O Checkpoint não hospeda nem distribui jogos. '), 'Recomps e ports usam a sua cópia original do jogo. Projeto não verificado que promete um jogo recente rodando no PC costuma ser golpe.')),
      h('form', { class: 'sr-busca recomps-busca', onsubmit: (e) => { e.preventDefault(); buscar(); } },
        h('label', { class: 'busca' }, h('span', { html: icone('busca') }), entrada),
        h('button', { class: 'btn btn-primario', type: 'submit' }, 'Buscar')),
      resultadoEl, seguidosEl,
      h('section', { class: 'secao' }, h('div', { class: 'secao-topo' }, h('h2', {}, 'Projetos verificados')), destaquesEl));
    carregarDestaques();
    secaoSeguidos(seguidosEl, ctx, gh, redesenhar);
    if (ctx.params[0]) { entrada.value = ctx.params[0]; buscar(); }
  },
  async painelInicio(ctx) {
    const seguidos = ctx.storage.ler(CH_SEGUIDOS, {});
    const repos = Object.keys(seguidos);
    if (!repos.length) return null;
    const gh = criarGitHub({ storage: ctx.storage });
    const novas = [];
    for (const repo of repos) {
      try { const v = await gh.ultimaVersao(repo); if (versaoNova(seguidos, repo, v?.tag)) novas.push({ repo, v }); } catch { /* confere na aba */ }
    }
    const el = novas.length
      ? h('ul', { class: 'seguidos' }, novas.map(({ repo, v }) => h('li', { class: 'nova' }, h('a', { href: '#/recomps' }, repo), h('span', { class: 'etiqueta ok' }, `Versão nova: ${v.nome}`))))
      : h('p', { class: 'texto-2' }, `Você segue ${repos.length} ${repos.length === 1 ? 'projeto' : 'projetos'}. Nenhuma versão nova por enquanto.`);
    return { titulo: 'Recomps que você segue', el, link: 'Abrir recomps' };
  }
};
