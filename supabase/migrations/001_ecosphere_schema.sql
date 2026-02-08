-- EcoSphere: schema para uso com Supabase (substitui backend Express + Firebase)

-- Tabela de perfis (estende auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  avatar_url text,
  eco_points int default 0 check (eco_points >= 0),
  level text default 'Iniciante',
  badges jsonb default '[]'::jsonb,
  streak jsonb default '{"current":0,"longest":0}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Classificações de resíduos
create table if not exists public.waste_classifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  confidence float not null,
  points int not null,
  created_at timestamptz default now()
);

create index if not exists waste_classifications_user_id_idx on public.waste_classifications(user_id);
create index if not exists waste_classifications_created_at_idx on public.waste_classifications(created_at desc);

-- Ações de jogo (quiz, eco_catcher, etc.)
create table if not exists public.user_game_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_type text not null,
  points int not null,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists user_game_actions_user_id_idx on public.user_game_actions(user_id);

-- RLS: profiles
alter table public.profiles enable row level security;

create policy "Leitura de perfis (próprio e ranking)"
  on public.profiles for select
  using (true);

create policy "Usuários podem inserir próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Usuários podem atualizar próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS: waste_classifications
alter table public.waste_classifications enable row level security;

create policy "Usuário vê apenas suas classificações"
  on public.waste_classifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS: user_game_actions
alter table public.user_game_actions enable row level security;

create policy "Usuário vê apenas suas ações de jogo"
  on public.user_game_actions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger: criar profile ao criar usuário (sign up)
-- search_path = '' evita problemas de contexto e RLS (recomendação Supabase)
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
  for each row execute function public.handle_new_user();

-- Atualizar updated_at em profiles
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
