# SPEC-20261120-1736: identidade v2

**Status:** done
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-20 17:36
**Ativada:** 2026-11-20 17:36
**Concluída:** 2026-11-20 17:47
**Pausada em:** —
**Commit final:** `eaaf13e`
**Keywords:** identidade, visual, logo, deck, palco, joy, tema
**Features:** base
**Branch:** spec/identidade-v2
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-20 17:36
**Resumo:** Identidade nova: visual Deck (menu lateral, magenta, Chakra Petch) como padrão, Palco e Joy como opções em Configurações, logo hexagonal rosa e branca, Início com banner, página do jogo com arte grande e Wrapped com fundos da marca.

## Objetivo

O Samuel achou o visual anterior "retrógrado, com cara de IA" e a logo "parecendo um PNG". Ele escolheu entre 3 direções desenhadas com telas reais: Deck vira o padrão; Palco e Joy ficam como opção. A identidade precisa chamar atenção e continuar funcionando em celular e PC, claro e escuro.

## Escopo

**DENTRO:**
- Logo hexagonal rosa e branca (topo, favicon, card do Wrapped, slides)
- 3 visuais (Deck padrão, Palco, Joy) com fontes, cores, cantos e casca próprios; escolha em Configurações, salva no navegador
- Tema claro/escuro continua em todos os visuais
- Início: banner "Continuar jogando" com a arte do jogo, anel de conquistas quando houver, estante de capas e atalhos
- Página do jogo no Diário com arte grande do jogo no topo (sem fundo rosa liso)
- Wrapped com fundos da marca (hexágonos, capas desfocadas) em vez de cor lisa
- Capas com selo de status no canto inferior (Deck)

**FORA:**
- Mudar regras das abas (só visual)
- Vídeo da apresentação

## Invariantes

- SEMPRE todas as abas funcionam igual nos 3 visuais e nos 2 temas
- NUNCA texto ilegível (contraste) no claro ou no escuro
- SEMPRE sem rolagem lateral no celular

## Implementação

css/tokens.css define tokens por `data-visual` (deck|palco|joy) e `data-tema` (escuro|claro); css/style.css monta a casca de cada visual (Deck: menu lateral fixo; Palco/Joy: topo). js/core/visual.js carrega as fontes do visual e aplica a escolha; Configurações ganha a escolha de visual com miniatura.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| pref:visual | 'deck' (padrão) · 'palco' · 'joy' |

## Riscos

- Muito CSS novo quebrar telas — mitigação: suíte E2E inteira roda nos 3 visuais (fumaça) e prints de cada visual conferidos

## Sinais de sucesso

- O Samuel abre o site e acha que tem cara própria, não de IA

## Critério de aceite

- [x] Escolha de visual aplica, persiste e todas as abas abrem sem erro e sem rolagem lateral nos 3 visuais e 2 temas (2026-11-20 17:46, commit `eaaf13e`, verify: exit 0) | verify: `npx playwright test tests/e2e/visual.spec.js`
- [x] Início mostra o banner do jogo em andamento com a arte e a estante; página do jogo mostra a arte grande (2026-11-20 17:46, commit `eaaf13e`, verify: exit 0) | verify: `npx playwright test tests/e2e/diario.spec.js tests/e2e/visual.spec.js -g "banner|arte"`
- [x] Suíte completa continua passando (2026-11-20 17:47, commit `eaaf13e`, verify: exit 0) | verify: `npx playwright test`