-- Krok 4.1: zjedené jedlá. Každý vidí, pridáva a maže len svoje.
create table public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- deň podľa času na Slovensku (Europe/Bratislava)
  day date not null,
  meal text not null check (meal in ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner')),
  name text not null check (char_length(name) between 1 and 100),
  kcal integer not null check (kcal between 0 and 5000),
  protein_g numeric(5, 1) not null default 0 check (protein_g between 0 and 1000),
  carbs_g numeric(5, 1) not null default 0 check (carbs_g between 0 and 1000),
  fat_g numeric(5, 1) not null default 0 check (fat_g between 0 and 1000),
  created_at timestamptz not null default now()
);

create index food_entries_user_day on public.food_entries (user_id, day);

alter table public.food_entries enable row level security;

create policy "Používateľ vidí svoje jedlá"
  on public.food_entries for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Používateľ si pridá jedlo"
  on public.food_entries for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Používateľ si zmaže jedlo"
  on public.food_entries for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.food_entries from anon, authenticated;
grant select, insert, delete on public.food_entries to authenticated;
