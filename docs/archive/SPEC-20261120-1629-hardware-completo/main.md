# SPEC-20261120-1629: hardware completo

**Status:** done
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-20 16:29
**Ativada:** 2026-11-20 16:29
**Concluída:** 2026-11-20 16:35
**Pausada em:** —
**Commit final:** `135fedb`
**Keywords:** hardware, processador, placa-de-video, combobox, base
**Features:** hardware
**Branch:** spec/hardware-completo
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-20 16:29
**Resumo:** Base grande de processadores e placas (desktop, notebook, integradas, Steam Deck) e uma caixa de escolha própria que mostra tudo, filtra ao digitar e deixa trocar a peça a qualquer momento.

## Objetivo

O Samuel testou o "Roda no meu PC?" e não conseguiu trocar a placa detectada nem achar vários processadores. A aba precisa de uma base que cubra os PCs comuns (inclusive notebooks e integradas) e de um campo de escolha que funcione igual no PC e no celular.

## Escopo

**DENTRO:**
- Base com mais de 150 processadores e mais de 120 placas (Intel 2ª a 14ª geração e Core Ultra, Ryzen 1000 a 9000, notebooks, GTX 600 a RTX 50, RX 400 a RX 9000, Arc, integradas, Steam Deck)
- Caixa de escolha própria: abre mostrando todas, filtra por partes do nome em qualquer ordem ("1660 super"), teclado (setas, Enter, Esc), botão de limpar, funciona no celular
- Peças com nome parecido digitadas livremente são reconhecidas ao salvar
- Requisitos do catálogo continuam todos apontando para peças existentes

**FORA:**
- Benchmark real

## Invariantes

- SEMPRE dá para trocar a peça escolhida ou detectada
- NUNCA peça do catálogo de jogos sem pontuação na base

## Implementação

js/data/hardware.js passa a ter listas por família com pontuação relativa; js/core/combobox.js é um componente reutilizável (role combobox + listbox) usado no formulário do PC.

### Modelo de dados

—

## Riscos

- Pontuações aproximadas — mitigação: aviso de estimativa já existente; valores relativos coerentes entre gerações

## Sinais de sucesso

- O Samuel acha o processador e a placa dele e do amigo e troca a placa detectada sem travar

## Critério de aceite

- [x] Base tem 150+ CPUs e 120+ GPUs, sem nomes repetidos, e todo requisito do catálogo existe nela (2026-11-20 16:35, commit `135fedb`, verify: exit 0) | verify: `node --test tests/unit/games.test.js tests/unit/hardware.test.js`
- [x] Busca da caixa de escolha acha por partes do nome em qualquer ordem e ignora acento e caixa (2026-11-20 16:35, commit `135fedb`, verify: exit 0) | verify: `node --test tests/unit/combobox.test.js`
- [x] Na tela, a placa detectada pode ser trocada por outra pela lista, o processador é escolhido por busca, limpar funciona e o resultado aparece, no celular e no PC (2026-11-20 16:35, commit `135fedb`, verify: exit 0) | verify: `npx playwright test tests/e2e/roda-no-pc.spec.js`