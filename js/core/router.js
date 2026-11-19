// router.js — navegação por hash (#/diario, #/diario/abc123).
// Carrega o módulo da aba sob demanda; se um módulo falhar, só aquela aba mostra erro.
import { erro, carregando } from './ui.js';

export function lerHash(hash = location.hash) {
  const partes = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  return { rota: partes[0] || '', params: partes.slice(1) };
}

export function irPara(rota, ...params) {
  const alvo = '#/' + [rota, ...params].map(encodeURIComponent).join('/');
  if (location.hash === alvo) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = alvo;
}

export function criarRoteador({ registro, palco, ctx, aoTrocar }) {
  let atual = null;
  let geracao = 0;

  async function navegar() {
    const { rota, params } = lerHash();
    const mod = registro.porRota(rota) || registro.inicial();
    if (!registro.porRota(rota)) { history.replaceState(null, '', '#/' + mod.rota); }
    const minha = ++geracao;

    if (atual?.instancia?.desmontar) { try { atual.instancia.desmontar(); } catch (e) { console.warn(e); } }
    aoTrocar?.(mod);
    palco.replaceChildren(carregando());
    palco.dataset.aba = mod.id;

    try {
      const { default: instancia } = await mod.carregar();
      if (minha !== geracao) return;
      const area = document.createElement('div');
      area.className = 'aba aba-' + mod.id;
      palco.replaceChildren(area);
      atual = { mod, instancia };
      // foco vai para o conteúdo ANTES de montar: se a pessoa (ou o controle) mover o foco
      // enquanto a aba ainda carrega, ninguém rouba o foco de volta no fim
      palco.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
      await instancia.montar(area, { ...ctx, params, modulo: mod });
    } catch (e) {
      console.error(e);
      if (minha !== geracao) return;
      palco.replaceChildren(erro({ titulo: `Não deu para abrir ${mod.titulo}`, texto: 'Recarregue a página. Se continuar, as outras abas seguem funcionando.', tentar: navegar }));
    }
  }

  // Âncoras internas (ex.: "Pular para o conteúdo" → #palco) não são rotas: só movem o foco.
  window.addEventListener('hashchange', (e) => {
    if (location.hash && !location.hash.startsWith('#/')) {
      const alvo = document.getElementById(location.hash.slice(1));
      const anterior = e.oldURL && new URL(e.oldURL).hash;
      history.replaceState(null, '', anterior && anterior.startsWith('#/') ? anterior : '#/' + (atual?.mod.rota || ''));
      alvo?.focus();
      return;
    }
    navegar();
  });
  return { navegar, get atual() { return atual; } };
}
