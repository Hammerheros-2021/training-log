-- Keel teams and the staff dashboard (/coach/).
-- Run in Supabase: SQL Editor > New query > paste all of this > Run. Safe to run again, and it never deletes data.
-- Version 4 (15 November 2026): groups, the team calendar, the message centre, and more detail from the app:
-- what each session was, habits ticked, and (only with a separate "Share meals" switch) the meals themselves.
-- Version 3 (7 November 2026): recovery sessions, mobility and heat/cold shared for the Recovery page.
-- Version 2 (7 November 2026): staff roles (manager, S&C, physio, nutritionist, mindset), food sharing opt-in,
-- staff notes and restrictions, and staff sign-up with the staff code.
--
-- How sharing works
-- - Someone creates a team in the dashboard and becomes its manager. The team gets two codes:
--   a player code and a staff code (for the rest of the backroom team).
-- - A player joins in the app (Profile > Your team) with the player code, after a screen that lists exactly
--   what the staff will and won't see. They can pause sharing, turn food sharing on or off, or leave at any time.
-- - Recovery sessions, mobility follow-alongs and heat/cold (type and minutes only) are shared for the Recovery page.
-- - Staff never read the entries table directly. They go through keel_team_data(), which only returns players
--   who joined that team and have sharing on, and only the fields listed there.
-- - Food is only sent if the player also turned on "Share food totals", and only as daily totals.
--   Drinks with alcohol, notes, cycle data, weight, sickness type and Koach chats are never sent.

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
alter table public.team_members add column if not exists staff text;
alter table public.team_members add column if not exists share_food boolean not null default false;
alter table public.team_members add column if not exists share_meals boolean not null default false;
alter table public.team_members drop constraint if exists team_members_staff_check;
alter table public.team_members add constraint team_members_staff_check
  check (staff is null or staff in ('manager','sc','physio','nutrition','mindset','coach'));
alter table public.team_members enable row level security;
-- whoever created a team before version 2 is its manager
update public.team_members m set staff = 'manager'
  from public.teams t where t.id = m.team_id and m.role = 'coach' and m.staff is null and t.created_by = m.user_id;

-- staff notes and restrictions on a player, seen by the whole staff, never by the player
create table if not exists public.team_notes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  player_id uuid not null references auth.users on delete cascade,
  author_id uuid references auth.users on delete set null default auth.uid(),
  author_name text,
  author_staff text,
  kind text not null default 'note' check (kind in ('note','restriction')),
  body text not null check (length(body) between 1 and 1000),
  until_day text,
  created_at timestamptz not null default now()
);
create index if not exists team_notes_team on public.team_notes (team_id, player_id, created_at desc);
alter table public.team_notes enable row level security;

