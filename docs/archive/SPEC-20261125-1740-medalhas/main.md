# SPEC-20261125-1740: medalhas

**Status:** done
**Porte:** P
**Owner:** @samuel25z
**Criada:** 2026-11-25 17:40
**Ativada:** 2026-11-25 17:40
**Concluída:** 2026-11-25 17:42
**Pausada em:** —
**Commit final:** `0cbd597`
**Keywords:** medalhas, simbolos, perfil, svg
**Features:** perfil
**Branch:** spec/medalhas
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-25 17:40
**Resumo:** Cada medalha ganha um símbolo próprio no hexágono da marca (grau na cor da borda e em pontinhos), no lugar do hexágono laranja igual para todas.

## Objetivo

"Maratonista, teu símbolo, não ficar essa coisa laranjada. Cada um tem o seu desenho. O mais focado possível no design já do nosso projeto."

## Escopo

**DENTRO:**
- js/modules/perfil/simbolos.js com o desenho de cada medalha e o cadeado da bloqueada
- Uso no Meu perfil e no perfil público (Amigos); cores de grau ajustadas para o tema claro

**FORA:**
- Medalhas novas

## Invariantes

—

## Implementação

svgMedalha(id, grau) monta o hexágono da marca com o desenho próprio, borda e pontos na cor do grau.

### Modelo de dados

—

## Riscos

—

## Sinais de sucesso

- O Samuel reconhece cada medalha pelo desenho

## Critério de aceite

- [x] medalhas do perfil continuam aparecendo com grau e progresso (2026-11-25 17:42, commit `0cbd597`, verify: exit 0) | verify: `npx playwright test tests/e2e/perfil.spec.js`
