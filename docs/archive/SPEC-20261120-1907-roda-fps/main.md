# SPEC-20261120-1907: roda fps

**Status:** done
**Porte:** M
**Owner:** @samuel25z
**Criada:** 2026-11-20 19:07
**Ativada:** 2026-11-20 19:07
**Concluída:** 2026-11-20 19:14
**Pausada em:** —
**Commit final:** `28bf50b`
**Keywords:** roda-no-pc, fps, resolucao, upgrade, detalhes
**Features:** roda-no-pc
**Branch:** spec/roda-fps
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-20 19:07
**Resumo:** O "Roda no meu PC?" passa a estimar quantos FPS cada jogo roda e mostra uma página de detalhes por jogo (peça por peça, resoluções, gargalo e que placa resolveria).

## Objetivo

O Samuel achou que a aba dá poucas informações ("Você poderia dar também estimativa de quantos FPS roda... Coloque mais informações para a pessoa conseguir entender mais a profundidade daquilo"). A aba deve mostrar FPS estimado na lista e abrir um detalhe que explica o resultado em profundidade.

## Escopo

**DENTRO:**
- Estimativa de FPS por qualidade (Baixo, Médio, Alto, Ultra) e resolução (1080p, 1440p, 4K)
- Seletor de resolução na aba; a lista mostra "~N FPS" no nível sugerido
- Detalhe do jogo (clique na linha): tabela de FPS por qualidade × resolução, comparação peça por peça com o mínimo e o recomendado, gargalo explicado, requisitos oficiais e a placa mais fraca da lista que alcança 60 FPS no Alto
- Aviso claro de que é estimativa

**FORA:**
- Benchmarks reais por jogo; ray tracing, DLSS/FSR

## Invariantes

- SEMPRE rotular o FPS como estimativa ("~") e explicar a base do cálculo
- NUNCA mostrar FPS para jogo que não roda (abaixo do mínimo)

## Implementação

logic.js ganha estimarFps(pc, requisitos, {qualidade, resolucao}), tabelaFps, comparar (peça por peça) e placaPara60. Base: o requisito recomendado mira ~60 FPS no Alto em 1080p; a placa escala o FPS proporcionalmente à pontuação; o processador limita o teto; memória abaixo do recomendado tira 15%. Qualidade: Baixo 1,6×, Médio 1,25×, Alto 1×, Ultra 0,75×. Resolução: 1440p 0,65×, 4K 0,35×.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| hardware:resolucao (LocalStorage) | "1080p" \| "1440p" \| "4k" |

## Riscos

- FPS estimado diferente do real — mitigação: "~", faixa arredondada e nota explicando a base

## Sinais de sucesso

- O Samuel abre um jogo e entende quantos FPS esperar e o que trocar para melhorar

## Critério de aceite

- [x] estimarFps, tabela, comparação e placa para 60 FPS testados (2026-11-20 19:14, commit `28bf50b`, verify: exit 0) | verify: `node --test tests/unit/hardware.test.js`
- [x] lista com FPS, seletor de resolução e detalhe do jogo funcionam na tela (2026-11-20 19:14, commit `28bf50b`, verify: exit 0) | verify: `npx playwright test tests/e2e/roda-no-pc.spec.js`
