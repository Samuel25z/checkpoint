# SPEC-20261125-2002: drift download

**Status:** done
**Porte:** P
**Owner:** @samuel25z
**Criada:** 2026-11-25 20:02
**Ativada:** 2026-11-25 20:02
**Concluída:** 2026-11-25 20:04
**Pausada em:** —
**Commit final:** `0853e8a`
**Keywords:** drift-tela, download, outro-projeto
**Features:** base
**Branch:** spec/drift-download
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-25
**Resumo:** Botões de baixar o Drift Tela e abrir no navegador na aba Outro projeto.

## Objetivo

"coloca o link do download do drift tela"

## Escopo

**DENTRO:**
- Botão Baixar para Windows (instalador oficial /app/Drift-setup.exe) e Abrir no navegador (/tela)

**FORA:**
- Hospedar o instalador no GitHub Pages

## Invariantes

—

## Implementação

PROJETO.baixar e PROJETO.navegador em js/modules/outro-projeto/index.js.

### Modelo de dados

—

## Riscos

—

## Sinais de sucesso

- Quem vê a apresentação consegue baixar o Drift Tela

## Critério de aceite

- [x] aba mostra os botões de baixar e abrir no navegador com os links oficiais (2026-11-25 20:04, commit `8bffa9d`, verify: exit 0) | verify: `npx playwright test tests/e2e/outro-projeto.spec.js`
