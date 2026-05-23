-- GameDealCentral Supabase schema.
-- Run in the Supabase SQL Editor for a fresh project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_len check (username is null or char_length(username) <= 20)
);

create table if not exists public.monitored_games (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  deal_id text not null,
  game_id text not null,
  title text not null,
  image_url text,
  original_price numeric(10,2),
  discounted_price numeric(10,2),
  discount_percentage integer,
  store text,
  store_icon text,
  platform text default 'PC',
  url text,
  metacritic_score text,
  steam_rating_percent text,
  steam_rating_text text,
  steam_rating_count text,
  release_date integer,
  deal_rating text,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monitored_games_user_deal_unique unique (user_id, deal_id)
);

create index if not exists monitored_games_user_id_idx
  on public.monitored_games(user_id);

create index if not exists monitored_games_added_at_idx
  on public.monitored_games(user_id, added_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists monitored_games_set_updated_at on public.monitored_games;
create trigger monitored_games_set_updated_at
before update on public.monitored_games
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'user_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.monitored_games enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "monitored_games_select_own" on public.monitored_games;
create policy "monitored_games_select_own"
on public.monitored_games for select
using (auth.uid() = user_id);

drop policy if exists "monitored_games_insert_own" on public.monitored_games;
create policy "monitored_games_insert_own"
on public.monitored_games for insert
with check (auth.uid() = user_id);

drop policy if exists "monitored_games_update_own" on public.monitored_games;
create policy "monitored_games_update_own"
on public.monitored_games for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "monitored_games_delete_own" on public.monitored_games;
create policy "monitored_games_delete_own"
on public.monitored_games for delete
using (auth.uid() = user_id);