-- helpers (security definer so policies don't loop back on themselves)
create or replace function public.keel_is_coach(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where team_id = t and user_id = auth.uid() and role = 'coach');
$$;
create or replace function public.keel_is_manager(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where team_id = t and user_id = auth.uid() and role = 'coach' and staff = 'manager');
$$;
create or replace function public.keel_in_team(t uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where team_id = t and user_id = auth.uid());
$$;

-- only staff read the teams table (it holds the staff code); players get their team names from keel_my_teams()
drop policy if exists "members see their teams" on public.teams;
drop policy if exists "coaches see their teams" on public.teams;
create policy "coaches see their teams" on public.teams for select using (public.keel_is_coach(id));
drop policy if exists "coaches rename their team" on public.teams;
create policy "coaches rename their team" on public.teams for update using (public.keel_is_manager(id)) with check (public.keel_is_manager(id));

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
drop policy if exists "leave, or managers remove" on public.team_members;
create policy "leave, or managers remove" on public.team_members
  for delete using (user_id = auth.uid() or public.keel_is_manager(team_id));

drop policy if exists "staff read notes" on public.team_notes;
create policy "staff read notes" on public.team_notes for select using (public.keel_is_coach(team_id));
drop policy if exists "staff write notes" on public.team_notes;
create policy "staff write notes" on public.team_notes for insert
  with check (public.keel_is_coach(team_id) and author_id = auth.uid()
    and exists (select 1 from team_members m where m.team_id = team_notes.team_id and m.user_id = team_notes.player_id));
drop policy if exists "authors or managers delete notes" on public.team_notes;
create policy "authors or managers delete notes" on public.team_notes for delete
  using (public.keel_is_coach(team_id) and (author_id = auth.uid() or public.keel_is_manager(team_id)));

-- nobody can change their own role or team by editing rows: only these columns are writable
revoke insert, update on public.team_members from anon, authenticated;
grant update (share, share_food, share_meals, display_name, pos, staff) on public.team_members to authenticated;
revoke insert, update, delete on public.teams from anon, authenticated;
grant update (name) on public.teams to authenticated;
revoke update on public.team_notes from anon, authenticated;
revoke all on public.team_notes from anon;

-- a player can't make themselves staff by setting a staff role
create or replace function public.keel_staff_guard() returns trigger language plpgsql as $$ begin
  if new.team_id <> old.team_id or new.user_id <> old.user_id or new.role <> old.role then
    raise exception 'That can''t be changed';
  end if;
  -- only the player decides what they share
  if auth.uid() is distinct from new.user_id and (new.share is distinct from old.share or new.share_food is distinct from old.share_food or new.share_meals is distinct from old.share_meals) then
    raise exception 'Only the player can change what they share';
  end if;
  if new.role = 'member' then new.staff := null; return new; end if;
  if new.staff = 'manager' and old.staff is distinct from 'manager' and not public.keel_is_manager(new.team_id) then
    raise exception 'Only a manager can make someone a manager';
  end if;
  if old.staff = 'manager' and new.staff is distinct from 'manager' and auth.uid() is distinct from new.user_id then
    raise exception 'Only the manager can change their own role';
  end if;
  return new;
end $$;
drop trigger if exists keel_staff_guard on public.team_members;
create trigger keel_staff_guard before update on public.team_members for each row execute function public.keel_staff_guard();

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

-- create a team; the person creating it becomes its manager
create or replace function public.keel_create_team(team_name text, my_name text default null)
returns public.teams language plpgsql security definer set search_path = public as $$
declare t teams; begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if coalesce(trim(team_name), '') = '' then raise exception 'Give the team a name'; end if;
  insert into teams (name, code, coach_code, created_by)
    values (left(trim(team_name), 80), keel_code(), keel_code(), auth.uid()) returning * into t;
  insert into team_members (team_id, user_id, role, display_name, share, staff)
    values (t.id, auth.uid(), 'coach', left(my_name, 60), false, 'manager');
  return t;
end $$;

-- join with a player code or a staff code; staff can say their role
drop function if exists public.keel_join_team(text, text);
create or replace function public.keel_join_team(join_code text, my_name text default null, my_staff text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare t teams; r text; s text; c text := upper(regexp_replace(coalesce(join_code, ''), '\s', '', 'g')); begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into t from teams where code = c or coach_code = c;
  if t.id is null then raise exception 'No team has that code. Check it with your coach.'; end if;
  r := case when t.coach_code = c then 'coach' else 'member' end;
  s := case when r = 'coach' and my_staff in ('sc','physio','nutrition','mindset','coach') then my_staff end;
  insert into team_members (team_id, user_id, role, display_name, share, staff)
    values (t.id, auth.uid(), r, left(my_name, 60), r = 'member', s)
    on conflict (team_id, user_id) do update
      set role = case when excluded.role = 'coach' then 'coach' else team_members.role end,
          staff = coalesce(team_members.staff, excluded.staff),
          display_name = coalesce(excluded.display_name, team_members.display_name);
  return jsonb_build_object('id', t.id, 'name', t.name, 'role', r);
end $$;

-- a fresh code (old one stops working), managers only
create or replace function public.keel_new_code(t uuid, which text default 'player')
returns text language plpgsql security definer set search_path = public as $$
declare c text := keel_code(); begin
  if not keel_is_manager(t) then raise exception 'Only the team manager can change codes'; end if;
  if which = 'coach' then update teams set coach_code = c where id = t; else update teams set code = c where id = t; end if;
  return c;
end $$;

-- the teams I'm in; codes only for staff
drop function if exists public.keel_my_teams();
create or replace function public.keel_my_teams()
returns table (team_id uuid, name text, role text, share boolean, code text, coach_code text, staff text, share_food boolean, share_meals boolean)
language sql stable security definer set search_path = public as $$
  select t.id, t.name, m.role, m.share,
    case when m.role = 'coach' then t.code end, case when m.role = 'coach' then t.coach_code end, m.staff, m.share_food, m.share_food and m.share_meals
  from team_members m join teams t on t.id = m.team_id
  where m.user_id = auth.uid() order by m.joined_at;
$$;

-- the squad list for staff: who's in, sharing or not, and the basics from their sign-up
drop function if exists public.keel_team_squad(uuid);
create or replace function public.keel_team_squad(t uuid)
returns table (user_id uuid, role text, display_name text, pos text, share boolean, joined_at timestamptz, about jsonb, staff text, share_food boolean, share_meals boolean)
language sql stable security definer set search_path = public as $$
  select m.user_id, m.role, coalesce(m.display_name, p.data->'answers'->>'name'), m.pos, m.share, m.joined_at,
    case when m.share then jsonb_strip_nulls(jsonb_build_object(
      'name', p.data->'answers'->'name', 'age', p.data->'answers'->'age', 'sex', p.data->'answers'->'sex',
      'sport', p.data->'answers'->'sport', 'target', p.data->'answers'->'target',
      'week', p.data->'plan'->'week', 'start', p.data->'plan'->'start')) else null end,
    m.staff, m.share and m.share_food, m.share and m.share_food and m.share_meals
  from team_members m left join profiles p on p.id = m.user_id
  where m.team_id = t and keel_is_coach(t);
$$;

-- one day's food as totals (no meals, no item names except plants; drinks with alcohol left out)
create or replace function public.keel_food_totals(d jsonb) returns jsonb language sql immutable as $$
  with items as (
    select i from jsonb_array_elements(case when jsonb_typeof(d->'food') = 'array' then d->'food' else '[]'::jsonb end) i
    where coalesce(i->>'src', '') <> 'alcohol'
  ), n as (
    select count(*) c,
      sum(coalesce(case when (i->>'kcal') ~ '^-?[0-9.]+$' then (i->>'kcal')::numeric end,
        4 * coalesce(case when (i->>'carbs') ~ '^-?[0-9.]+$' then (i->>'carbs')::numeric end, 0)
      + 4 * coalesce(case when (i->>'protein') ~ '^-?[0-9.]+$' then (i->>'protein')::numeric end, 0)
      + 9 * coalesce(case when (i->>'fat') ~ '^-?[0-9.]+$' then (i->>'fat')::numeric end, 0))) kcal,
      sum(case when (i->>'protein') ~ '^-?[0-9.]+$' then (i->>'protein')::numeric end) protein,
      sum(case when (i->>'carbs') ~ '^-?[0-9.]+$' then (i->>'carbs')::numeric end) carbs,
      sum(case when (i->>'fat') ~ '^-?[0-9.]+$' then (i->>'fat')::numeric end) fat,
      sum(case when (i->>'fibre') ~ '^-?[0-9.]+$' then (i->>'fibre')::numeric end) fibre,
      sum(case when (i->>'iron') ~ '^-?[0-9.]+$' then (i->>'iron')::numeric end) iron,
      sum(case when (i->>'calcium') ~ '^-?[0-9.]+$' then (i->>'calcium')::numeric end) calcium,
      sum(case when (i->>'vitD') ~ '^-?[0-9.]+$' then (i->>'vitD')::numeric end) vitd,
      sum(case when (i->>'omega3') ~ '^-?[0-9.]+$' then (i->>'omega3')::numeric end) omega3
    from items
  ), pl as (
    select jsonb_agg(distinct lower(trim(p))) plants from items, jsonb_array_elements_text(
      case when jsonb_typeof(i->'plants') = 'array' then i->'plants' else '[]'::jsonb end) p
    where coalesce(i->>'src', '') <> 'coffee' and coalesce(case when (i->>'pct') ~ '^[0-9.]+$' then (i->>'pct')::numeric end, 100) >= 50
      and trim(p) <> ''
  )
  select case when n.c = 0 and d->'water' is null then null else jsonb_strip_nulls(jsonb_build_object(
    'n', n.c, 'kcal', round(n.kcal), 'protein', round(n.protein), 'carbs', round(n.carbs), 'fat', round(n.fat),
    'fibre', round(n.fibre), 'iron', round(n.iron, 1), 'calcium', round(n.calcium), 'vitD', round(n.vitd, 1),
    'omega3', round(n.omega3, 2), 'plants', pl.plants, 'water', d->'water',
    'first', d->'firstMeal', 'last', d->'lastMeal')) end
  from n, pl;
$$;


-- one day's meals for players who also switched on "Share meals": meal, time, food name, amount and macros.
-- Alcohol is left out, and so are photos and notes.
create or replace function public.keel_food_meals(d jsonb) returns jsonb language sql immutable as $$
  select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
    'meal', i->'meal', 'at', i->'at', 'name', left(i->>'name', 80), 'dish', left(i->>'dish', 60), 'qty', left(i->>'qty', 60), 'pct', i->'pct',
    'kcal', i->'kcal', 'protein', i->'protein', 'carbs', i->'carbs', 'fat', i->'fat')))
  from jsonb_array_elements(case when jsonb_typeof(d->'food') = 'array' then d->'food' else '[]'::jsonb end) i
  where coalesce(i->>'src', '') <> 'alcohol';
