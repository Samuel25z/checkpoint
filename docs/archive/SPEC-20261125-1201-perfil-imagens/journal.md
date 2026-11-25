# Journal — SPEC-20261125-1201

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-25 12:06
**Onde tô:** foto e banner no Meu perfil por arquivo (foto reduzida; GIF com limite) ou por link https, com prévia, remover e sincronização em perfil:imagens
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** GIF não é reduzido (perderia a animação): limite 200 KB foto e 450 KB banner, acima disso link; fotos estáticas viram WebP 256x256 e 1500x500
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/perfil.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | regras de arquivo e link | concluído | 2026-11-25 12:06 |
| 2 | tela de edição e capa | concluído | 2026-11-25 12:06 |
| 3 | sincronização e banco | concluído | 2026-11-25 12:06 |
| 4 | testes | concluído | 2026-11-25 12:06 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: foto 256x256 em WebP fica em dezenas de KB; o pacote máximo (GIF foto + GIF banner em base64) fica abaixo de 1 MB
- fato: tipo do arquivo conferido pelos primeiros bytes (GIF8, PNG, FFD8FF, RIFF/WEBP)

### Respostas-chave do usuário
- "o banner ou a foto pode ser GIF... de preferência GIFs com uma porcentagem muito baixa de megas ou kbytes"
- "E a opção de botar em link, que aí se botar em link não custa para ninguém"

### Tentativas que falharam


### Arquivos tocados
- js/modules/perfil/imagens.js
- js/modules/perfil/index.js
- js/modules/perfil/estilo.css
- js/core/sync.js
- js/core/i18n.js
- supabase/migracao.sql
- tests/unit/perfil-imagens.test.js
- tests/e2e/perfil.spec.js
- README.md
- relatorio/prompts.md

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-25 12:06 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-25 12:01 — [ativação] SPEC criada e ativada (@samuel25z, branch spec/perfil-imagens, base main)

## 2026-11-25 12:06 — [conclusão] entregue

Foto e banner entregues. 2/2 critérios verificados.
⎿ commit 4d7bb98+dirty · 9 files changed, 156 insertions(+), 9 deletions(-)

## 2026-11-25 12:06 — [nota] verify: 2/2 critérios passaram (commit `533836d`)

- PASS: assinatura de arquivo, limites, links e tamanho testados | …
- PASS: enviar foto, GIF grande recusado, link de banner, remover e…
