# SPEC-20261125-1713: amigos

**Status:** done
**Porte:** G
**Owner:** @samuel25z
**Criada:** 2026-11-25 17:13
**Ativada:** 2026-11-25 17:13
**Concluída:** 2026-11-25 17:22
**Pausada em:** —
**Commit final:** `01c208d`
**Keywords:** amigos, social, seguir, perfil-publico, usuario, feed, supabase
**Features:** amigos
**Branch:** spec/amigos
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-25 17:13
**Resumo:** Parte social no modelo "seguir": perfil público com @, busca, seguir/deixar de seguir, amigos (seguem de volta), feed do que os amigos jogam e perfil privado.

## Objetivo

"Fazer as configurações de perfil, certinho e tal, poder adicionar amigos pra poder ver os outros amigos." O Samuel escolheu o modelo seguir ("a pode seguir"): você segue alguém e já vê o perfil; quem se segue vira amigo.

## Escopo

**DENTRO:**
- Tabelas perfis (@ único, nome, frase, foto, banner, privado, resumo) e seguindo, com RLS
- Escolher o @ (sugerido do nome), validação e aviso de @ já usado
- Perfil público por link (#/amigos/@usuario), visível sem login se não for privado
- Buscar por @, seguir/deixar de seguir, listas Seguindo, Seguidores e Amigos, feed "Jogando agora"
- Perfil privado (some da busca e do link para os outros)
- Perfil público atualiza sozinho ao abrir Amigos e ao salvar o Meu perfil
- Inglês, celular, visuais

**FORA:**
- Comentários, curtidas, mensagens e notificações
- Bloquear/denunciar usuários (fica para quando houver muitos usuários)

## Invariantes

- SEMPRE o resumo público não leva resenha nem datas exatas do Diário
- NUNCA alguém segue ou edita em nome de outra pessoa (RLS: seguidor = auth.uid(), dono = auth.uid())
- NUNCA perfil privado aparece para outra pessoa

## Implementação

Ver techspec.md. Serviço js/services/social.js (Supabase), lógica pura em js/modules/amigos/logic.js, publicação em amigos/publicar.js, tela em amigos/index.js reaproveitando a capa do Meu perfil.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| perfis | user_id (pk, fk auth.users), usuario (único, ^[a-z0-9_]{3,20}$), nome, frase, avatar_url, banner_url, privado, resumo jsonb, atualizado_em |
| seguindo | seguidor, seguido (pk composta, fk auth.users, seguidor ≠ seguido), criado_em |

Alternativa rejeitada: pedido de amizade com aceite (o Samuel escolheu seguir: mais simples e sem espera).

## Riscos

- @ ofensivo ou perfil abusivo — mitigação: lista de reservados agora; denúncia fica para uma próxima SPEC
- Imagens grandes no perfil público — mitigação: limites no banco (300 KB foto, 650 KB banner em texto)

## Sinais de sucesso

- O Samuel e um amigo se seguem e cada um vê o que o outro anda jogando

## Critério de aceite

- [x] @, resumo público sem dado sensível, amigos e feed testados (2026-11-25 17:22, commit `01c208d`, verify: exit 0) | verify: `node --test tests/unit/amigos.test.js`
- [x] criar @, buscar, seguir, amigos, feed, perfil público, privado e @ repetido funcionam na tela (2026-11-25 17:22, commit `01c208d`, verify: exit 0) | verify: `npx playwright test tests/e2e/amigos.spec.js`
