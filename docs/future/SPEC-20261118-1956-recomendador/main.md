# SPEC-20261118-1956: recomendador

**Status:** draft
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** —
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** recomendador, sugestao, etiquetas, trailer, humor
**Features:** recomendador
**Branch:** —
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** 'Que jogo eu jogo hoje?': recomendação sem IA por etiquetas, humor, tempo e notas do diário, com trailer e motivo.

## Objetivo

Indicar jogos de um jeito que dá vontade de jogar, explicando o porquê, sem custo de IA.

## Escopo

**DENTRO:**
- Perguntas: humor, tempo disponível, sozinho/amigos, plataforma
- Pontuação por etiquetas cruzando com as notas do diário (gosto do usuário)
- 3 sugestões com trailer do YouTube, motivo ('porque você deu 5 para X') e botão 'adicionar a quero jogar'
- Botão 'outra sugestão' sem repetir as já mostradas
- Sugestão do dia na Início

**FORA:**
- IA generativa

## Invariantes

- NUNCA recomendar jogo que já está como zerado/platinado no diário
- SEMPRE o mesmo pedido gera o mesmo resultado (determinístico, exceto 'outra sugestão')

## Implementação

logic.js puro com função de pontuação explicável (retorna motivo junto da nota).

### Modelo de dados

—

## Riscos

- Catálogo pequeno repetir sugestões — mitigação: exclusão das já vistas e variedade de etiquetas

## Sinais de sucesso

- Cada sugestão vem com um motivo legível

## Critério de aceite

- [ ] Pontuação, exclusões, motivo e 'outra sugestão' estão corretos | verify: `node --test tests/unit/recomendador.test.js`
- [ ] Na tela, responder as perguntas, ver 3 sugestões com motivo e adicionar uma ao diário | verify: `npx playwright test tests/e2e/recomendador.spec.js`
