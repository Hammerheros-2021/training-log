-- Keel S&C: exercise library with videos, programmes, assigning them to players, and players logging sessions.
-- Run AFTER teams.sql. Supabase: SQL Editor > New query > paste all of this > Run. Safe to run again; never deletes data.
--
-- Who sees what
-- - Staff of a team (anyone who joined with the staff code) build the team's exercise library and programmes,
--   assign programmes to players, and set a load % per player.
-- - A player only sees the programme assigned to them and the exercises (and videos) in it.
-- - When a player logs a session, staff of that team can see it.
-- - Videos are stored privately in Supabase Storage (bucket keel-videos), in a folder per team.

-- exercise library (one per team)
create table if not exists public.sc_exercises (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  name text not null check (length(name) between 1 and 80),
  category text not null default 'strength'
    check (category in ('strength','power','speed','conditioning','mobility','prehab','recovery','core')),
  equipment text,
  cues text,
  video_path text,
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists sc_exercises_team on public.sc_exercises (team_id, name);
alter table public.sc_exercises enable row level security;

-- programmes: plan = {"weeks":[{"days":[{"dow":1,"title":"Lower body","kind":"strength","min":50,"rpe":7,
--   "items":[{"ex":"<exercise id>","sets":3,"reps":"5","load":"75% / RPE 7","rest":"2 min","note":""}]}]}]}
create table if not exists public.sc_programmes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  name text not null check (length(name) between 1 and 100),
  goal text,
  plan jsonb not null default '{"weeks":[]}'::jsonb,
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.sc_programmes enable row level security;

-- who is on which programme, from when, and at what load
create table if not exists public.sc_assignments (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  programme_id uuid not null references public.sc_programmes on delete cascade,
  player_id uuid not null references auth.users on delete cascade,
  start_day text not null,
  load_pct int not null default 100 check (load_pct between 40 and 130),
  note text,
  active boolean not null default true,
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sc_assign_player on public.sc_assignments (player_id, active);
create index if not exists sc_assign_team on public.sc_assignments (team_id, active);
alter table public.sc_assignments enable row level security;

-- sessions players logged from a programme
create table if not exists public.sc_logs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.sc_assignments on delete cascade,
  team_id uuid not null references public.teams on delete cascade,
  player_id uuid not null references auth.users on delete cascade default auth.uid(),
  day text not null,
  week int not null,
  dow int not null,
  title text,
  done boolean not null default true,
  dur int,
  rpe int check (rpe between 1 and 10),
  sets jsonb,
  note text,
  created_at timestamptz not null default now(),
  unique (assignment_id, week, dow)
);
create index if not exists sc_logs_team on public.sc_logs (team_id, day);
alter table public.sc_logs enable row level security;

-- is this player on a live programme of this team that uses this exercise / programme?
create or replace function public.keel_sc_player_prog(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from sc_assignments a where a.programme_id = p and a.player_id = auth.uid() and a.active);
$$;
create or replace function public.keel_sc_player_ex(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from sc_assignments a where a.team_id = t and a.player_id = auth.uid() and a.active);
$$;

-- library: staff read and write; players on a live programme of the team can read
drop policy if exists "sc ex read" on public.sc_exercises;
create policy "sc ex read" on public.sc_exercises for select using (public.keel_is_coach(team_id) or public.keel_sc_player_ex(team_id));
drop policy if exists "sc ex write" on public.sc_exercises;
create policy "sc ex write" on public.sc_exercises for insert with check (public.keel_is_coach(team_id));
drop policy if exists "sc ex update" on public.sc_exercises;
create policy "sc ex update" on public.sc_exercises for update using (public.keel_is_coach(team_id)) with check (public.keel_is_coach(team_id));
drop policy if exists "sc ex delete" on public.sc_exercises;
create policy "sc ex delete" on public.sc_exercises for delete using (public.keel_is_coach(team_id));

drop policy if exists "sc prog read" on public.sc_programmes;
create policy "sc prog read" on public.sc_programmes for select using (public.keel_is_coach(team_id) or public.keel_sc_player_prog(id));
drop policy if exists "sc prog write" on public.sc_programmes;
create policy "sc prog write" on public.sc_programmes for insert with check (public.keel_is_coach(team_id));
drop policy if exists "sc prog update" on public.sc_programmes;
create policy "sc prog update" on public.sc_programmes for update using (public.keel_is_coach(team_id)) with check (public.keel_is_coach(team_id));
drop policy if exists "sc prog delete" on public.sc_programmes;
create policy "sc prog delete" on public.sc_programmes for delete using (public.keel_is_coach(team_id));

-- assignments: staff manage them for players in their team; players read their own
drop policy if exists "sc assign read" on public.sc_assignments;
create policy "sc assign read" on public.sc_assignments for select using (player_id = auth.uid() or public.keel_is_coach(team_id));
drop policy if exists "sc assign write" on public.sc_assignments;
create policy "sc assign write" on public.sc_assignments for insert with check (public.keel_is_coach(team_id)
  and exists (select 1 from team_members m where m.team_id = sc_assignments.team_id and m.user_id = sc_assignments.player_id and m.role = 'member')
  and exists (select 1 from sc_programmes p where p.id = sc_assignments.programme_id and p.team_id = sc_assignments.team_id));
drop policy if exists "sc assign update" on public.sc_assignments;
create policy "sc assign update" on public.sc_assignments for update using (public.keel_is_coach(team_id)) with check (public.keel_is_coach(team_id));
drop policy if exists "sc assign delete" on public.sc_assignments;
create policy "sc assign delete" on public.sc_assignments for delete using (public.keel_is_coach(team_id));

-- logs: players write and read their own; staff of the team read them, but only while the player shares
drop policy if exists "sc log read" on public.sc_logs;
create policy "sc log read" on public.sc_logs for select using (player_id = auth.uid() or (public.keel_is_coach(team_id)
  and exists (select 1 from team_members m where m.team_id = sc_logs.team_id and m.user_id = sc_logs.player_id and m.share)));
drop policy if exists "sc log write" on public.sc_logs;
create policy "sc log write" on public.sc_logs for insert with check (player_id = auth.uid()
  and exists (select 1 from sc_assignments a where a.id = sc_logs.assignment_id and a.player_id = auth.uid() and a.team_id = sc_logs.team_id));
drop policy if exists "sc log update" on public.sc_logs;
create policy "sc log update" on public.sc_logs for update using (player_id = auth.uid()) with check (player_id = auth.uid());
drop policy if exists "sc log delete" on public.sc_logs;
create policy "sc log delete" on public.sc_logs for delete using (player_id = auth.uid());

revoke all on public.sc_exercises, public.sc_programmes, public.sc_assignments, public.sc_logs from anon;
grant select, insert, update, delete on public.sc_exercises, public.sc_programmes, public.sc_assignments, public.sc_logs to authenticated;

-- what a player gets: their live programmes, with the exercises in them
create or replace function public.keel_my_programmes()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'assignment', a.id, 'team_id', a.team_id, 'team', t.name, 'start', a.start_day, 'load', a.load_pct, 'note', a.note,
    'programme', jsonb_build_object('id', p.id, 'name', p.name, 'goal', p.goal, 'plan', p.plan),
    'exercises', (select coalesce(jsonb_agg(jsonb_build_object('id', e.id, 'name', e.name, 'category', e.category,
                    'equipment', e.equipment, 'cues', e.cues, 'video', e.video_path)), '[]'::jsonb)
                  from sc_exercises e where e.team_id = a.team_id
                    and p.plan::text like '%' || e.id::text || '%'),
    'logs', (select coalesce(jsonb_agg(jsonb_build_object('week', l.week, 'dow', l.dow, 'day', l.day, 'done', l.done, 'rpe', l.rpe, 'dur', l.dur)), '[]'::jsonb)
             from sc_logs l where l.assignment_id = a.id))), '[]'::jsonb)
  from sc_assignments a join sc_programmes p on p.id = a.programme_id join teams t on t.id = a.team_id
  where a.player_id = auth.uid() and a.active
    and exists (select 1 from team_members m where m.team_id = a.team_id and m.user_id = auth.uid());
$$;
revoke execute on function public.keel_my_programmes() from public, anon;
grant execute on function public.keel_my_programmes(), public.keel_sc_player_prog(uuid), public.keel_sc_player_ex(uuid) to authenticated;

-- private video storage: one folder per team ("<team id>/<file>")
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('keel-videos', 'keel-videos', false, 52428800, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "keel videos read" on storage.objects;
create policy "keel videos read" on storage.objects for select to authenticated using (
  bucket_id = 'keel-videos' and (public.keel_is_coach(((storage.foldername(name))[1])::uuid)
    or public.keel_sc_player_ex(((storage.foldername(name))[1])::uuid)));
drop policy if exists "keel videos upload" on storage.objects;
create policy "keel videos upload" on storage.objects for insert to authenticated with check (
  bucket_id = 'keel-videos' and public.keel_is_coach(((storage.foldername(name))[1])::uuid));
drop policy if exists "keel videos delete" on storage.objects;
create policy "keel videos delete" on storage.objects for delete to authenticated using (
  bucket_id = 'keel-videos' and public.keel_is_coach(((storage.foldername(name))[1])::uuid));
