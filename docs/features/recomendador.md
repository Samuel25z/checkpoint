# Feature: recomendador

**Keywords:** recomendador, sugestao, etiquetas, humor, trailer
**Arquivos principais:**
  - js/modules/recomendador/logic.js
  - js/modules/recomendador/index.js
**Resumo:** Recomendação determinística por etiquetas, humor, tempo, companhia, plataforma e notas do diário, sempre com motivo legível.

## Specs desta feature
### Concluídas
- SPEC-20261118-1956-recomendador | 2026-11-18 | `25e705d` | Recomendador sem IA
### Planejadas (future/)

## Estado atual
recomendar(respostas, diario, jogos, {excluir, quantos}) → [{jogo, pontos, motivos}]. Respostas lembradas em storage 'recomendador:respostas'. 'Quero jogar' grava no diário via diario/dados.js com status 'quero'. Sugestão do dia por índice do dia.

## Decisões arquiteturais ativas
- DEC-20261118-2040-recomendador-sem-ia [ativa] (SPEC-20261118-1956-recomendador) — pontuação: 4 por etiqueta do humor + tempo + gosto (nota−3)/2 limitado + 2 se parecido com favorito; motivo sempre gerado junto

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-1956-recomendador | Element.append(null) também escreve 'null' (2026-11-18 20:40) — sempre .filter(Boolean) em listas com condicionais
