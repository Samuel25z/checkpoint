# SPEC-20261118-1956: entrega

**Status:** active
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** 2026-11-18 20:51
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** entrega, github-pages, cloudflare, readme, relatorio, prompts, slides
**Features:** entrega
**Branch:** spec/entrega
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** Publicação no GitHub Pages e Cloudflare, README com link ativo, relatório em Word com Apêndice A de prompts e slides.

## Objetivo

Fechar todos os entregáveis do trabalho da disciplina com o site no ar e documentado.

## Escopo

**DENTRO:**
- Repositório público Samuel25z/checkpoint e GitHub Pages ativo
- README com link ativo, como rodar, como publicar e receita para criar uma aba nova
- Relatório .docx seguindo o roteiro da professora, com capturas automáticas e Apêndice A (≥10 prompts)
- Slides da apresentação
- Publicação no Cloudflare Pages (conta do Samuel)

**FORA:**
- Vídeo de demonstração (feito depois com a skill mente-de-edicao)

## Invariantes

- SEMPRE conferir no ar (procurar texto da versão) e não só confiar no comando

## Implementação

Script de captura de telas com Playwright; relatório gerado com a skill docx; slides com a skill pptx.

### Modelo de dados

—

## Riscos

- Login do Cloudflare depende do Samuel — mitigação: GitHub Pages já cobre a exigência do trabalho

## Sinais de sucesso

- O link do README abre o site publicado

## Critério de aceite

- [ ] O site publicado no GitHub Pages responde e contém a versão atual | verify: `node scripts/check-publicado.mjs`
- [ ] README tem link ativo, instruções e receita de nova aba | verify: `node scripts/check-readme.mjs`
- [ ] Relatório .docx e slides gerados com Apêndice A de pelo menos 10 prompts | verify: `node scripts/check-entregaveis.mjs`