$$;

-- day check-ins and session logs for players who share, between two dates, trimmed to what staff need
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
        'extras', (select jsonb_agg(jsonb_build_object('kind', x->'kind', 'desc', left(x->>'desc', 80), 'dur', x->'dur', 'rpe', x->'rpe', 'km', x->'km', 'sc', x->'sc'))
                   from jsonb_array_elements(case when jsonb_typeof(e.data->'extras') = 'array' then e.data->'extras' else '[]'::jsonb end) x),
        'sick', case when jsonb_typeof(e.data->'sick'->'types') = 'array' and jsonb_array_length(e.data->'sick'->'types') > 0
                     then jsonb_build_object('on', true, 'sev', e.data->'sick'->'sev') end,
        'sfb', case when e.data ? 'sfb' then jsonb_build_object('feel', e.data->'sfb'->'feel', 'energy', e.data->'sfb'->'energy',
                     'effort', e.data->'sfb'->'effort', 'trend', e.data->'sfb'->'trend') end,
        'food', case when m.share_food then keel_food_totals(e.data) end,
        'meals', case when m.share_food and m.share_meals then keel_food_meals(e.data) end,
        'hab', case when jsonb_typeof(e.data->'hab') = 'array' then e.data->'hab' end,
        'trainIntent', e.data->'trainIntent', 'dayType', e.data->'dayType',
        'recovery', (select jsonb_agg(jsonb_build_object('kind', x->'kind', 'min', x->'min'))
                     from jsonb_array_elements(case when jsonb_typeof(e.data->'recovery') = 'array' then e.data->'recovery' else '[]'::jsonb end) x),
        'mobility', (select jsonb_agg(jsonb_build_object('name', x->'name', 'min', x->'min'))
                     from jsonb_array_elements(case when jsonb_typeof(e.data->'mobility') = 'array' then e.data->'mobility' else '[]'::jsonb end) x),
        'hc', (select jsonb_agg(jsonb_build_object('type', x->'type', 'min', x->'min'))
               from jsonb_array_elements(case when jsonb_typeof(e.data->'hc') = 'array' then e.data->'hc' else '[]'::jsonb end) x)))
      else jsonb_strip_nulls(jsonb_build_object(
        'date', e.data->'date', 'type', e.data->'type', 'status', e.data->'status', 'dur', e.data->'dur', 'rpe', e.data->'rpe',
        'dist', e.data->'dist', 'pace', e.data->'pace', 'feel', e.data->'feel'))
    end
  from entries e
  join team_members m on m.user_id = e.user_id and m.team_id = t and m.role = 'member' and m.share
  where keel_is_coach(t) and e.kind in ('day', 'log') and e.key between from_day and to_day
  order by e.user_id, e.kind, e.key;
