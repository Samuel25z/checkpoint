// dados.js — leitura e escrita do Diário. Outras abas (Recomendador, Wrapped, Início) usam daqui.
import { novoId } from '../../storage.js';
import { atividade, empilhar } from './logic.js';

export const CHAVE_JOGOS = 'diario:jogos';
export const CHAVE_ATIVIDADES = 'diario:atividades';

export function lerJogos(storage) { return storage.ler(CHAVE_JOGOS, []); }
export function lerAtividades(storage) { return storage.ler(CHAVE_ATIVIDADES, []); }

/** Cria ou atualiza um registro (já validado). Retorna o registro salvo. */
export function salvarJogo(storage, registro) {
  const agora = new Date().toISOString();
  const lista = lerJogos(storage);
  const i = registro.id ? lista.findIndex((j) => j.id === registro.id) : -1;
  const antes = i >= 0 ? lista[i] : null;
  const salvo = { ...antes, ...registro, id: antes?.id || novoId(), criadoEm: antes?.criadoEm || agora, atualizadoEm: agora };
  if (i >= 0) lista[i] = salvo; else lista.unshift(salvo);
  storage.gravar(CHAVE_JOGOS, lista);
  const a = atividade(antes, salvo, agora);
  if (a) storage.gravar(CHAVE_ATIVIDADES, empilhar(lerAtividades(storage), a));
  return salvo;
}

export function removerJogo(storage, id) {
  const lista = lerJogos(storage);
  const antes = lista.find((j) => j.id === id);
  if (!antes) return;
  storage.gravar(CHAVE_JOGOS, lista.filter((j) => j.id !== id));
  storage.gravar(CHAVE_ATIVIDADES, empilhar(lerAtividades(storage), atividade(antes, null)));
}
