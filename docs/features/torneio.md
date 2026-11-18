# Feature: torneio

**Keywords:** torneio, chaveamento, bracket, campeao, eliminacao
**Arquivos principais:**
  - js/modules/torneio/index.js
  - js/modules/torneio/logic.js
**Resumo:** Chaveamento de eliminação simples de 4 a 32 jogadores com folgas automáticas, desfazer em cascata, campeão animado e histórico.

## Specs desta feature
### Concluídas
- SPEC-20261118-1956-torneio | 2026-11-18 | `16f6cfb` | Torneio com chaveamento animado
### Planejadas (future/)

## Estado atual
Torneios em storage 'torneio:lista' [{id,nome,jogo,jogadores[{id,nome,foto}],chave{rodadas[[{a,b,vencedor}]]},campeao,criadoEm}] e 'torneio:atual'. Foto do jogador: 'Nome | https://...'.

## Decisões arquiteturais ativas
- DEC-20261118-2037-torneio-desfazer-cascata [ativa] (SPEC-20261118-1956-torneio) — mudar resultado limpa as partidas seguintes que dependiam dele; folgas não se desfazem

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-1956-torneio | Element.replaceChildren com null escreve 'null' (2026-11-18 20:37) — montar listas com .filter(Boolean); semBotaoMorto() agora reprova texto null/undefined
