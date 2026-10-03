-- Krok 4.6: výrobky podľa čiarového kódu, ktoré sa nenašli v Open Food Facts a niekto ich zadal z obalu.
-- Hodnoty sú na 100 g (alebo 100 ml) a vidí ich celá partia – nie sú to osobné údaje.
create table public.products (
  barcode text primary key check (barcode ~ '^[0-9]{8,14}$'),
  name text not null check (char_length(name) between 1 and 100),
  kcal numeric(6, 1) not null check (kcal between 0 and 1000),
  protein numeric(5, 1) not null default 0 check (protein between 0 and 100),
  carbs numeric(5, 1) not null default 0 check (carbs between 0 and 100),
  fat numeric(5, 1) not null default 0 check (fat between 0 and 100),
  unit text not null default 'g' check (unit in ('g', 'ml')),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Prihlásení vidia výrobky"
  on public.products for select
  to authenticated
  using (true);

create policy "Prihlásený pridá výrobok"
  on public.products for insert
  to authenticated
  with check ((select auth.uid()) = created_by);

revoke all on public.products from anon, authenticated;
grant select, insert on public.products to authenticated;
