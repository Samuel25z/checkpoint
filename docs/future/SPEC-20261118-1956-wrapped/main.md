# SPEC-20261118-1956: wrapped

**Status:** draft
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** —
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** wrapped, resumo-anual, estatisticas, animacao, card
**Features:** wrapped
**Branch:** —
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** Wrapped do ano: resumo animado em telas tipo stories a partir do diário, com card final para baixar como imagem.

## Objetivo

Transformar o diário do ano em algo que dá vontade de compartilhar, no estilo Spotify Wrapped.

## Escopo

**DENTRO:**
- Estatísticas do ano: total de horas, jogos zerados, jogo mais jogado, gênero favorito, melhor nota, plataforma mais usada, mês mais ativo
- 6 a 8 telas animadas com avanço por toque/teclado/tempo e barra de progresso
- Card final gerado em canvas e baixado como PNG
- Escolha do ano e estado vazio quando não há dados

**FORA:**
- Vídeo exportado

## Invariantes

- SEMPRE os números do Wrapped batem com o diário

## Implementação

logic.js puro calcula as estatísticas; telas com CSS transitions; card em <canvas>.

### Modelo de dados

—

## Riscos

- Capas de outro domínio 'sujarem' o canvas — mitigação: card usa só texto/cores, sem imagem externa

## Sinais de sucesso

- O card baixado tem os números certos do ano

## Critério de aceite

- [ ] As estatísticas do ano batem com um diário de exemplo (horas, zerados, gênero, plataforma, mês) | verify: `node --test tests/unit/wrapped.test.js`
- [ ] Na tela, o Wrapped percorre as telas e baixa o card PNG | verify: `npx playwright test tests/e2e/wrapped.spec.js`
