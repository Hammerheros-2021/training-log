-- Keel Staff: GPS (STATSports and other trackers). Run once in Supabase > SQL Editor, after teams.sql. Safe to run again.
-- Staff upload GPS exports on the dashboard. Each row is one player's session: the headline numbers
-- (distance, high-speed running, sprints, accelerations, top speed...), a heat map grid of where they were
-- on the pitch, and their sprints as short lines. Raw 10 Hz traces are boiled down in the browser and not stored.
-- Only the team's staff can read or change these rows.

create table if not exists public.team_gps (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  player_id uuid not null,
  day date not null,
  session text not null default 'Session',
  kind text not null default 'training',          -- training | match | other
  metrics jsonb not null default '{}'::jsonb,     -- {dist,hsr,sprint,acc,dec,vmax,dur,dsl,hmld,hr,mpm}
  heat jsonb,                                     -- {w,h,all:[...],hsr:[...]} counts on a 5 m grid of a 145 x 90 m pitch
  sprints jsonb,                                  -- [[x1,y1,x2,y2,kmh], ...] in pitch metres
  source text,                                    -- 'statsports-summary' | 'trace' | 'manual'
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists team_gps_team_day on public.team_gps (team_id, day);
create index if not exists team_gps_player on public.team_gps (team_id, player_id, day);
create unique index if not exists team_gps_one on public.team_gps (team_id, player_id, day, session);

alter table public.team_gps enable row level security;
drop policy if exists "gps read" on public.team_gps;
drop policy if exists "gps write" on public.team_gps;
drop policy if exists "gps update" on public.team_gps;
drop policy if exists "gps delete" on public.team_gps;
create policy "gps read" on public.team_gps for select using (public.keel_is_coach(team_id));
create policy "gps write" on public.team_gps for insert with check (public.keel_is_coach(team_id));
create policy "gps update" on public.team_gps for update using (public.keel_is_coach(team_id)) with check (public.keel_is_coach(team_id));
create policy "gps delete" on public.team_gps for delete using (public.keel_is_coach(team_id));
grant select, insert, update, delete on public.team_gps to authenticated;
