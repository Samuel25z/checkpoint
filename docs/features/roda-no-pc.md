# Feature: roda-no-pc

**Keywords:** roda-no-pc, fps, resolucao, upgrade, detalhes
**Arquivos principais:**
  - js/modules/roda-no-pc/logic.js
  - js/modules/roda-no-pc/index.js
**Resumo:** Compara o PC com os requisitos do catálogo, dá nível, FPS estimado por qualidade e resolução e explica peça por peça o que trocar.

## Specs desta feature
### Concluídas
- SPEC-20261120-1907-roda-fps | 2026-11-20 | `32eb688` | FPS estimado e detalhe por jogo
### Planejadas (future/)

## Estado atual
estimarFps: 60 × (gpu/gpuRec) × qualidade(1,6/1,25/1/0,75) × resolução(1/0,65/0,35), limitado por 84 × (cpu/cpuRec), ×0,85 se RAM < rec, teto 240. Resolução salva em hardware:resolucao. placaPara60 prefere RTX 30+/RX 6000+/Arc.

## Decisões arquiteturais ativas
- DEC-20261120-1914-roda-fps-base [ativa] (SPEC-20261120-1907-roda-fps) — recomendado mira ~60 FPS no Alto em 1080p; FPS sempre com ~ e explicação da conta

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261120-1907-roda-fps | FPS da lista x selo (2026-11-20 19:14) — mostrar o FPS na qualidade do nível, senão a lista se contradiz
