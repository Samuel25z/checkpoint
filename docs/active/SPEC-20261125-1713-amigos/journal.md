# Journal — SPEC-20261125-1713

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-25 17:22
**Onde tô:** aba Amigos entregue: escolher @, perfil público por link, buscar, seguir, amigos, feed e perfil privado; banco com perfis e seguindo protegidos por RLS
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** modelo seguir (escolha do Samuel); amigos = quem se segue; perfil público legível sem login se não for privado
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/amigos.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | banco e regras | concluído | 2026-11-25 17:22 |
| 2 | lógica e serviço | concluído | 2026-11-25 17:22 |
| 3 | tela e perfil público | concluído | 2026-11-25 17:22 |
| 4 | testes e inglês | concluído | 2026-11-25 17:22 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: resumo público sem resenha e sem datas exatas (só AAAA-MM-DD do recente)
- fato: tests/e2e/ajuda.js ganhou 'brutos' para guardar localStorage cru depois da limpeza
- fato: servidor social simulado em tests/e2e/fakes-amigos.js

### Respostas-chave do usuário
- "poder adicionar amigos pra poder ver os outros amigos"
- "a pode seguir"

### Tentativas que falharam
- abrir() dos testes apagava a sessão simulada (resolvido com 'brutos')
- '1 seguidores' virou '1 seguidor'

### Arquivos tocados
- js/modules/amigos/index.js
- js/modules/amigos/logic.js
- js/modules/amigos/publicar.js
- js/modules/amigos/estilo.css
- js/services/social.js
- js/core/conta.js
- js/modules/perfil/index.js
- js/modules/registry.js
- js/core/icons.js
- js/core/i18n.js
- supabase/migracao.sql
- tests/unit/amigos.test.js
- tests/e2e/amigos.spec.js
- tests/e2e/fakes-amigos.js
- tests/e2e/ajuda.js
- README.md
- relatorio/prompts.md
- docs/TAXONOMY.md

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-25 17:22 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-25 17:13 — [ativação] SPEC criada e ativada (@samuel25z, branch spec/amigos, base main)

## 2026-11-25 17:22 — [conclusão] entregue

Amigos entregue. 2/2 critérios verificados.
⎿ commit 1d97cab+dirty · 10 files changed, 103 insertions(+), 4 deletions(-)
