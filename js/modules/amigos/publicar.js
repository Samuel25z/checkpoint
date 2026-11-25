// Publica (cria ou atualiza) o meu perfil público a partir do Diário e do Meu perfil.
import { lerJogos } from '../diario/dados.js';
import { lerPerfil } from '../perfil/logic.js';
import { CHAVE_IMAGENS, lerImagens } from '../perfil/imagens.js';
import { montarResumo } from './logic.js';

export const CHAVE_PERFIL = 'perfil:dados';

/** Dados atuais para o perfil público (sem o @ e sem a escolha de privado, que ficam no banco). */
export function dadosPublicos(storage) {
  const diario = lerJogos(storage);
  const perfil = lerPerfil(storage.ler(CHAVE_PERFIL, {}), diario);
  const imgs = lerImagens(storage.ler(CHAVE_IMAGENS, {}));
  return {
    nome: perfil.nome,
    frase: perfil.frase,
    avatar_url: imgs.avatar?.url || null,
    banner_url: imgs.banner?.url || null,
    resumo: montarResumo(diario, perfil),
  };
}

/** Atualiza o perfil público se a pessoa já tem um @ (silencioso: não atrapalha se falhar). */
export async function atualizarPublico(social, storage, atual = null) {
  if (!social?.logado()) return null;
  const meu = atual || await social.meuPerfil();
  if (!meu) return null;
  return social.salvarPerfil({ usuario: meu.usuario, privado: meu.privado, ...dadosPublicos(storage) });
}
