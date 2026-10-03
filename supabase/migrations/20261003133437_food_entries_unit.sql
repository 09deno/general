-- Krok 4.2: nápoje sa merajú v ml, ostatné v g.
alter table public.food_entries
  add column unit text not null default 'g' check (unit in ('g', 'ml'));
