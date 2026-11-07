-- Keel rehab: the team's physio builds a staged return-to-play plan for an injured player and sends it to their app.
-- Run AFTER teams.sql and sc.sql. Supabase: SQL Editor > New query > paste all of this > Run. Safe to run again; never deletes data.
--
-- Who sees what
-- - Staff of a team create and update rehab plans for players in that team, and see the player's rehab logs.
-- - A player sees only their own active plans, with the exercise videos, and logs each day (done, pain, note).

create table if not exists public.rehab_plans (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  player_id uuid not null references auth.users on delete cascade,
  area text not null check (length(area) between 1 and 60),
  side text,
  injured_on text,
  target_day text,
  -- [{"name":"Protect","goal":"...","criteria":"...","items":[{"ex":"<sc exercise id>","name":"...","sets":3,"reps":"10","freq":"Daily","note":""}]}]
  stages jsonb not null default '[]'::jsonb,
  stage int not null default 0,
  pain_rule text,
  note text,
  status text not null default 'active' check (status in ('active','cleared')),
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_by_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rehab_plans_team on public.rehab_plans (team_id, status);
create index if not exists rehab_plans_player on public.rehab_plans (player_id, status);
alter table public.rehab_plans enable row level security;

create table if not exists public.rehab_logs (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.rehab_plans on delete cascade,
  team_id uuid not null references public.teams on delete cascade,
  player_id uuid not null references auth.users on delete cascade default auth.uid(),
  day text not null,
  stage int not null default 0,
  done boolean not null default true,
  pain int check (pain between 0 and 10),
  note text,
  created_at timestamptz not null default now(),
  unique (plan_id, day)
);
alter table public.rehab_logs enable row level security;

drop policy if exists "rehab read" on public.rehab_plans;
create policy "rehab read" on public.rehab_plans for select using (player_id = auth.uid() or public.keel_is_coach(team_id));
drop policy if exists "rehab write" on public.rehab_plans;
create policy "rehab write" on public.rehab_plans for insert with check (public.keel_is_coach(team_id) and public.keel_is_member_of(team_id, player_id));
drop policy if exists "rehab update" on public.rehab_plans;
create policy "rehab update" on public.rehab_plans for update using (public.keel_is_coach(team_id)) with check (public.keel_is_coach(team_id) and public.keel_is_member_of(team_id, player_id));
drop policy if exists "rehab delete" on public.rehab_plans;
create policy "rehab delete" on public.rehab_plans for delete using (public.keel_is_coach(team_id));

drop policy if exists "rehab log read" on public.rehab_logs;
create policy "rehab log read" on public.rehab_logs for select using (player_id = auth.uid() or public.keel_is_coach(team_id));
drop policy if exists "rehab log write" on public.rehab_logs;
create policy "rehab log write" on public.rehab_logs for insert with check (player_id = auth.uid()
  and exists (select 1 from rehab_plans r where r.id = rehab_logs.plan_id and r.player_id = auth.uid() and r.team_id = rehab_logs.team_id));
drop policy if exists "rehab log update" on public.rehab_logs;
create policy "rehab log update" on public.rehab_logs for update using (player_id = auth.uid()) with check (player_id = auth.uid());

revoke all on public.rehab_plans, public.rehab_logs from anon;
grant select, insert, update, delete on public.rehab_plans, public.rehab_logs to authenticated;

-- for the player: their active rehab plans with the exercises (and videos) used, and their logs
create or replace function public.keel_my_rehab()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', r.id, 'team_id', r.team_id, 'team', t.name, 'area', r.area, 'side', r.side, 'injured_on', r.injured_on,
    'target_day', r.target_day, 'stages', r.stages, 'stage', r.stage, 'pain_rule', r.pain_rule, 'note', r.note,
    'by', r.created_by_name, 'updated_at', r.updated_at,
    'exercises', (select coalesce(jsonb_agg(jsonb_build_object('id', e.id, 'name', e.name, 'cues', e.cues, 'video', e.video_path, 'equipment', e.equipment)), '[]'::jsonb)
                  from sc_exercises e where e.team_id = r.team_id and r.stages::text like '%' || e.id::text || '%'),
    'logs', (select coalesce(jsonb_agg(jsonb_build_object('day', l.day, 'stage', l.stage, 'done', l.done, 'pain', l.pain) order by l.day desc), '[]'::jsonb)
             from rehab_logs l where l.plan_id = r.id))), '[]'::jsonb)
  from rehab_plans r join teams t on t.id = r.team_id
  where r.player_id = auth.uid() and r.status = 'active' and keel_in_team(r.team_id);
$$;
revoke execute on function public.keel_my_rehab() from public, anon;
grant execute on function public.keel_my_rehab() to authenticated;

-- players in rehab can watch the videos for their exercises too
create or replace function public.keel_rehab_player(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from rehab_plans r where r.team_id = t and r.player_id = auth.uid() and r.status = 'active');
$$;
grant execute on function public.keel_rehab_player(uuid) to authenticated;
drop policy if exists "keel videos read" on storage.objects;
create policy "keel videos read" on storage.objects for select to authenticated using (
  bucket_id = 'keel-videos' and (public.keel_is_coach(((storage.foldername(name))[1])::uuid)
    or public.keel_sc_player_ex(((storage.foldername(name))[1])::uuid)
    or public.keel_rehab_player(((storage.foldername(name))[1])::uuid)));
