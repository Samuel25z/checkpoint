# SPEC-20261118-1956: controle idioma

**Status:** draft
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** —
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** gamepad, controle, acessibilidade, idioma, ingles, i18n
**Features:** base
**Branch:** —
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** Navegação por controle de videogame (Gamepad API) e opção de idioma inglês nas configurações.

## Objetivo

Dar o diferencial de usar o site como o menu de um console e permitir mostrar o projeto em inglês.

## Escopo

**DENTRO:**
- Gamepad API: direcional/analógico move o foco, A confirma, B volta, LB/RB trocam de aba, botão do cronômetro faz split
- Indicador visual de foco no estilo console
- Configurações: idioma português/inglês com textos da casca e das abas

**FORA:**
- Outros idiomas

## Invariantes

- SEMPRE tudo que funciona com controle também funciona com teclado

## Implementação

core/gamepad.js com laço requestAnimationFrame só enquanto há controle conectado; core/i18n.js com dicionários por módulo.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| Preferências | idioma, controleAtivo |

## Riscos

- Diferença de mapeamento entre controles — mitigação: usar o mapeamento 'standard'

## Sinais de sucesso

- Na apresentação, o site é navegado só com o controle

## Critério de aceite

- [ ] Mapeamento de botões para ações e dicionários de idioma completos (sem chave faltando) | verify: `node --test tests/unit/gamepad-i18n.test.js`
- [ ] Com controle simulado, o foco anda e troca de aba; trocar para inglês muda a interface e persiste | verify: `npx playwright test tests/e2e/controle-idioma.spec.js`
