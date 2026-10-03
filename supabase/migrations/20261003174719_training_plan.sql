-- Krok 5.1: tréningový plán (split) a vlastné cviky. Každý vidí a mení len svoje.

-- Vlastné cviky, ktoré v zozname appky chýbajú.
create table public.custom_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  muscle_group text not null check (muscle_group in ('chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'full_body')),
  kind text not null check (kind in ('weight', 'bodyweight', 'time')),
  created_at timestamptz not null default now()
);

create index custom_exercises_user on public.custom_exercises (user_id);

alter table public.custom_exercises enable row level security;

create policy "Používateľ vidí svoje cviky" on public.custom_exercises
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Používateľ si pridá cvik" on public.custom_exercises
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Používateľ si zmaže cvik" on public.custom_exercises
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.custom_exercises from anon, authenticated;
grant select, insert, delete on public.custom_exercises to authenticated;

-- Tréningový plán: zvolený split a jeho dni s cvikmi, napr.
-- [{"id": "…", "name": "Push", "exercises": ["bench-press", "custom:…"]}]
create table public.training_plans (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  split text not null check (char_length(split) between 1 and 40),
  days jsonb not null default '[]'::jsonb check (jsonb_typeof(days) = 'array'),
  updated_at timestamptz not null default now()
);

alter table public.training_plans enable row level security;

create policy "Používateľ vidí svoj plán" on public.training_plans
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Používateľ si vytvorí plán" on public.training_plans
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Používateľ si zmení plán" on public.training_plans
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Používateľ si zmaže plán" on public.training_plans
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.training_plans from anon, authenticated;
grant select, insert, update, delete on public.training_plans to authenticated;
