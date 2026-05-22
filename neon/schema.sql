create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  avatar_url text,
  eco_points int not null default 0 check (eco_points >= 0),
  level text not null default 'Iniciante',
  badges jsonb not null default '[]'::jsonb,
  streak jsonb not null default '{"current":0,"longest":0}'::jsonb,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists waste_classifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null,
  confidence float not null,
  points int not null,
  created_at timestamptz not null default now()
);

create index if not exists waste_classifications_user_id_idx on waste_classifications(user_id);
create index if not exists waste_classifications_created_at_idx on waste_classifications(created_at desc);

create table if not exists user_game_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  game_type text not null,
  points int not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_game_actions_user_id_idx on user_game_actions(user_id);
