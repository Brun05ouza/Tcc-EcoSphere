-- =============================================================================
-- EcoSphere — setup completo do Supabase (schema + RLS + triggers + storage)
-- =============================================================================
-- Use em um projeto NOVO no Supabase: SQL Editor → New query → colar e executar.
--
-- O frontend (`supabaseService.js`) usa:
--   • public.profiles (com is_admin, avatar_url, eco_points, badges, streak…)
--   • public.waste_classifications
--   • public.user_game_actions
--   • storage bucket `avatars` (upload de foto de perfil)
--
-- Após rodar:
--   1. Authentication → Providers: habilite Email (e Google, se usar).
--   2. Defina o primeiro admin: Table Editor → profiles → seu usuário → is_admin = true
--      ou: update public.profiles set is_admin = true where email = 'seu@email.com';
--   3. Copie URL + anon key para REACT_APP_SUPABASE_* no frontend.
--
-- Nota: adminDeleteUser() no app remove só a linha em `profiles`; o usuário em
-- auth.users continua até você removê-lo no Dashboard ou via Admin API/service role.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  eco_points int default 0 check (eco_points >= 0),
  level text default 'Iniciante',
  badges jsonb default '[]'::jsonb,
  streak jsonb default '{"current":0,"longest":0}'::jsonb,
  is_admin boolean default false not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.waste_classifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  confidence double precision not null,
  points int not null,
  created_at timestamptz default now()
);

create index if not exists waste_classifications_user_id_idx
  on public.waste_classifications (user_id);

create index if not exists waste_classifications_created_at_idx
  on public.waste_classifications (created_at desc);

create table if not exists public.user_game_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  game_type text not null,
  points int not null,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists user_game_actions_user_id_idx
  on public.user_game_actions (user_id);

-- Garante coluna is_admin em bases que já tinham 001 sem 003
alter table public.profiles
  add column if not exists is_admin boolean default false not null;

comment on column public.profiles.is_admin is
  'Administrador da plataforma (painel admin no frontend).';

-- -----------------------------------------------------------------------------
-- Funções
-- -----------------------------------------------------------------------------

-- Cria perfil ao registrar usuário (sign up / OAuth)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), '')
  );
  return new;
exception
  when others then
    raise warning 'handle_new_user: %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- updated_at automático em profiles
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Impede usuário comum de alterar is_admin no próprio perfil (só admin ou service role)
create or replace function public.profiles_guard_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_is_admin boolean;
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  if new.is_admin is not distinct from old.is_admin then
    return new;
  end if;

  if auth.uid() is null then
    return new;
  end if;

  select coalesce(p.is_admin, false)
    into caller_is_admin
  from public.profiles p
  where p.id = auth.uid();

  if coalesce(caller_is_admin, false) then
    return new;
  end if;

  new.is_admin := old.is_admin;
  return new;
end;
$$;

drop trigger if exists profiles_guard_is_admin_trg on public.profiles;
create trigger profiles_guard_is_admin_trg
  before update on public.profiles
  for each row
  execute function public.profiles_guard_is_admin();

-- -----------------------------------------------------------------------------
-- RLS — profiles
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "Leitura de perfis (próprio e ranking)" on public.profiles;
create policy "Leitura de perfis (próprio e ranking)"
  on public.profiles for select
  using (true);

drop policy if exists "Usuários podem inserir próprio perfil" on public.profiles;
create policy "Usuários podem inserir próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Usuários podem atualizar próprio perfil" on public.profiles;
create policy "Usuários podem atualizar próprio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins atualizam qualquer perfil" on public.profiles;
create policy "Admins atualizam qualquer perfil"
  on public.profiles for update
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.is_admin, false)
    )
  )
  with check (true);

drop policy if exists "Admins excluem perfis" on public.profiles;
create policy "Admins excluem perfis"
  on public.profiles for delete
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.is_admin, false)
    )
  );

-- -----------------------------------------------------------------------------
-- RLS — waste_classifications
-- -----------------------------------------------------------------------------

alter table public.waste_classifications enable row level security;

drop policy if exists "Usuário vê apenas suas classificações" on public.waste_classifications;
create policy "Usuário vê apenas suas classificações"
  on public.waste_classifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins leem todas as classificações" on public.waste_classifications;
create policy "Admins leem todas as classificações"
  on public.waste_classifications for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.is_admin, false)
    )
  );

-- -----------------------------------------------------------------------------
-- RLS — user_game_actions
-- -----------------------------------------------------------------------------

alter table public.user_game_actions enable row level security;

drop policy if exists "Usuário vê apenas suas ações de jogo" on public.user_game_actions;
create policy "Usuário vê apenas suas ações de jogo"
  on public.user_game_actions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins leem todas as ações de jogo" on public.user_game_actions;
create policy "Admins leem todas as ações de jogo"
  on public.user_game_actions for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and coalesce(p.is_admin, false)
    )
  );

-- -----------------------------------------------------------------------------
-- Storage — bucket avatars (foto de perfil)
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Não use ALTER TABLE em storage.objects: o dono é o serviço interno de Storage e o SQL Editor
-- retorna 42501 "must be owner of table objects". O RLS em storage.objects já vem ativo no Supabase.

drop policy if exists "Avatars leitura pública" on storage.objects;
create policy "Avatars leitura pública"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Avatars upload usuário autenticado" on storage.objects;
create policy "Avatars upload usuário autenticado"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and name like (auth.uid()::text || '-%')
  );

drop policy if exists "Avatars update próprio arquivo" on storage.objects;
create policy "Avatars update próprio arquivo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and name like (auth.uid()::text || '-%')
  )
  with check (
    bucket_id = 'avatars'
    and name like (auth.uid()::text || '-%')
  );

drop policy if exists "Avatars delete próprio arquivo" on storage.objects;
create policy "Avatars delete próprio arquivo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and name like (auth.uid()::text || '-%')
  );

-- =============================================================================
-- Fim — EcoSphere completo
-- =============================================================================
