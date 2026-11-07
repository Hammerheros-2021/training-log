-- Keel nutrition: the team's nutritionist sets each player's targets and sends meal plans into their Food tab.
-- Run AFTER teams.sql. Supabase: SQL Editor > New query > paste all of this > Run. Safe to run again; never deletes data.
--
-- Who sees what
-- - Staff of a team set targets (rest, training and match days) and send meal plans to players in that team.
-- - A player sees only their own targets and plans; the app uses them in place of its own.
-- - Staff see a player's own app targets only if the player shares food with the team.

create table if not exists public.nut_targets (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  player_id uuid not null references auth.users on delete cascade,
  -- {"rest":{"kcal":2600,"protein":160,"carbs":220,"fat":90},"training":{...},"match":{...}}
  targets jsonb not null,
  note text,
  set_by uuid references auth.users on delete set null default auth.uid(),
  set_by_name text,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (team_id, player_id)
);
alter table public.nut_targets enable row level security;

create table if not exists public.nut_plans (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams on delete cascade,
  player_id uuid not null references auth.users on delete cascade,
  -- {"days":[{"date":"2026-11-09","dayType":"training","meals":[{"slot":"Breakfast","time":"08:00","name":"...",
  --   "items":[{"qty":"80 g","name":"oats"}],"kcal":600,"protein":35,"carbs":80,"fat":15}]}]}
  plan jsonb not null,
  note text,
  first_day text not null,
  last_day text not null,
  sent_by uuid references auth.users on delete set null default auth.uid(),
  sent_by_name text,
  created_at timestamptz not null default now()
);
create index if not exists nut_plans_player on public.nut_plans (player_id, last_day);
create index if not exists nut_plans_team on public.nut_plans (team_id, created_at desc);
alter table public.nut_plans enable row level security;

create or replace function public.keel_is_member_of(t uuid, u uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where team_id = t and user_id = u and role = 'member');
$$;

drop policy if exists "nut targets read" on public.nut_targets;
create policy "nut targets read" on public.nut_targets for select using (player_id = auth.uid() or public.keel_is_coach(team_id));
drop policy if exists "nut targets write" on public.nut_targets;
create policy "nut targets write" on public.nut_targets for insert with check (public.keel_is_coach(team_id) and public.keel_is_member_of(team_id, player_id));
drop policy if exists "nut targets update" on public.nut_targets;
create policy "nut targets update" on public.nut_targets for update using (public.keel_is_coach(team_id)) with check (public.keel_is_coach(team_id) and public.keel_is_member_of(team_id, player_id));
drop policy if exists "nut targets delete" on public.nut_targets;
create policy "nut targets delete" on public.nut_targets for delete using (public.keel_is_coach(team_id));

drop policy if exists "nut plans read" on public.nut_plans;
create policy "nut plans read" on public.nut_plans for select using (player_id = auth.uid() or public.keel_is_coach(team_id));
drop policy if exists "nut plans write" on public.nut_plans;
create policy "nut plans write" on public.nut_plans for insert with check (public.keel_is_coach(team_id) and public.keel_is_member_of(team_id, player_id));
drop policy if exists "nut plans delete" on public.nut_plans;
create policy "nut plans delete" on public.nut_plans for delete using (public.keel_is_coach(team_id));

revoke all on public.nut_targets, public.nut_plans from anon;
grant select, insert, update, delete on public.nut_targets, public.nut_plans to authenticated;

-- for the player: the targets and current/next plans their team set (only while they're still in the team)
create or replace function public.keel_my_nutrition()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'targets', (select to_jsonb(x) from (
        select n.targets, n.note, n.set_by_name, n.updated_at, t.name team from nut_targets n join teams t on t.id = n.team_id
        where n.player_id = auth.uid() and n.active and keel_in_team(n.team_id)
        order by n.updated_at desc limit 1) x),
    'plans', (select coalesce(jsonb_agg(to_jsonb(x) order by x.first_day), '[]'::jsonb) from (
        select p.id, p.plan, p.note, p.first_day, p.last_day, p.sent_by_name, p.created_at, t.name team
        from nut_plans p join teams t on t.id = p.team_id
        where p.player_id = auth.uid() and p.last_day >= to_char(now() - interval '2 days', 'YYYY-MM-DD') and keel_in_team(p.team_id)
        order by p.created_at desc limit 6) x));
$$;

-- for staff: each player's own app targets, only when they share food with the team
create or replace function public.keel_team_nutrition(t uuid)
returns table (user_id uuid, own jsonb)
language sql stable security definer set search_path = public as $$
  select m.user_id, p.data->'nutrition'
  from team_members m join profiles p on p.id = m.user_id
  where m.team_id = t and m.role = 'member' and m.share and m.share_food and keel_is_coach(t);
$$;

revoke execute on function public.keel_my_nutrition(), public.keel_team_nutrition(uuid) from public, anon;
grant execute on function public.keel_my_nutrition(), public.keel_team_nutrition(uuid), public.keel_is_member_of(uuid, uuid) to authenticated;
