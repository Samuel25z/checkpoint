# SPEC-20261120-1643: recomendador v2

**Status:** active
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-20 16:43
**Ativada:** 2026-11-20 16:43
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** recomendador, metacritic, gosto, variedade
**Features:** recomendador
**Branch:** spec/recomendador-v2
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-20 16:43
**Resumo:** Recomendações melhores sem IA: qualidade real (Metacritic e recomendações da Steam), semelhança com os jogos que a pessoa gostou, humor obrigatório e variedade de gênero.

## Objetivo

O Samuel recebeu sugestões soltas (Apex como sugestão do dia; God of War, Undertale e Celeste juntos sem motivo forte). As sugestões precisam priorizar jogos bons de verdade e parecidos com o gosto dele, explicando o porquê com dados reais.

## Escopo

**DENTRO:**
- Dado real de qualidade: nota do Metacritic e total de recomendações na Steam, gravados com a data da consulta (scripts/atualizar-avaliacoes.mjs)
- Semelhança por etiquetas com os jogos bem avaliados no diário (e afastamento dos mal avaliados)
- Humor escolhido vira filtro (só entra jogo que combina), com reserva se sobrarem menos de 3
- Variedade: no máximo 1 jogo por gênero principal entre as 3 sugestões, quando houver opção
- Motivos com fatos: "Nota 95 no Metacritic", "Parecido com Hollow Knight, que você deu 5"
- Sugestão do dia escolhida entre os melhores para o gosto da pessoa (não por sorteio entre empates)

**FORA:**
- IA generativa; notas inventadas para jogos sem Metacritic

## Invariantes

- NUNCA recomendar jogo zerado, platinado, largado ou em andamento
- NUNCA inventar nota: jogo sem Metacritic não ganha nota

## Implementação

recomendador/logic.js ganha qualidade(), semelhança Jaccard por etiquetas, filtro de humor e seleção com variedade; js/data/avaliacoes.js guarda os dados da loja.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| js/data/avaliacoes.js | appid → { metacritic?, recomendacoes? } + data da consulta |

## Riscos

- Dados da loja envelhecem — mitigação: script para atualizar e data visível no arquivo

## Sinais de sucesso

- As sugestões do Samuel trazem jogos aclamados e parecidos com os que ele gostou, com motivo claro

## Critério de aceite

- [ ] Qualidade real, semelhança de gosto, humor como filtro, variedade e sugestão do dia estão corretos | verify: `node --test tests/unit/recomendador.test.js`
- [ ] Na tela, as 3 sugestões mostram motivos com fatos e "outra sugestão" não repete | verify: `npx playwright test tests/e2e/recomendador.spec.js`