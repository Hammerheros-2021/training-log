-- Keel: sharing update (Nov 2026). Run once in Supabase > SQL Editor, after teams.sql. Safe to run again.
-- Adds to what staff can see, only for players who share with the team:
--   - heart rate readings with their type (on waking, lying, sitting)            main share switch
--   - the player's Keel plan for the week and any days they moved or cancelled   main share switch (app writes a 'teamplan' summary)
--   - the line Koach gave them this morning                                     main share switch (in 'teamplan')
--   - time of the last coffee / caffeine each day                               only with "Share food totals"
--   - supplements taken each day (names and how many)                           only with the new "Share supplements" switch
--   - hours of work, driving and physical work each day                         only with the new "Share my day" switch
-- Never shared: weight, favourite dishes, exact GPS tracks, Ask Koach chats.

alter table public.team_members add column if not exists share_supps boolean not null default false;
alter table public.team_members add column if not exists share_day boolean not null default false;
grant update (share_supps, share_day) on public.team_members to authenticated;

create or replace function public.keel_staff_guard() returns trigger language plpgsql as $$ begin
  if new.team_id <> old.team_id or new.user_id <> old.user_id or new.role <> old.role then
    raise exception 'That can''t be changed';
  end if;
  -- only the player decides what they share
  if auth.uid() is distinct from new.user_id and (new.share is distinct from old.share or new.share_food is distinct from old.share_food
     or new.share_meals is distinct from old.share_meals or new.share_supps is distinct from old.share_supps or new.share_day is distinct from old.share_day) then
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

-- the player's own switches, for the app
create or replace function public.keel_my_share2()
returns table (team_id uuid, share_supps boolean, share_day boolean)
language sql stable security definer set search_path = public as $$
  select m.team_id, m.share_supps, m.share_day from team_members m where m.user_id = auth.uid();
$$;

-- hours per kind of block in a day: {"work":7.5,"driving":1,"physical":3}
create or replace function public.keel_day_blocks(d jsonb) returns jsonb language sql immutable as $$
  select nullif(jsonb_strip_nulls(jsonb_build_object(
    'work', round(sum(h) filter (where t ~* 'desk|office|work|meeting|shift')::numeric, 1),
    'driving', round(sum(h) filter (where t ~* 'driv|car|commut|travel')::numeric, 1),
    'physical', round(sum(h) filter (where t ~* 'farm|physical|labour|site|manual|yard')::numeric, 1),
    'family', round(sum(h) filter (where t ~* 'family|kids|home')::numeric, 1))), '{}'::jsonb)
  from (
    select coalesce(b->>'type', '') as t,
      greatest(0, ((split_part(b->>'to', ':', 1))::numeric * 60 + (split_part(b->>'to', ':', 2))::numeric
                 - (split_part(b->>'from', ':', 1))::numeric * 60 - (split_part(b->>'from', ':', 2))::numeric)) / 60.0 as h
    from jsonb_array_elements(case when jsonb_typeof(d->'blocks') = 'array' then d->'blocks' else '[]'::jsonb end) b
    where (b->>'from') ~ '^\d{1,2}:\d{2}' and (b->>'to') ~ '^\d{1,2}:\d{2}'
  ) x;
$$;

-- latest time with caffeine that day, e.g. "15:30"
create or replace function public.keel_last_caffeine(d jsonb) returns text language sql immutable as $$
  select max(f->>'at') from jsonb_array_elements(case when jsonb_typeof(d->'food') = 'array' then d->'food' else '[]'::jsonb end) f
  where coalesce((f->>'caffeine')::numeric, 0) > 0 and (f->>'at') ~ '^\d{1,2}:\d{2}';
$$;

-- supplements taken that day, by name: [{"name":"Creatine","n":1}]
create or replace function public.keel_supps_taken(uid uuid, d jsonb) returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_agg(jsonb_build_object('name', coalesce(s->>'short', s->>'name'), 'n', coalesce((d->'suppQty'->>(s->>'id'))::int, 1)))
  from entries me, jsonb_array_elements(case when jsonb_typeof(me.data->'list') = 'array' then me.data->'list' else '[]'::jsonb end) s
  where me.user_id = uid and me.kind = 'meta' and me.key = 'supps'
    and jsonb_typeof(d->'suppTaken') = 'array' and (d->'suppTaken') ? (s->>'id');
$$;

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
        'hr', case when jsonb_typeof(e.data->'hr') = 'object' then jsonb_build_object('type', e.data->'hr'->'type', 'bpm', e.data->'hr'->'bpm') end,
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
        'lastCaf', case when m.share_food then keel_last_caffeine(e.data) end,
        'supps', case when m.share_supps then keel_supps_taken(e.user_id, e.data) end,
        'blocks', case when m.share_day then keel_day_blocks(e.data) end,
        'hab', case when jsonb_typeof(e.data->'hab') = 'array' then e.data->'hab' end,
        'trainIntent', e.data->'trainIntent', 'dayType', e.data->'dayType',
        'recovery', (select jsonb_agg(jsonb_build_object('kind', x->'kind', 'min', x->'min'))
                     from jsonb_array_elements(case when jsonb_typeof(e.data->'recovery') = 'array' then e.data->'recovery' else '[]'::jsonb end) x),
        'mobility', (select jsonb_agg(jsonb_build_object('name', x->'name', 'min', x->'min'))
                     from jsonb_array_elements(case when jsonb_typeof(e.data->'mobility') = 'array' then e.data->'mobility' else '[]'::jsonb end) x),
        'hc', (select jsonb_agg(jsonb_build_object('type', x->'type', 'min', x->'min'))
               from jsonb_array_elements(case when jsonb_typeof(e.data->'hc') = 'array' then e.data->'hc' else '[]'::jsonb end) x)))
      when 'meta' then jsonb_strip_nulls(jsonb_build_object(
        'days', e.data->'days', 'changes', e.data->'changes', 'koach', e.data->'koach', 'koachDay', e.data->'koachDay', 'at', e.data->'at'))
      else jsonb_strip_nulls(jsonb_build_object(
        'date', e.data->'date', 'type', e.data->'type', 'status', e.data->'status', 'dur', e.data->'dur', 'rpe', e.data->'rpe',
        'dist', e.data->'dist', 'pace', e.data->'pace', 'feel', e.data->'feel'))
    end
  from entries e
  join team_members m on m.user_id = e.user_id and m.team_id = t and m.role = 'member' and m.share
  where keel_is_coach(t) and (
    (e.kind in ('day', 'log') and e.key between from_day and to_day)
    or (e.kind = 'meta' and e.key = 'teamplan'))
  order by e.user_id, e.kind, e.key;
$$;

revoke execute on function public.keel_my_share2(), public.keel_supps_taken(uuid, jsonb) from public, anon;
grant execute on function public.keel_my_share2(), public.keel_day_blocks(jsonb), public.keel_last_caffeine(jsonb) to authenticated;
grant execute on function public.keel_team_data(uuid, text, text) to authenticated;
