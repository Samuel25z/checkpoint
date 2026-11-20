# Journal — SPEC-20261120-1736

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-20 17:47
**Onde tô:** identidade nova: logo hexagonal rosa e branca, 3 visuais (Deck padrão com menu lateral; Palco e Joy em Configurações), claro/escuro em todos, Início com banner e anel de conquistas, página do jogo com arte grande, Wrapped com cores e hexágonos da marca e card novo
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** visual e tema são eixos independentes (data-visual × data-tema); casca do Deck só por CSS, sem mudar o HTML das abas
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/base.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | tokens e logo | concluído | 2026-11-20 17:47 |
| 2 | casca dos 3 visuais | concluído | 2026-11-20 17:47 |
| 3 | configurações | concluído | 2026-11-20 17:47 |
| 4 | Início, página do jogo, Wrapped | concluído | 2026-11-20 17:47 |
| 5 | testes e prints | concluído | 2026-11-20 17:47 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: o Samuel escolheu vendo 3 direções desenhadas com telas reais (lição 42/45 aplicada)
- fato: modal focava o botão Excluir ao abrir a página do jogo — corrigido para a ação principal

### Respostas-chave do usuário
- "as três ficaram muito top... a última vira a principal e as outras é a escolha da pessoa"
- "eu vou querer a cor rosa e branco"

### Tentativas que falharam
- trocar texto de arquivo com Get-Content/Set-Content no PowerShell estraga acentos (BOM + ANSI)

### Arquivos tocados
- css/tokens.css
- css/style.css
- index.html
- assets/icone.svg
- js/core/{visual,configuracoes,ui}.js
- js/app.js
- js/games.js
- js/modules/inicio/*
- js/modules/diario/{index.js,estilo.css}
- js/modules/wrapped/*
- tests/e2e/{visual,diario}.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-20 17:47 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-20 17:36 — [ativação] SPEC criada e ativada (@samuel, branch spec/identidade-v2, base main)

## 2026-11-20 17:47 — [nota] verify: 3/3 critérios passaram (commit `eaaf13e`)

- PASS: Escolha de visual aplica, persiste e todas as abas abrem se…
- PASS: Início mostra o banner do jogo em andamento com a arte e a …
- PASS: Suíte completa continua passando | verify: `npx playwright …

## 2026-11-20 17:47 — [conclusão] entregue

Identidade v2 entregue. 3/3 critérios verificados; 74 E2E e 101 unit verdes.
⎿ commit eaaf13e+dirty · 3 files changed, 45 insertions(+), 13 deletions(-)
