# Feature: conta

**Keywords:** conta, login, supabase, sincronizacao, rls, remocoes
**Arquivos principais:**
  - js/core/conta.js
  - js/core/sync.js
  - supabase/migracao.sql
  - js/config.js
**Resumo:** Login Google via Supabase e sincronização item a item com marcas de remoção; site funciona sem login e limpa o navegador ao sair.

## Specs desta feature
### Concluídas
- SPEC-20261118-2106-revisao-final | 2026-11-18 | `98d751a` | Correções da revisão cética
### Planejadas (future/)

## Estado atual
Sincroniza: diario:jogos, diario:atividades, speedrun:rotas, torneio:lista, hardware:pcs, recomps:seguidos, recomendador:respostas e sync:removidos. Listas mesclam por id (atualizadoEm) sempre; exclusões viram marcas em sync:removidos; demais chaves: primeiro login junta, depois vence a mais recente. Sair envia pendências e limpa as chaves sincronizáveis do navegador. Configuração em js/config.js (vazia = sem login). SPEC conta-sync segue pausada aguardando a conta real do Samuel.

## Decisões arquiteturais ativas
- DEC-20261118-2110-sync-por-item-com-remocoes [ativa] (SPEC-20261118-2106-revisao-final) — mescla por id em toda sincronização + marcas de remoção sincronizadas; relógio adiantado só afeta edição do MESMO item
- DEC-20261118-2110-sair-limpa-navegador [ativa] (SPEC-20261118-2106-revisao-final) — ao sair, dados sincronizáveis saem do navegador (PC compartilhado da faculdade)

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-2106-revisao-final | login de outra pessoa no mesmo navegador (2026-11-18 21:10) — nunca mesclar dados locais de um usuário anterior; sair limpa o navegador
