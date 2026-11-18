# SPEC-20261118-1956: roda no pc

**Status:** active
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** 2026-11-18 20:31
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** hardware, requisitos, gpu, webgl, desempenho, pc
**Features:** hardware
**Branch:** spec/roda-no-pc
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** 'Roda no meu PC?': detecta a placa de vídeo pelo navegador, compara com requisitos do catálogo e diz em que qualidade roda.

## Objetivo

Responder a dúvida que todo jogador tem antes de comprar um jogo, sem instalar programa: o site detecta o que dá e o usuário confirma o resto.

## Escopo

**DENTRO:**
- Detecção da GPU (WebGL), núcleos do processador e memória aproximada
- Formulário para confirmar/escolher CPU, GPU e RAM a partir de listas com pontuação
- Comparação com os requisitos de ~60 jogos: não roda, baixo, médio, alto, ultra
- Vários PCs salvos (ex.: 'meu PC', 'PC da faculdade')
- Busca e filtro do resultado por jogo

**FORA:**
- Benchmark real de desempenho
- Medição de FPS

## Invariantes

- SEMPRE deixar claro que é uma estimativa

## Implementação

logic.js puro com tabelas de pontuação de CPU/GPU e função de classificação por requisito mínimo/recomendado; detecção isolada em detect.js.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| PC | id, nome, cpu, gpu, ramGb |
| Peças | nome → pontuação relativa |

## Riscos

- Navegador esconder o nome da GPU — mitigação: lista para o usuário escolher

## Sinais de sucesso

- Em menos de 1 minuto a pessoa sabe quais jogos do catálogo rodam no PC dela

## Critério de aceite

- [ ] A classificação (não roda/baixo/médio/alto/ultra) e a busca de peças estão corretas | verify: `node --test tests/unit/hardware.test.js`
- [ ] Na tela, a detecção preenche o formulário, salva dois PCs e mostra o resultado por jogo | verify: `npx playwright test tests/e2e/roda-no-pc.spec.js`
