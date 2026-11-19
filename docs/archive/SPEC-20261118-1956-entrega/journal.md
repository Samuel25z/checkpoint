# Journal — SPEC-20261118-1956

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-18 21:04
**Onde tô:** entrega pronta: site no GitHub Pages conferido no ar, README com link e receita de aba nova, relatório .docx com 10 capturas e Apêndice A (12 prompts), slides .pptx com notas
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** relatório e slides em arquivo (Word/PowerPoint) porque vão para o ambiente da faculdade; Cloudflare fica para o Samuel ligar
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/entrega.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | README e scripts de checagem | concluído | 2026-11-18 21:04 |
| 2 | capturas automáticas | concluído | 2026-11-18 21:04 |
| 3 | relatório .docx | concluído | 2026-11-18 21:04 |
| 4 | slides .pptx | concluído | 2026-11-18 21:04 |
| 5 | publicação conferida | concluído | 2026-11-18 21:04 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: sem Word/LibreOffice neste PC: relatório e slides validados por estrutura e texto, não por imagem
- fato: Pages publica de main em ~40 s

### Respostas-chave do usuário
- "Sobre a questão do vídeo, a gente vai usar a nossa ferramenta de edição de vídeo" — vídeo fora desta SPEC

### Tentativas que falharam
- merge da entrega em main com a SPEC ainda ativa; reset bloqueado pela segurança; resolvido fechando a SPEC em main

### Arquivos tocados
- README.md
- scripts/{check-publicado,check-readme,check-entregaveis,capturas}.mjs
- relatorio/{Relatorio-Checkpoint.docx,Apresentacao-Checkpoint.pptx,prompts.md,capturas/}

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-18 21:04 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-18 20:51 — [ativação] SPEC ativada (branch spec/entrega, base main)

## 2026-11-18 21:04 — [nota] verify: 3/3 critérios passaram (commit `f92826e`)

- PASS: O site publicado no GitHub Pages responde e contém a versão…
- PASS: README tem link ativo, instruções e receita de nova aba | v…
- PASS: Relatório .docx e slides gerados com Apêndice A de pelo men…

## 2026-11-18 21:04 — [conclusão] entregue

Entrega concluída: 3/3 critérios verificados (site no ar, README, relatório+slides com 12 prompts).
⎿ commit f92826e+dirty · 2 files changed, 28 insertions(+), 13 deletions(-)
