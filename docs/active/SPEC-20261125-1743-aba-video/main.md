# SPEC-20261125-1743: aba video

**Status:** active
**Porte:** P
**Owner:** @samuel25z
**Criada:** 2026-11-25 17:43
**Ativada:** 2026-11-25 17:43
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** aba, video
**Features:** —
**Branch:** spec/aba-video
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-25 17:43
**Resumo:** <1 frase sobre o que entrega e por quê>

## Objetivo

<2-3 frases: o quê e por quê.>

## Escopo

**DENTRO:**
- <item>

**FORA:**
- <item>

## Invariantes

<!-- propriedades que valem SEMPRE (antes/durante/depois) — linhas-vermelhas que QUALQUER mudança futura pode violar; distintas dos critérios (que checam o estado final). Estilo SEMPRE/NUNCA. P trivial: "—" -->
- SEMPRE/NUNCA <propriedade que não pode ser violada>

## Implementação

<abordagem em alto nível; porte G: o detalhe fino vai em techspec.md>

### Modelo de dados

<!-- entidades/campos novos ou tocados (schema, tabelas, tipos); "—" se não há mudança de dados -->
| Entidade | Campos / mudança |
|---|---|
| <Entidade> | <campos> |

<!-- Alternativas (M/G): abordagens consideradas e REJEITADAS + porquê — evita reabrir becos sem saída. Decisão irreversível (porta de mão-única): marque [irreversível] p/ sinalizar mais escrutínio. -->

## Riscos

<!-- riscos técnicos/de segurança + mitigação (contrato estável — NÃO é progresso; decisões/fases vão no journal); P trivial: "—" -->
- <risco> — mitigação: <como>

## Sinais de sucesso

<!-- como saberemos que a SPEC cumpriu o PROPÓSITO (não só a corretude dos critérios) — métrica/sinal observável; P: 1 linha -->
- <resultado observável que indica que valeu>

## Critério de aceite

<!-- P: feche com: node scripts/specctl.mjs check <id> <n> -->
- [ ] <critério binário e verificável>
