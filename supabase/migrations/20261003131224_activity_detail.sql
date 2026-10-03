-- Krok 3.3: majiteľ sa rozhodol bez umelej inteligencie – vlastné odpovede textom sa nerobia.
-- Namiesto nich sa aktivita dá „rozpísať“: koľkokrát do týždňa fitko, koľkokrát iný šport a aká práca.
drop table public.ai_requests;

alter table public.goals
  drop column activity_note,
  drop column goal_note;

-- Rozpísaná aktivita (prázdne, ak si používateľ vybral jednu z bežných možností).
alter table public.goals
  add column gym_per_week smallint check (gym_per_week between 0 and 14),
  add column sport_per_week smallint check (sport_per_week between 0 and 14),
  add column job text check (job in ('sitting', 'standing', 'physical'));
