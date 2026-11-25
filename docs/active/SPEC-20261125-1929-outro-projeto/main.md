# SPEC-20261125-1929: outro projeto

**Status:** active
**Porte:** P
**Owner:** @samuel25z
**Criada:** 2026-11-25 19:29
**Ativada:** 2026-11-25 19:29
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** outro-projeto, drift-tela, video, aba
**Features:** base
**Branch:** spec/outro-projeto
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-25 19:28
**Resumo:** Aba Outro projeto no fim do menu com o vídeo do Drift Tela.

## Objetivo

"Quero que você coloque uma nova aba no final escrito outro projeto e lá você vai colocar o vídeo que fizemos do Drift Tela."

## Escopo

**DENTRO:**
- Aba Outro projeto como último item do menu, com o vídeo assets/drift-tela.mp4 (1:10), capa e tela cheia

**FORA:**
- Página própria do Drift Tela

## Invariantes

—

## Implementação

js/modules/outro-projeto/index.js reaproveitando o estilo da aba Apresentação; 1 linha no fim do registry.

### Modelo de dados

—

## Riscos

—

## Sinais de sucesso

- O Samuel mostra o Drift Tela no fim da apresentação

## Critério de aceite

- [ ] aba no fim do menu mostra o vídeo do Drift Tela | verify: `npx playwright test tests/e2e/outro-projeto.spec.js`
