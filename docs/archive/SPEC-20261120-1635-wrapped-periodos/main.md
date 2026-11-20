# SPEC-20261120-1635: wrapped periodos

**Status:** done
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-20 16:35
**Ativada:** 2026-11-20 16:35
**Concluída:** 2026-11-20 16:37
**Pausada em:** —
**Commit final:** `7c301ec`
**Keywords:** wrapped, periodo, resumo, ate-agora
**Features:** wrapped
**Branch:** spec/wrapped-periodos
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-20 16:35
**Resumo:** Wrapped a qualquer momento: este ano até agora, últimos 30 dias, desde sempre e anos anteriores.

## Objetivo

O Samuel quer ver o resumo durante o ano, sem esperar dezembro. O Wrapped passa a aceitar períodos e deixa claro quando é "até agora".

## Escopo

**DENTRO:**
- Períodos: este ano até agora, últimos 30 dias, desde sempre e cada ano anterior com registros
- Título e card dizem o período ("Seu 2026 até agora", "Seus últimos 30 dias", "Desde sempre")
- Rota guarda o período escolhido (#/wrapped/30-dias, #/wrapped/tudo, #/wrapped/2025)

**FORA:**
- Visual novo das telas (vem com a identidade nova)

## Invariantes

- SEMPRE os números batem com o diário do período escolhido

## Implementação

wrapped/logic.js ganha `periodos(diario, agora)` e `estatisticas(diario, periodo, catalogo, agora)` com periodo { tipo: 'ano'|'dias'|'tudo' }.

### Modelo de dados

—

## Riscos

- Registro sem datas — mitigação: usa a data de criação, como antes

## Sinais de sucesso

- Em novembro o Samuel vê "Seu 2026 até agora" e também os últimos 30 dias

## Critério de aceite

- [x] Estatísticas por período (ano, 30 dias, tudo) batem com um diário de exemplo (2026-11-20 16:37, commit `7c301ec`, verify: exit 0) | verify: `node --test tests/unit/wrapped.test.js`
- [x] Na tela, trocar de período muda os números e o título, e o card baixa com o nome do período (2026-11-20 16:37, commit `7c301ec`, verify: exit 0) | verify: `npx playwright test tests/e2e/wrapped.spec.js`