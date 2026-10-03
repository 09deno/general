-- Krok 2.4: profily, nastavenia appky a počítadlo nesprávnych pokusov pri prihlásení.

-- Profil používateľa – zatiaľ len prezývka.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  -- prezývka malými písmenami, aby „Marek“ a „marek“ bola tá istá prezývka
  nickname_key text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Používateľ vidí svoj profil"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- Nastavenia appky (pozývací kód). Číta ich len server – funkcia login.
create table public.app_settings (
  key text primary key,
  value text not null
);

alter table public.app_settings enable row level security;

-- Nesprávne pokusy o pozývací kód (podľa IP adresy) a PIN (podľa účtu).
-- Po 5 nesprávnych pokusoch sa prihlasovanie na 15 minút zablokuje.
create table public.failed_attempts (
  key text primary key,
  count integer not null default 0,
  blocked_until timestamptz
);

alter table public.failed_attempts enable row level security;

-- Appka sama do týchto tabuliek nezapisuje; profil vytvára a pokusy počíta len funkcia login.
revoke all on public.app_settings, public.failed_attempts from anon, authenticated;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
