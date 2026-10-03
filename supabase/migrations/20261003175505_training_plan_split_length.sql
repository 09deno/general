-- Krok 5.1: dlhšie názvy splitov (napr. „Hrudník+Triceps / Chrbát+Biceps / Nohy+Ramená“).
alter table public.training_plans drop constraint training_plans_split_check;
alter table public.training_plans add constraint training_plans_split_check check (char_length(split) between 1 and 60);
