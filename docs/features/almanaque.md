# Feature: almanaque

**Keywords:** almanaque, premios, game-awards, recordes, curiosidades, neste-dia, wikidata
**Arquivos principais:**
  - js/modules/almanaque/index.js
  - js/modules/almanaque/logic.js
  - scripts/atualizar-almanaque.mjs
  - js/data/curiosidades.js
**Resumo:** Livro dos recordes dos games: Jogos do Ano, recordes, neste dia e curiosidades com fonte, com dados que se atualizam toda semana.

## Specs desta feature
### Concluídas
- SPEC-20261124-2318-almanaque | 2026-11-25 | `737929a` | Almanaque, o livro dos recordes dos games
### Planejadas (future/)

## Estado atual
Rotas #/almanaque, #/almanaque/<premios|recordes|neste-dia|curiosidades>, #/almanaque/premios/<tga|bafta|gdc|dice>. Dados: js/data/almanaque.json (robô semanal, segunda 9h UTC) + js/data/curiosidades.js (à mão). Speedrun ao vivo por SPEEDRUNS em logic.js (ids fixos do speedrun.com). Curiosidades ainda só em português no modo inglês.

## Decisões arquiteturais ativas
- DEC-20261125-0003-almanaque-dados-semanais [ativa] (SPEC-20261124-2318-almanaque) — script + GitHub Actions semanal; nunca grava vazio por cima de dado bom
- DEC-20261125-0003-almanaque-sem-guinness [ativa] (SPEC-20261124-2318-almanaque) — nome Almanaque; marca Guinness não é usada

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261124-2318-almanaque | padrao-hex com conteúdo (2026-11-25 00:03) — o ::after cobre os filhos: dar position:relative e z-index:1 ao conteúdo
- SPEC-20261124-2318-almanaque | WDQS cortando resposta (2026-11-25 00:03) — consulta grande devolve JSON incompleto em vez de erro: dividir a consulta
