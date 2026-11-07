-- Keel teams and the coach dashboard.
-- Run this once in Supabase: SQL Editor > New query > paste > Run. Safe to run again.
--
-- How sharing works
-- - A coach creates a team in the dashboard (/coach/). The team gets two codes:
--   a player code (to hand out) and a coach code (for assistant coaches, physios).
-- - A player joins in the app (Profile > Your team) with the player code, after a screen that
--   lists exactly what the coach will and won't see. They can pause sharing or leave at any time.
-- - Coaches never read the entries table directly. They go through team_data(), which only returns
--   players who joined that team and have sharing on, and only the fields listed below.
--   Food, drinks, notes, menstrual cycle data, heart rate pop-up details and sickness types are never sent.

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  coach_code text not null unique,
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
alter table public.teams enable row level security;

create table if not exists public.team_members (
  team_id uuid not null references public.teams on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'member' check (role in ('coach','member')),
  display_name text,
  pos text,
  share boolean not null default true,
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
alter table public.team_members enable row level security;

-- helpers (security definer so policies don't loop back on themselves)
create or replace function public.keel_is_coach(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where team_id = t and user_id = auth.uid() and role = 'coach');
$$;
create or replace function public.keel_in_team(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where team_id = t and user_id = auth.uid());
$$;

-- only coaches read the teams table (it holds the coach code); players get their team names from keel_my_teams()
drop policy if exists "members see their teams" on public.teams;
drop policy if exists "coaches see their teams" on public.teams;
create policy "coaches see their teams" on public.teams for select using (public.keel_is_coach(id));
drop policy if exists "coaches rename their team" on public.teams;
create policy "coaches rename their team" on public.teams for update using (public.keel_is_coach(id)) with check (public.keel_is_coach(id));

drop policy if exists "see own membership, coaches see the squad" on public.team_members;
create policy "see own membership, coaches see the squad" on public.team_members
  for select using (user_id = auth.uid() or public.keel_is_coach(team_id));
drop policy if exists "change own membership" on public.team_members;
create policy "change own membership" on public.team_members
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "coaches set positions" on public.team_members;
create policy "coaches set positions" on public.team_members
  for update using (public.keel_is_coach(team_id)) with check (public.keel_is_coach(team_id));
drop policy if exists "leave, or coaches remove" on public.team_members;
create policy "leave, or coaches remove" on public.team_members
  for delete using (user_id = auth.uid() or public.keel_is_coach(team_id));

-- nobody can change their own role or team by editing rows: only these columns are writable
revoke insert, update on public.team_members from anon, authenticated;
grant update (share, display_name, pos) on public.team_members to authenticated;
revoke insert, update, delete on public.teams from anon, authenticated;
grant update (name) on public.teams to authenticated;

-- a short code people can read out: no 0/O, 1/I/L
create or replace function public.keel_code() returns text language plpgsql as $$
declare a text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; c text; begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(a, 1 + floor(random() * length(a))::int, 1); end loop;
    exit when not exists (select 1 from public.teams where code = c or coach_code = c);
  end loop;
  return c;
end $$;

-- create a team; the person creating it becomes its first coach
create or replace function public.keel_create_team(team_name text, my_name text default null)
returns public.teams language plpgsql security definer set search_path = public as $$
declare t teams; begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if coalesce(trim(team_name), '') = '' then raise exception 'Give the team a name'; end if;
  insert into teams (name, code, coach_code, created_by)
    values (left(trim(team_name), 80), keel_code(), keel_code(), auth.uid()) returning * into t;
  insert into team_members (team_id, user_id, role, display_name, share)
    values (t.id, auth.uid(), 'coach', left(my_name, 60), false);
  return t;
end $$;

-- join with a player code or a coach code
create or replace function public.keel_join_team(join_code text, my_name text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare t teams; r text; c text := upper(regexp_replace(coalesce(join_code, ''), '\s', '', 'g')); begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into t from teams where code = c or coach_code = c;
  if t.id is null then raise exception 'No team has that code. Check it with your coach.'; end if;
  r := case when t.coach_code = c then 'coach' else 'member' end;
  insert into team_members (team_id, user_id, role, display_name, share)
    values (t.id, auth.uid(), r, left(my_name, 60), r = 'member')
    on conflict (team_id, user_id) do update
      set role = case when excluded.role = 'coach' then 'coach' else team_members.role end,
          display_name = coalesce(excluded.display_name, team_members.display_name);
  return jsonb_build_object('id', t.id, 'name', t.name, 'role', r);
end $$;

-- a fresh player code (old one stops working), coaches only
create or replace function public.keel_new_code(t uuid, which text default 'player')
returns text language plpgsql security definer set search_path = public as $$
declare c text := keel_code(); begin
  if not keel_is_coach(t) then raise exception 'Coaches only'; end if;
  if which = 'coach' then update teams set coach_code = c where id = t; else update teams set code = c where id = t; end if;
  return c;
end $$;

-- the teams I'm in; codes only for coaches
create or replace function public.keel_my_teams()
returns table (team_id uuid, name text, role text, share boolean, code text, coach_code text)
language sql stable security definer set search_path = public as $$
  select t.id, t.name, m.role, m.share,
    case when m.role = 'coach' then t.code end, case when m.role = 'coach' then t.coach_code end
  from team_members m join teams t on t.id = m.team_id
  where m.user_id = auth.uid() order by m.joined_at;
$$;

-- the squad list for a coach: who's in, sharing or not, and the basics from their sign-up
create or replace function public.keel_team_squad(t uuid)
returns table (user_id uuid, role text, display_name text, pos text, share boolean, joined_at timestamptz, about jsonb)
language sql stable security definer set search_path = public as $$
  select m.user_id, m.role, coalesce(m.display_name, p.data->'answers'->>'name'), m.pos, m.share, m.joined_at,
    case when m.share then jsonb_strip_nulls(jsonb_build_object(
      'name', p.data->'answers'->'name', 'age', p.data->'answers'->'age', 'sex', p.data->'answers'->'sex',
      'sport', p.data->'answers'->'sport', 'target', p.data->'answers'->'target',
      'week', p.data->'plan'->'week', 'start', p.data->'plan'->'start')) else null end
  from team_members m left join profiles p on p.id = m.user_id
  where m.team_id = t and keel_is_coach(t);
$$;

-- day check-ins and session logs for players who share, between two dates, trimmed to what a coach needs
create or replace function public.keel_team_data(t uuid, from_day text, to_day text)
returns table (user_id uuid, kind text, key text, data jsonb)
language sql stable security definer set search_path = public as $$
  select e.user_id, e.kind, e.key,
    case e.kind
      when 'day' then jsonb_strip_nulls(jsonb_build_object(
        'date', e.data->'date', 'bed', e.data->'bed', 'wake', e.data->'wake', 'latency', e.data->'latency',
        'awakeMin', e.data->'awakeMin', 'sleepH', e.data->'sleepH', 'sleepQ', e.data->'sleepQ',
        'energy', e.data->'energy', 'mood', e.data->'mood', 'stress', e.data->'stress', 'sore', e.data->'sore',
        'rhr', e.data->'rhr', 'hrv', e.data->'hrv', 'farm', e.data->'farm', 'farmHrs', e.data->'farmHrs',
        'flags', e.data->'flags', 'dayTags', e.data->'dayTags',
        'niggles', (select jsonb_agg(jsonb_build_object('area', n->'area', 'side', n->'side', 'pain', n->'pain'))
                    from jsonb_array_elements(case when jsonb_typeof(e.data->'niggles') = 'array' then e.data->'niggles' else '[]'::jsonb end) n),
        'extras', (select jsonb_agg(jsonb_build_object('kind', x->'kind', 'dur', x->'dur', 'rpe', x->'rpe'))
                   from jsonb_array_elements(case when jsonb_typeof(e.data->'extras') = 'array' then e.data->'extras' else '[]'::jsonb end) x),
        'sick', case when jsonb_typeof(e.data->'sick'->'types') = 'array' and jsonb_array_length(e.data->'sick'->'types') > 0
                     then jsonb_build_object('on', true, 'sev', e.data->'sick'->'sev') end,
        'sfb', case when e.data ? 'sfb' then jsonb_build_object('feel', e.data->'sfb'->'feel', 'energy', e.data->'sfb'->'energy',
                     'effort', e.data->'sfb'->'effort', 'trend', e.data->'sfb'->'trend') end))
      else jsonb_strip_nulls(jsonb_build_object(
        'date', e.data->'date', 'type', e.data->'type', 'status', e.data->'status', 'dur', e.data->'dur', 'rpe', e.data->'rpe'))
    end
  from entries e
  join team_members m on m.user_id = e.user_id and m.team_id = t and m.role = 'member' and m.share
  where keel_is_coach(t) and e.kind in ('day', 'log') and e.key between from_day and to_day
  order by e.user_id, e.kind, e.key;
$$;

revoke execute on function public.keel_create_team(text, text), public.keel_join_team(text, text), public.keel_new_code(uuid, text),
  public.keel_team_squad(uuid), public.keel_team_data(uuid, text, text), public.keel_my_teams() from public, anon;
grant execute on function public.keel_create_team(text, text), public.keel_join_team(text, text), public.keel_new_code(uuid, text),
  public.keel_team_squad(uuid), public.keel_team_data(uuid, text, text), public.keel_my_teams(), public.keel_is_coach(uuid), public.keel_in_team(uuid) to authenticated;
