# Feature: amigos

**Keywords:** amigos, social, seguir, perfil-publico, usuario, feed, supabase
**Arquivos principais:**
  - js/modules/amigos/index.js
  - js/modules/amigos/logic.js
  - js/services/social.js
**Resumo:** Parte social: perfil público com @, seguir, amigos, feed e perfil privado, sobre o Supabase com RLS.

## Specs desta feature
### Concluídas
- SPEC-20261125-1713-amigos | 2026-11-25 | `1d97cab` | Amigos: perfil público e seguir
### Planejadas (future/)

## Estado atual
Rotas #/amigos e #/amigos/@usuario. Tabelas perfis e seguindo (migracao.sql, idempotente). O perfil público se atualiza ao abrir Amigos e ao salvar o Meu perfil. O Samuel precisa rodar o migracao.sql de novo no Supabase para criar as tabelas.

## Decisões arquiteturais ativas
- DEC-20261125-1722-amigos-modelo-seguir [ativa] (SPEC-20261125-1713-amigos) — seguir em vez de pedido de amizade
- DEC-20261125-1722-amigos-perfil-publico-anon [ativa] (SPEC-20261125-1713-amigos) — perfil público visível sem login (link compartilhável); privado só para o dono

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261125-1713-amigos | sessão nos testes (2026-11-25 17:22) — dados fora do prefixo checkpoint: vão em 'brutos' no abrir()
