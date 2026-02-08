-- Corrige a função handle_new_user (search_path + tratamento de erro).
-- Rode este SQL no Supabase se o registro de usuário falhar após ter aplicado 001.

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
