# SPEC-20261121-0014: barra rolagem

**Status:** done
**Porte:** P
**Owner:** @samuel25z
**Criada:** 2026-11-21 00:14
**Ativada:** 2026-11-21 00:14
**Concluída:** 2026-11-21 00:16
**Pausada em:** —
**Commit final:** `2e03393`
**Keywords:** barra-de-rolagem, scrollbar, modal, visual
**Features:** base
**Branch:** spec/barra-rolagem
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-21 00:14
**Resumo:** Barra de rolagem fina e moderna, na cor de cada visual, no lugar da barra cinza padrão do navegador (que aparecia com setas dentro das janelas).

## Objetivo

O Samuel mandou print da janela de detalhe com a barra padrão ("tá meio aquela lateral antiga... faz uma lateral bonitinha, moderna"). A barra de rolagem do site inteiro passa a ser fina, arredondada, sem setas e na cor da marca.

## Escopo

**DENTRO:**
- Barra fina e arredondada no site e nas janelas (modais), sem setas, com trilho transparente e afastada das bordas arredondadas
- Cor do polegar segue o tema; no hover/arrastando usa a cor de destaque do visual (Deck, Palco, Joy)

**FORA:**
- Barra de rolagem desenhada em JavaScript

## Invariantes

- SEMPRE a rolagem continua nativa (teclado, roda do mouse, toque e leitor de tela funcionam igual)

## Implementação

Tokens --rolagem e --rolagem-hover em css/style.css; scrollbar-width/scrollbar-color (Firefox/Chrome novo) e ::-webkit-scrollbar (Chrome/Edge/Safari) com borda transparente e margem do trilho para não cortar o canto arredondado do modal.

### Modelo de dados

—

## Riscos

—

## Sinais de sucesso

- A janela de detalhe do Roda no meu PC rola com uma barra discreta que combina com o visual

## Critério de aceite

- [x] barra estilizada no site e no modal, em todos os visuais, sem rolagem lateral (2026-11-21 00:16, commit `2e03393`, verify: exit 0) | verify: `npx playwright test tests/e2e/visual.spec.js`
