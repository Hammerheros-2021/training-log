-- Keel: staff testing (Nov 2026). Run once in Supabase > SQL Editor. Safe to run again. Never deletes data.
-- Fitness tests recorded by staff for each player, with a date: strength (estimated 1RM), speed (10 m / 20 m sprint),
-- power (countermovement jump) and conditioning (Yo-Yo IR1, 5 km). Staff on the team can read and write them.
-- A player can read their own results.
create table if not exists public.team_tests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  player_id uuid not null references auth.users on delete cascade,
  test text not null check (length(test) between 1 and 40),
  value numeric not null,
  raw text check (raw is null or length(raw) <= 40),
  day text not null check (day ~ '^\d{4}-\d{2}-\d{2}$'),
  note text check (note is null or length(note) <= 300),
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists team_tests_team on public.team_tests (team_id, test, day);
create index if not exists team_tests_player on public.team_tests (player_id, test, day);
alter table public.team_tests enable row level security;
drop policy if exists "tests read" on public.team_tests;
create policy "tests read" on public.team_tests for select using (public.keel_is_coach(team_id) or player_id = auth.uid());
drop policy if exists "tests write" on public.team_tests;
create policy "tests write" on public.team_tests for insert with check (public.keel_is_coach(team_id));
drop policy if exists "tests update" on public.team_tests;
create policy "tests update" on public.team_tests for update using (public.keel_is_coach(team_id)) with check (public.keel_is_coach(team_id));
drop policy if exists "tests delete" on public.team_tests;
create policy "tests delete" on public.team_tests for delete using (public.keel_is_coach(team_id));
grant select, insert, update, delete on public.team_tests to authenticated;
