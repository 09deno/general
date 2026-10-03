-- Krok 4.2: k raňajkám, desiate, obedu, olovrantu a večeri pribudol aj snack (želanie majiteľa).
alter table public.food_entries drop constraint food_entries_meal_check;
alter table public.food_entries
  add constraint food_entries_meal_check
  check (meal in ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'snack'));
