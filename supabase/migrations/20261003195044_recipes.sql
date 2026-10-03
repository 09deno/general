-- Krok 4.9: uložené jedlá a vlastné recepty. Každý vidí a mení len svoje.
-- Suroviny v JSON s hodnotami pre zadané množstvo, napr.
-- [{"name": "Hovädzie mäso", "kcal": 1250, "protein_g": 100, "carbs_g": 0, "fat_g": 95, "grams": 500, "unit": "g"}]
-- Uložené jedlo (napr. „Môj ovsák“) je recept na 1 porciu.
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  portions numeric(4, 1) not null default 1 check (portions between 1 and 50),
  items jsonb not null default '[]'::jsonb
    check (jsonb_typeof(items) = 'array' and octet_length(items::text) <= 50000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_user on public.recipes (user_id);

alter table public.recipes enable row level security;

create policy "Používateľ vidí svoje recepty" on public.recipes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Používateľ si pridá recept" on public.recipes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Používateľ si zmení recept" on public.recipes
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Používateľ si zmaže recept" on public.recipes
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.recipes from anon, authenticated;
grant select, insert, update, delete on public.recipes to authenticated;
