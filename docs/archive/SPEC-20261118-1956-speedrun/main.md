# SPEC-20261118-1956: speedrun

**Status:** done
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** 2026-11-18 20:22
**Concluída:** 2026-11-18 20:28
**Pausada em:** —
**Commit final:** `153fb80`
**Keywords:** speedrun, cronometro, splits, recorde, speedrun.com, pb
**Features:** speedrun
**Branch:** spec/speedrun
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** Central de speedrun: recordes ao vivo do speedrun.com e cronômetro com splits, PB e atalhos.

## Objetivo

Juntar no mesmo lugar o ranking oficial e um cronômetro bonito de usar no navegador, para treinar e mostrar a run.

## Escopo

**DENTRO:**
- Busca de jogo no speedrun.com, categorias e top 10 com tempo, jogador, data e vídeo
- Cronômetro com splits cadastráveis por rota, atalhos (espaço = iniciar/split, R = reiniciar, Z = desfazer split)
- PB (melhor tempo) salvo por rota, comparação verde/vermelho por split e soma dos melhores trechos
- Recorde mundial ao lado do cronômetro quando a rota está ligada a uma categoria
- Botão 'Enviar no speedrun.com' que abre a página da categoria
- Modo foco (tela cheia do cronômetro, estilo PS5)

**FORA:**
- Envio automático de runs (exige chave do usuário e revisão deles)

## Invariantes

- SEMPRE o cronômetro usa performance.now() (não acumula erro de setInterval)
- NUNCA sobrescrever o PB com uma run pior ou incompleta

## Implementação

logic.js puro com máquina de estados do cronômetro (parado, correndo, pausado, terminado), formatação de tempo e cálculo de deltas; services/speedrun.js com cache de 10 minutos.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| Rota | id, nome, jogo, categoriaId?, splits[{nome, pb, melhor}], pbTotal, tentativas |
| Run | rotaId, tempos[], total, quando, completa |

## Riscos

- Limite de requisições do speedrun.com — mitigação: cache local e debounce na busca

## Sinais de sucesso

- Na apresentação, uma run é cronometrada ao vivo com splits e comparação com o PB

## Critério de aceite

- [x] Cronômetro, splits, deltas e PB funcionam (lógica pura, incluindo desfazer e run incompleta) (2026-11-18 20:28, commit `153fb80`, verify: exit 0) | verify: `node --test tests/unit/speedrun.test.js`
- [x] Conversão da resposta do speedrun.com em ranking (tempos, jogadores, vídeos) está correta (2026-11-18 20:28, commit `153fb80`, verify: exit 0) | verify: `node --test tests/unit/speedrun-api.test.js`
- [x] Na tela, criar rota, rodar com atalhos de teclado, terminar e ver o PB salvo após recarregar (2026-11-18 20:28, commit `153fb80`, verify: exit 0) | verify: `npx playwright test tests/e2e/speedrun.spec.js -g "cronometro"`
- [x] O ranking de um jogo aparece com dados simulados de rede e mostra erro amigável quando a API falha (2026-11-18 20:28, commit `153fb80`, verify: exit 0) | verify: `npx playwright test tests/e2e/speedrun.spec.js -g "ranking"`
