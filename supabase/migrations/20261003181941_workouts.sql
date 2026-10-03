-- Krok 5.2: zapísané tréningy podľa dňa plánu. Každý vidí a mení len svoje.
-- Cviky a série sú v JSON (názov a druh cviku sa uložia, aby história ostala aj po zmene plánu), napr.
-- [{"key": "bench-press", "name": "Barbell Bench Press", "group": "chest", "kind": "weight",
--   "sets": [{"kg": 60, "reps": 10, "seconds": null, "done": true}]}]
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- deň podľa času na Slovensku (Europe/Bratislava)
  day date not null,
  -- deň plánu, podľa ktorého appka navrhne ďalší (po Push príde Pull)
  plan_day_id text check (char_length(plan_day_id) <= 64),
  name text not null check (char_length(name) between 1 and 30),
  exercises jsonb not null default '[]'::jsonb
    check (jsonb_typeof(exercises) = 'array' and octet_length(exercises::text) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workouts_user_day on public.workouts (user_id, day desc, created_at desc);

alter table public.workouts enable row level security;

create policy "Používateľ vidí svoje tréningy" on public.workouts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Používateľ si zapíše tréning" on public.workouts
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Používateľ si zmení tréning" on public.workouts
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Používateľ si zmaže tréning" on public.workouts
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.workouts from anon, authenticated;
grant select, insert, update, delete on public.workouts to authenticated;
