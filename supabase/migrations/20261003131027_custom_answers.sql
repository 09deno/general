-- Krok 3.3: vlastné odpovede pri otázkach „Ako často športuješ?“ a „Čo chceš dosiahnuť?“.
-- Text, ktorý používateľ napísal; appka ho predvyplní pri zmene cieľov.
alter table public.goals
  add column activity_note text check (char_length(activity_note) <= 300),
  add column goal_note text check (char_length(goal_note) <= 300);

-- Z vlastnej odpovede môže vyjsť aj veľmi vysoká aktivita (tréning skoro denne + fyzická práca).
alter table public.goals drop constraint goals_activity_check;
alter table public.goals
  add constraint goals_activity_check check (activity in ('none', 'low', 'medium', 'high', 'very_high'));

-- Každé porozumenie vlastnej odpovede stojí trochu kreditu – funkcia understand podľa tohto
-- obmedzí počet na používateľa za deň. Číta a zapisuje len server.
create table public.ai_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index ai_requests_user_time on public.ai_requests (user_id, created_at);

alter table public.ai_requests enable row level security;

revoke all on public.ai_requests from anon, authenticated;
