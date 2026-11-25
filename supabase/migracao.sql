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

-- Projetos novos do Supabase não liberam tabelas para a API sozinhos: libera só para quem está logado.
-- (As regras acima continuam valendo: cada um só mexe nas próprias linhas.)
grant select, insert, update, delete on public.checkpoint_dados to authenticated;

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


-- ============================================================
-- Parte social: perfil público com @ e "seguir" (modelo Instagram/Backloggd).
-- Rode de novo o arquivo inteiro: tudo aqui pode ser executado mais de uma vez.
-- ============================================================

create table if not exists public.perfis (
  user_id uuid primary key references auth.users (id) on delete cascade,
  usuario text not null unique check (usuario ~ '^[a-z0-9_]{3,20}$'),
  nome text not null default '' check (char_length(nome) <= 40),
  frase text not null default '' check (char_length(frase) <= 140),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 300000),
  banner_url text check (banner_url is null or char_length(banner_url) <= 650000),
  privado boolean not null default false,
  resumo jsonb not null default '{}'::jsonb check (pg_column_size(resumo) < 262144),
  atualizado_em timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- Perfil público: qualquer um vê (é o link que a pessoa compartilha). Privado: só o dono.
drop policy if exists "ver perfis públicos" on public.perfis;
create policy "ver perfis públicos" on public.perfis
  for select to anon, authenticated using (privado = false or (select auth.uid()) = user_id);

drop policy if exists "criar o próprio perfil" on public.perfis;
create policy "criar o próprio perfil" on public.perfis
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "editar o próprio perfil" on public.perfis;
create policy "editar o próprio perfil" on public.perfis
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "apagar o próprio perfil" on public.perfis;
create policy "apagar o próprio perfil" on public.perfis
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select on public.perfis to anon;
grant select, insert, update, delete on public.perfis to authenticated;

create table if not exists public.seguindo (
  seguidor uuid not null references auth.users (id) on delete cascade,
  seguido uuid not null references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (seguidor, seguido),
  check (seguidor <> seguido)
);
create index if not exists seguindo_seguido on public.seguindo (seguido);

alter table public.seguindo enable row level security;

-- Quem segue quem é visível para quem está logado (como no Instagram), para mostrar seguidores e amigos.
drop policy if exists "ver quem segue quem" on public.seguindo;
create policy "ver quem segue quem" on public.seguindo
  for select to authenticated using (true);

-- Só dá para seguir/deixar de seguir em nome de si mesmo.
drop policy if exists "seguir em meu nome" on public.seguindo;
create policy "seguir em meu nome" on public.seguindo
  for insert to authenticated with check ((select auth.uid()) = seguidor);

drop policy if exists "deixar de seguir em meu nome" on public.seguindo;
create policy "deixar de seguir em meu nome" on public.seguindo
  for delete to authenticated using ((select auth.uid()) = seguidor);

revoke all on public.seguindo from anon;
grant select, insert, delete on public.seguindo to authenticated;
