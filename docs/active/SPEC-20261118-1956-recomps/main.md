# SPEC-20261118-1956: recomps

**Status:** active
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** 2026-11-18 20:31
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** recomps, ports, decomp, github, catalogo, releases
**Features:** recomps
**Branch:** spec/recomps
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** Catálogo de recomps e ports que se atualiza sozinho pela API do GitHub, com destaques, busca e 'seguir projeto'.

## Objetivo

Reunir num lugar bonito os projetos de recompilação e ports de jogos que hoje ficam espalhados no GitHub, mostrando se estão ativos e qual a última versão, sem hospedar nenhum jogo.

## Escopo

**DENTRO:**
- ~15 destaques escolhidos à mão (Zelda64Recomp, Ship of Harkinian, 2 Ship 2 Harkinian, sm64coopdx etc.)
- Busca ao vivo no GitHub por nome de jogo nos tópicos recomp/decomp/port
- Card com última versão, data, estrelas, linguagem, ativo/parado e 'precisa da sua ROM'
- Botão para a página oficial de releases do projeto
- Seguir projeto e aviso de versão nova ao abrir o site
- Aviso fixo: o Checkpoint não hospeda nem distribui jogos

**FORA:**
- Download hospedado pelo site
- Links para ROMs ou jogos piratas

## Invariantes

- NUNCA linkar ROM, ISO ou jogo — só a página oficial do projeto no GitHub
- SEMPRE respeitar o limite da API pública do GitHub com cache

## Implementação

services/github.js com cache de 1h no LocalStorage e tratamento do limite (403/429 → mensagem e dados em cache); logic.js puro para normalizar repositórios e classificar ativo (commit/release nos últimos 6 meses).

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| Projeto | repo, nome, jogo, console, estrelas, ultimaVersao, dataVersao, ativo, precisaRom |
| Seguidos | repo → última versão vista |

## Riscos

- Limite de 60 requisições/hora do GitHub — mitigação: cache, busca sob demanda e mensagem clara

## Sinais de sucesso

- Um projeto seguido mostra 'versão nova' quando a release muda

## Critério de aceite

- [ ] Normalização dos repositórios, regra de ativo e detecção de versão nova estão corretas | verify: `node --test tests/unit/recomps.test.js`
- [ ] A aba mostra destaques e busca com rede simulada, segue um projeto e trata limite da API sem quebrar | verify: `npx playwright test tests/e2e/recomps.spec.js`
