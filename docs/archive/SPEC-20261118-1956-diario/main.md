# SPEC-20261118-1956: diario

**Status:** done
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** 2026-11-18 20:15
**Concluída:** 2026-11-18 20:21
**Pausada em:** —
**Commit final:** `70469ce`
**Keywords:** diario, jogos, backlog, capa, wikipedia, favoritos, historico
**Features:** diario
**Branch:** spec/diario
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** Diário do jogador: registrar jogos com capa automática da Wikipedia, status, nota, horas, datas, resenha, vídeo e favoritos.

## Objetivo

Ser o coração do Checkpoint: o lugar onde o jogador registra o que joga e zera ao longo do ano. A capa e o resumo vêm sozinhos da Wikipedia, sem anexar nada.

## Escopo

**DENTRO:**
- Busca de jogo por nome com sugestões da Wikipedia (capa + resumo) e fallback para o catálogo local
- Status: quero jogar, jogando, zerado, larguei, platinado
- Campos: plataforma, horas, nota 0–5 com meia estrela, data de início, data em que zerou, resenha curta, link do YouTube (toca no site), favorito
- Grade de capas estilo Backloggd com filtros por status, plataforma, favoritos e busca
- Página do jogo com edição e exclusão (modal próprio de confirmação)
- Histórico de atividades (o que foi adicionado/zerado e quando)
- Painel 'Continuar jogando' na Início

**FORA:**
- Sincronização entre aparelhos (SPEC conta-sync)
- Upload de arquivo de vídeo

## Invariantes

- NUNCA perder um registro do diário por erro de API — a capa é opcional, o registro não
- SEMPRE validar nota (0–5, passo 0,5), horas (≥0) e datas (zerou ≥ começou)

## Implementação

Módulo js/modules/diario com logic.js puro (validação, filtros, ordenação, estatísticas) e services/wikipedia.js (busca en.wikipedia com pilicense=any para capa; resumo em pt quando houver), com cache local das respostas.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| Registro do diário | id, jogoId?, nome, capaUrl, resumo, status, plataforma, horas, nota, inicio, fim, resenha, video, favorito, criadoEm, atualizadoEm |
| Atividade | id, tipo, registroId, nome, quando |

## Riscos

- Wikipedia fora do ar ou sem capa — mitigação: capa gerada com as iniciais e cor do jogo; registro salva igual

## Sinais de sucesso

- Adicionar um jogo com capa leva menos de 15 segundos

## Critério de aceite

- [x] Validação, filtros, ordenação e histórico do diário funcionam (lógica pura) (2026-11-18 20:21, commit `70469ce`, verify: exit 0) | verify: `node --test tests/unit/diario.test.js`
- [x] A busca da Wikipedia é convertida em capa + resumo e falha sem quebrar (sem rede usa fallback) (2026-11-18 20:21, commit `70469ce`, verify: exit 0) | verify: `node --test tests/unit/wikipedia.test.js`
- [x] Adicionar, editar, favoritar, filtrar e excluir um jogo funciona na tela e persiste ao recarregar (2026-11-18 20:21, commit `70469ce`, verify: exit 0) | verify: `npx playwright test tests/e2e/diario.spec.js -g "fluxo"`
- [x] Estados vazio, carregando e erro aparecem corretamente no diário (2026-11-18 20:21, commit `70469ce`, verify: exit 0) | verify: `npx playwright test tests/e2e/diario.spec.js -g "estados"`
