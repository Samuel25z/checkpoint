// registry.js — lista de abas do Checkpoint.
// Para lançar uma aba nova: crie js/modules/<id>/index.js e acrescente UMA linha abaixo.
// O módulo exporta por padrão { montar(el, ctx), desmontar?(), painelInicio?(ctx) }.

export const MODULOS = [
  { id: 'inicio', titulo: 'Início', icone: 'casa', rota: 'inicio', carregar: () => import('./inicio/index.js') },
  { id: 'diario', titulo: 'Diário', icone: 'livro', rota: 'diario', carregar: () => import('./diario/index.js') },
  { id: 'perfil', titulo: 'Meu perfil', icone: 'perfil', rota: 'perfil', carregar: () => import('./perfil/index.js') },
  { id: 'speedrun', titulo: 'Speedrun', icone: 'cronometro', rota: 'speedrun', carregar: () => import('./speedrun/index.js') },
  { id: 'recomps', titulo: 'Recomps', icone: 'ramo', rota: 'recomps', carregar: () => import('./recomps/index.js') },
  { id: 'roda-no-pc', titulo: 'Roda no PC?', icone: 'chip', rota: 'roda-no-pc', carregar: () => import('./roda-no-pc/index.js') },
  { id: 'torneio', titulo: 'Torneio', icone: 'trofeu', rota: 'torneio', carregar: () => import('./torneio/index.js') },
  { id: 'recomendador', titulo: 'Recomenda', icone: 'brilho', rota: 'recomendador', carregar: () => import('./recomendador/index.js') },
  { id: 'almanaque', titulo: 'Almanaque', icone: 'almanaque', rota: 'almanaque', carregar: () => import('./almanaque/index.js') },
  { id: 'wrapped', titulo: 'Wrapped', icone: 'presente', rota: 'wrapped', carregar: () => import('./wrapped/index.js') },
];

/** Valida e organiza uma lista de módulos (exportado para testes e para quem quiser montar outro registro). */
export function criarRegistro(lista) {
  const vistos = new Set();
  const modulos = lista.map((m, ordem) => {
    for (const campo of ['id', 'titulo', 'icone', 'rota']) {
      if (typeof m[campo] !== 'string' || !m[campo]) throw new Error(`Módulo sem "${campo}": ${JSON.stringify(m.id)}`);
    }
    if (typeof m.carregar !== 'function') throw new Error(`Módulo "${m.id}" sem função carregar()`);
    if (vistos.has(m.rota)) throw new Error(`Rota repetida: ${m.rota}`);
    vistos.add(m.rota);
    return Object.freeze({ ordem, ...m });
  });
  return {
    todos: () => modulos,
    porRota: (rota) => modulos.find((m) => m.rota === rota) || null,
    inicial: () => modulos[0]
  };
}

export const registro = criarRegistro(MODULOS);
