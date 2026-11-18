# Feature: hardware

**Keywords:** hardware, requisitos, gpu, cpu, webgl, pc, desempenho
**Arquivos principais:**
  - js/modules/roda-no-pc/logic.js
  - js/modules/roda-no-pc/detect.js
  - js/data/hardware.js
  - js/games.js
**Resumo:** 'Roda no meu PC?': reconhece a GPU pelo navegador, compara com requisitos do catálogo e classifica de 'não roda' a 'ultra' com o gargalo.

## Specs desta feature
### Concluídas
- SPEC-20261118-1956-roda-no-pc | 2026-11-18 | `ef298ae` | Roda no meu PC?
### Planejadas (future/)

## Estado atual
PCs em storage 'hardware:pcs' [{id,nome,cpu,gpu,ram}] e 'hardware:pcAtual'. Pontuações relativas em js/data/hardware.js; peça nova = 1 linha lá. classificar(pc, requisitos) → {nivel, gargalo, folga}.

## Decisões arquiteturais ativas
- DEC-20261118-2034-classificacao-por-razao [ativa] (SPEC-20261118-1956-roda-no-pc) — pior razão PC/recomendado define o nível (<0,75 baixo, <1 médio, <1,6 alto, senão ultra); <0,9 do mínimo = não roda

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-1956-roda-no-pc | estilos compartilhados presos numa aba (sr-busca, capa-mini) (2026-11-18 20:34) — componente usado por 2+ abas vai para css/style.css
