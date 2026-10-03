-- Krok 4.2: pri jedle zo zoznamu potravín sa ukladá aj množstvo (g alebo ml).
alter table public.food_entries
  add column grams numeric(6, 1) check (grams > 0 and grams <= 5000);