$$;

revoke execute on function public.keel_create_team(text, text), public.keel_join_team(text, text, text), public.keel_new_code(uuid, text),
  public.keel_team_squad(uuid), public.keel_team_data(uuid, text, text), public.keel_my_teams() from public, anon;
grant execute on function public.keel_create_team(text, text), public.keel_join_team(text, text, text), public.keel_new_code(uuid, text),
  public.keel_team_squad(uuid), public.keel_team_data(uuid, text, text), public.keel_my_teams(),
  public.keel_is_coach(uuid), public.keel_is_manager(uuid), public.keel_in_team(uuid) to authenticated;

-- ================= Version 4: groups, calendar, messages =================

-- groups: e.g. Backs, Forwards, U20s, Rehab group. Staff make them; players can see the names of their own groups.
create table if not exists public.team_groups (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  colour text,
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create table if not exists public.team_group_members (
  group_id uuid not null references public.team_groups on delete cascade,
  team_id uuid not null references public.teams on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  primary key (group_id, user_id)
);
alter table public.team_groups enable row level security;
alter table public.team_group_members enable row level security;

create or replace function public.keel_in_group(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_group_members where group_id = g and user_id = auth.uid());
$$;

drop policy if exists "staff manage groups" on public.team_groups;
create policy "staff manage groups" on public.team_groups for all using (public.keel_is_coach(team_id)) with check (public.keel_is_coach(team_id));
drop policy if exists "players see their groups" on public.team_groups;
create policy "players see their groups" on public.team_groups for select using (public.keel_in_group(id));
drop policy if exists "staff manage group members" on public.team_group_members;
create policy "staff manage group members" on public.team_group_members for all using (public.keel_is_coach(team_id))
  with check (public.keel_is_coach(team_id)
    and exists (select 1 from team_groups g where g.id = group_id and g.team_id = team_group_members.team_id)
    and exists (select 1 from team_members m where m.team_id = team_group_members.team_id and m.user_id = team_group_members.user_id));
drop policy if exists "players see own group rows" on public.team_group_members;
create policy "players see own group rows" on public.team_group_members for select using (user_id = auth.uid());

-- the team calendar: training, matches, gym, recovery, meetings. For the whole squad or one group.
create table if not exists public.team_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  kind text not null default 'training' check (kind in ('training','match','gym','recovery','meeting','other')),
  title text not null check (length(trim(title)) between 1 and 80),
  day date not null,
  start_time time,
  end_time time,
  location text check (location is null or length(location) <= 120),
  notes text check (notes is null or length(notes) <= 1000),
  intensity int check (intensity is null or intensity between 1 and 5),
  group_id uuid references public.team_groups on delete set null,
  created_by uuid references auth.users on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists team_events_team_day on public.team_events (team_id, day);
alter table public.team_events enable row level security;
drop policy if exists "staff manage the calendar" on public.team_events;
create policy "staff manage the calendar" on public.team_events for all using (public.keel_is_coach(team_id)) with check (public.keel_is_coach(team_id));
drop policy if exists "players see their calendar" on public.team_events;
create policy "players see their calendar" on public.team_events for select
  using (public.keel_in_team(team_id) and (group_id is null or public.keel_in_group(group_id)));

-- the message centre
-- squad: staff post to every player. group: staff post to one group. staff: backroom team only.
-- direct: a private thread between one player and the staff (any staff member can read and answer).
create table if not exists public.team_messages (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  channel text not null check (channel in ('squad','group','staff','direct')),
  group_id uuid references public.team_groups on delete cascade,
  player_id uuid references auth.users on delete cascade,
  author_id uuid references auth.users on delete set null default auth.uid(),
  author_name text,
  author_staff text,
  body text not null check (length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  check ((channel = 'group') = (group_id is not null)),
  check ((channel = 'direct') = (player_id is not null))
);
create index if not exists team_messages_team on public.team_messages (team_id, created_at desc);
alter table public.team_messages enable row level security;

create or replace function public.keel_can_read_msg(t uuid, ch text, g uuid, p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when keel_is_coach(t) then true
    when ch = 'squad' then keel_in_team(t)
    when ch = 'group' then keel_in_team(t) and keel_in_group(g)
    when ch = 'direct' then p = auth.uid() and keel_in_team(t)
    else false end;
$$;
drop policy if exists "read messages" on public.team_messages;
create policy "read messages" on public.team_messages for select using (public.keel_can_read_msg(team_id, channel, group_id, player_id));
drop policy if exists "post messages" on public.team_messages;
create policy "post messages" on public.team_messages for insert with check (
  author_id = auth.uid() and (
    (public.keel_is_coach(team_id) and (channel <> 'group' or exists (select 1 from team_groups g where g.id = group_id and g.team_id = team_messages.team_id))
      and (channel <> 'direct' or exists (select 1 from team_members m where m.team_id = team_messages.team_id and m.user_id = player_id and m.role = 'member')))
    or (channel = 'direct' and player_id = auth.uid() and public.keel_in_team(team_id))));
drop policy if exists "delete own messages" on public.team_messages;
create policy "delete own messages" on public.team_messages for delete using (author_id = auth.uid() or public.keel_is_manager(team_id));
revoke update on public.team_messages from anon, authenticated;

-- the sender's name and role come from the team, not from what the app sends
create or replace function public.keel_msg_author() returns trigger language plpgsql security definer set search_path = public as $$
declare m team_members; begin
  select * into m from team_members where team_id = new.team_id and user_id = auth.uid();
  new.author_id := auth.uid();
  new.author_name := coalesce(m.display_name, (select p.data->'answers'->>'name' from profiles p where p.id = auth.uid()), 'Team member');
  new.author_staff := case when m.role = 'coach' then coalesce(m.staff, 'coach') end;
  new.created_at := now();
  return new;
end $$;
drop trigger if exists keel_msg_author on public.team_messages;
create trigger keel_msg_author before insert on public.team_messages for each row execute function public.keel_msg_author();

-- where each person has read up to, per thread (thread = 'squad', 'staff', 'group:<id>' or 'direct:<player id>')
create table if not exists public.team_message_reads (
  team_id uuid not null references public.teams on delete cascade,
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  thread text not null,
  read_at timestamptz not null default now(),
  primary key (team_id, user_id, thread)
);
alter table public.team_message_reads enable row level security;
drop policy if exists "own read markers" on public.team_message_reads;
create policy "own read markers" on public.team_message_reads for all using (user_id = auth.uid()) with check (user_id = auth.uid() and public.keel_in_team(team_id));

-- a Rehab type in the exercise library (for the physio's own clips)
do $$ begin
  if to_regclass('public.sc_exercises') is not null then
    alter table public.sc_exercises drop constraint if exists sc_exercises_category_check;
    alter table public.sc_exercises add constraint sc_exercises_category_check
      check (category in ('strength','power','speed','conditioning','mobility','prehab','rehab','recovery','core'));
  end if;
end $$;

-- programmes handed to a whole group remember which group, so the dashboard can show it
alter table if exists public.sc_assignments add column if not exists group_id uuid references public.team_groups on delete set null;

revoke all on public.team_groups, public.team_group_members, public.team_events, public.team_messages, public.team_message_reads from anon;
grant select, insert, update, delete on public.team_groups, public.team_group_members, public.team_events, public.team_message_reads to authenticated;
grant select, insert, delete on public.team_messages to authenticated;
grant execute on function public.keel_in_group(uuid), public.keel_can_read_msg(uuid, text, uuid, uuid), public.keel_food_meals(jsonb) to authenticated;
