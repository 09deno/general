-- Krok 3.1: odpovede z úvodných otázok a denné ciele (kalórie, bielkoviny, sacharidy, tuky).
-- Každý vidí a mení len svoje.
create table public.goals (
  user_id uuid primary key references auth.users (id) on delete cascade,
  sex text not null check (sex in ('male', 'female')),
  birth_year integer not null check (birth_year between 1900 and 2100),
  height_cm integer not null check (height_cm between 100 and 250),
  weight_kg numeric(5, 1) not null check (weight_kg between 25 and 300),
  activity text not null check (activity in ('none', 'low', 'medium', 'high')),
  goal text not null check (goal in ('lose', 'recomp', 'maintain', 'gain')),
  kcal integer not null check (kcal between 800 and 6000),
  protein_g integer not null check (protein_g between 0 and 500),
  carbs_g integer not null check (carbs_g between 0 and 1000),
  fat_g integer not null check (fat_g between 0 and 400),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Používateľ vidí svoje ciele"
  on public.goals for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Používateľ si uloží svoje ciele"
  on public.goals for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Používateľ si zmení svoje ciele"
  on public.goals for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.goals from anon, authenticated;
grant select, insert, update on public.goals to authenticated;
