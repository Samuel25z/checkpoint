# Feature: entrega

**Keywords:** entrega, github-pages, readme, relatorio, slides, capturas
**Arquivos principais:**
  - README.md
  - scripts/check-publicado.mjs
  - scripts/capturas.mjs
  - relatorio/
**Resumo:** Publicação no GitHub Pages e entregáveis da disciplina (README, relatório com Apêndice A, slides) com checagens automáticas.

## Specs desta feature
### Concluídas
- SPEC-20261118-1956-entrega | 2026-11-18 | `f92826e` | Publicação, README, relatório e slides
### Planejadas (future/)

## Estado atual
Site: https://samuel25z.github.io/checkpoint/ (push em main publica). Versão em <meta name=checkpoint-versao>. Capturas: node scripts/capturas.mjs (precisa do servidor em 5173). Geradores do relatório e dos slides ficaram no scratchpad da sessão (docx/pptxgenjs); conteúdo vem de relatorio/prompts.md e relatorio/capturas.

## Decisões arquiteturais ativas
- DEC-20261118-2104-entrega-arquivos-office [ativa] (SPEC-20261118-1956-entrega) — relatório .docx e slides .pptx para abrir offline no PC da faculdade

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-1956-entrega | mesclar branch de SPEC ativa em main (2026-11-18 21:04) — sempre close antes do merge; se publicar exigir main, fechar a SPEC logo depois
