-- Keel: Koach target checks for the staff (Nov 2026). Run once in Supabase > SQL Editor, after share2.sql. Safe to run again.
-- Adds one thing staff can see, only for players who share with the team (main share switch):
--   - Koach's target checks: when a player looks flat on match or training days, or their weight isn't moving toward their goal,
--     what Koach suggests (e.g. "match day carbs +40 g") and any change being checked. Never the weight itself.
-- Same function as in share2.sql with 'tcheck' added to the 'teamplan' summary.

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
        'days', e.data->'days', 'changes', e.data->'changes', 'koach', e.data->'koach', 'koachDay', e.data->'koachDay', 'at', e.data->'at',
        'tcheck', e.data->'tcheck'))
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

grant execute on function public.keel_team_data(uuid, text, text) to authenticated;
