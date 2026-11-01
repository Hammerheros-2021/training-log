-- Run this once in Supabase: SQL Editor > New query > paste > Run.

-- Each person's sign-up answers, plan and nutrition targets.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "people manage their own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Every check-in (kind 'day'), session log ('log') and setting/kitchen/meal plan ('meta').
create table if not exists public.entries (
  user_id uuid not null references auth.users on delete cascade,
  kind text not null check (kind in ('day','log','meta')),
  key text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, kind, key)
);
alter table public.entries enable row level security;
create policy "people manage their own entries" on public.entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Who can read everyone's feedback. Add yourself after you sign up (see the README).
create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade
);
alter table public.admins enable row level security;
create policy "people can see if they are an admin" on public.admins
  for select using (auth.uid() = user_id);

-- Tester feedback: anyone signed in can send it; only admins can read all of it.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text,
  tab text,
  text text not null,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
create policy "people send their own feedback" on public.feedback
  for insert with check (auth.uid() = user_id);
create policy "people read their own feedback, admins read all" on public.feedback
  for select using (auth.uid() = user_id or exists (select 1 from public.admins a where a.user_id = auth.uid()));
