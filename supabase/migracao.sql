-- Checkpoint — banco da conta (Supabase / Postgres)
-- Rode uma vez no SQL Editor do projeto Supabase.
-- Cada linha guarda um "pacote" de dados do usuário (ex.: diario:jogos) como JSON.

create table if not exists public.checkpoint_dados (
  user_id uuid not null references auth.users (id) on delete cascade,
  chave text not null check (chave in (
    'diario:jogos', 'diario:atividades', 'speedrun:rotas', 'torneio:lista',
    'hardware:pcs', 'recomps:seguidos', 'recomendador:respostas', 'perfil:dados', 'perfil:imagens', 'sync:removidos'
  )),
  valor jsonb not null,
  atualizado_em timestamptz not null default now(),
  primary key (user_id, chave),
  constraint tamanho_maximo check (pg_column_size(valor) < 1048576)
);

-- Segurança: cada usuário só enxerga e altera as próprias linhas.
alter table public.checkpoint_dados enable row level security;

drop policy if exists "ler os próprios dados" on public.checkpoint_dados;
create policy "ler os próprios dados" on public.checkpoint_dados
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "criar os próprios dados" on public.checkpoint_dados;
create policy "criar os próprios dados" on public.checkpoint_dados
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "atualizar os próprios dados" on public.checkpoint_dados;
create policy "atualizar os próprios dados" on public.checkpoint_dados
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "apagar os próprios dados" on public.checkpoint_dados;
create policy "apagar os próprios dados" on public.checkpoint_dados
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Visitantes sem login não têm acesso nenhum.
revoke all on public.checkpoint_dados from anon;

-- Quem já tinha rodado a versão antiga: atualiza a lista de dados aceitos (inclui o perfil).
alter table public.checkpoint_dados drop constraint if exists checkpoint_dados_chave_check;
alter table public.checkpoint_dados add constraint checkpoint_dados_chave_check check (chave in (
  'diario:jogos', 'diario:atividades', 'speedrun:rotas', 'torneio:lista',
  'hardware:pcs', 'recomps:seguidos', 'recomendador:respostas', 'perfil:dados', 'perfil:imagens', 'sync:removidos'
));

-- Direito de apagar tudo (LGPD): o usuário logado apaga a PRÓPRIA conta.
-- security definer porque o navegador não pode mexer em auth.users; a função só aceita auth.uid(),
-- então ninguém apaga a conta de outra pessoa. Os dados saem junto (on delete cascade).
create or replace function public.apagar_minha_conta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'precisa estar logado';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.apagar_minha_conta() from public, anon;
grant execute on function public.apagar_minha_conta() to authenticated;

