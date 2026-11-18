# Feature: speedrun

**Keywords:** speedrun, cronometro, splits, pb, ranking, speedrun.com
**Arquivos principais:**
  - js/modules/speedrun/index.js
  - js/modules/speedrun/logic.js
  - js/services/speedrun.js
**Resumo:** Ranking ao vivo do speedrun.com e cronômetro com splits, PB, deltas, melhores trechos, atalhos e modo foco.

## Specs desta feature
### Concluídas
- SPEC-20261118-1956-speedrun | 2026-11-18 | `153fb80` | Central de speedrun: ranking e cronômetro
### Planejadas (future/)

## Estado atual
Rotas em storage 'speedrun:rotas' ({id,nome,jogo,categoria{jogoId,categoriaId,nome,link,wr{tempo,jogador}},splits[{nome,pb,melhor}],pbTotal,tentativas,concluidas}) e 'speedrun:rotaAtual'. Run fica em memória; registrarRun() atualiza melhores trechos sempre e PB só com run completa e mais rápida. Atalhos: Espaço split, Z desfazer, R reiniciar, Esc sai do foco. Rotas #/speedrun/cronometro e #/speedrun/recordes.

## Decisões arquiteturais ativas
- DEC-20261118-2028-envio-run-link [ativa] (SPEC-20261118-1956-speedrun) — botão 'Enviar no speedrun.com' abre a categoria; sem envio automático
- DEC-20261118-2028-tempo-performance-now [ativa] (SPEC-20261118-1956-speedrun) — cronômetro usa performance.now() e requestAnimationFrame só enquanto corre

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-1956-speedrun | atalho de espaço dentro de select/input (2026-11-18 20:28) — handler ignora eventos vindos de campos e quando há modal aberto
