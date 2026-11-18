# SPEC-20261118-1956: torneio

**Status:** draft
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** —
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** torneio, chaveamento, bracket, campeonato, eliminacao
**Features:** torneio
**Branch:** —
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** Chaveamento animado de 4 a 32 jogadores com sorteio, avanço por clique, campeão e histórico.

## Objetivo

Organizar campeonatos entre amigos sem cadastro e sem trabalho, de um jeito divertido de mostrar na tela.

## Escopo

**DENTRO:**
- Cadastro de 4 a 32 jogadores (com foto opcional por URL) e nome do jogo
- Sorteio e montagem automática da chave, com 'bye' quando não for potência de 2
- Clique no vencedor avança; desfazer resultado; placar opcional
- Tela de campeão animada (respeitando redução de movimento)
- Histórico de torneios salvos

**FORA:**
- Dupla eliminação e pontos corridos

## Invariantes

- SEMPRE a chave é consistente: cada partida tem no máximo um vencedor e alimenta exatamente uma partida seguinte

## Implementação

logic.js puro: geração da chave com byes, avanço, desfazer e campeão; render em colunas por rodada com CSS grid.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| Torneio | id, nome, jogo, jogadores[], rodadas[[partida]], campeao, criadoEm |

## Riscos

- Chave grande não caber no celular — mitigação: rolagem horizontal da área da chave e rodadas compactas

## Sinais de sucesso

- Um torneio de 8 é criado e jogado até o campeão em menos de 2 minutos

## Critério de aceite

- [ ] Geração da chave com byes, avanço, desfazer e campeão estão corretos para 4 a 32 jogadores | verify: `node --test tests/unit/torneio.test.js`
- [ ] Na tela, criar torneio de 6, jogar até o campeão, recarregar e ver no histórico | verify: `npx playwright test tests/e2e/torneio.spec.js`
