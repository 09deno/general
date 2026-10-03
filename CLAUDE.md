# Fit denník – pokyny pre Clauda

Mobilná webová appka (PWA) na sledovanie jedla a tréningu pre majiteľa projektu a jeho partiu kamarátov (5–10 ľudí, väčšinou iPhony). Celé rozhranie po slovensky.

- Pôvodné zadanie: [`docs/zadanie.md`](docs/zadanie.md). Rozhodnutia nižšie ho spresňujú a pri rozpore platia ony.
- Tento súbor drž aktuálny: po každom schválenom kroku doplň nové rozhodnutia a stav.

## Ako s majiteľom pracovať (vždy dodržiavať)

- Komunikuj **po slovensky**, jednoducho a bez technických detailov – kód ho nezaujíma, zaujíma ho výsledok.
- Postupuj **po jednom malom kroku**. Pred krokom polož otázky ku všetkému nejasnému (radšej viackrát ako hádať). Nerob nič navyše, nepridávaj nežiadané funkcie – návrhy na vylepšenie len ako otázku.
- Po každom kroku sa zastav, stručne zhrň, čo je hotové, a počkaj na potvrdenie.
- Pri voľbách vzhľadu ukazuj **obrázkové náhľady** (snímky z Playwrightu), nie len popis.
- Postup pri každom kroku:
  1. zmeny vo vývojovej vetve → `npm run build` → kontrola snímkami (mobil 390×844, svetlý aj tmavý režim),
  2. pull request do `main` → Vercel k nemu vytvorí **testovací odkaz** (otvorí ho len majiteľ prihlásený do Vercelu účtom 09deno),
  3. po schválení **squash merge** do `main` → Vercel nasadí ostrú verziu,
  4. vývojovú vetvu potom založ nanovo z aktuálneho `main`.

## Technické riešenie

- **Appka:** React 19 + Vite + TypeScript, `react-router-dom`, ikony `lucide-react`, PWA cez `vite-plugin-pwa` (manifest, service worker, automatická aktualizácia).
- **Hosting:** Vercel, projekt `general` v účte **09deno**, prepojený s GitHub repom `09deno/general`. Každý push do vetvy = testovacia verzia, `main` = ostrá verzia. `vercel.json` presmeruje všetky adresy na appku. Ostrá adresa: **`dccf2f4b.vercel.app`** (overené 3. 10. 2026, beží na nej Fit denník).
- **Databáza + prihlásenie:** Supabase, bezplatný plán, server **Frankfurt (EÚ)**. Prístup cez Supabase konektor v claude.ai.
  - Fit denník má **vlastný Supabase účet** (iný e-mail ako hlavný účet majiteľa). Hlavný účet už má 2 aktívne bezplatné projekty (SideWage, interny-system-kit) a viac bezplatný plán nedovolí. **Konektor je prepojený na tento nový účet.** Hlavný účet nemeniť ani nepozastavovať.
  - Projekt **`fit-dennik`** (ID `xpnoghsrutstnfmalnfz`, región Frankfurt `eu-central-1`, organizácia `09deno`), založený 3. 10. 2026 cez konektor. Adresa: `https://xpnoghsrutstnfmalnfz.supabase.co`.
  - **Jedna spoločná databáza** pre testovací odkaz aj ostrú verziu (rozhodol majiteľ). Testovacie účty a záznamy, ktoré Claude vytvorí pri skúšaní, po skúške zmaže. Druhé bezplatné miesto na účte ostáva voľné.
  - Do appky ide len adresa projektu a **verejný (publishable) kľúč** – ten je verejný zámerne, dáta chráni Row Level Security. Tajný kľúč (secret/service_role) nikdy do kódu ani do repa.
  - Free projekt sa po 7 dňoch bez používania uspí – prebudí sa jedným klikom v Supabase, dáta ostanú.
  - Súkromie: každý záznam patrí jednému používateľovi, prístup stráži Row Level Security priamo v databáze.
- **Netlify nepoužívať:** konektor Netlify patrí účtu Web Sano (firemný web websano.sk) a bezplatný limit by sa delil s ním.

## Rozhodnutia

### Účty a prihlásenie
- Registrácia: **spoločný pozývací kód** (určí majiteľ, dá sa zmeniť; uložený v databáze, nikdy nie v kóde – repo je verejné) + **prezývka** + **6-miestny PIN** (zadáva sa 2× pre kontrolu). Kód kontroluje server, nie len appka.
- Prezývka: 3–20 znakov, písmená vrátane diakritiky, čísla, podčiarkovník; nezáleží na veľkosti písmen („Marek“ = „marek“).
- Po prihlásení ostáva používateľ prihlásený natrvalo; PIN treba len na novom zariadení. Bez e-mailu a bez Googlu.
- Profil: len prezývka.
- Zabudnutý PIN: majiteľ ako admin dostane v Nastaveniach tlačidlo „Resetovať PIN“ (Fáza 7); dovtedy reset robí Claude ručne na požiadanie.

### Ciele a onboarding
- Bez vekového limitu. Mladší ako 18 rokov: žiadny deficit (udržiavací príjem alebo mierny prebytok).
- Jednotky kg a cm, týždeň začína pondelkom, čas Europe/Bratislava.

### Jedlo
- Sledujeme **kcal, bielkoviny, sacharidy aj tuky**. Výrazne zobrazovať „Zostáva X kcal“ (aby každý vedel, koľko si ešte môže dovoliť). Cukor a soľ zvlášť nesledujeme.
- Zdroje potravín: skenovanie čiarových kódov kamerou + bezplatná databáza **Open Food Facts**, vlastný zoznam ~100 bežných nebalených potravín (orientačné hodnoty z verejných tabuliek), čo sa nenájde, zadá sa raz ručne a appka si to zapamätá.
- Hodnoty na 100 g → množstvo v gramoch, s rýchlymi tlačidlami („1 ks“, „1 porcia“, „100 g“).

### Používanie
- Appka potrebuje internet (bez offline režimu).
- Inštalácia ako appka na plochu (PWA). Natívna appka v App Store nie – stojí 99 $/rok a všetko má byť zadarmo.
- Návod „Pridaj si Fit denník na plochu“ sa ukáže na iPhone aj Androide pri každom otvorení v prehliadači (kým nie je appka na ploche), s tlačidlom „Pokračovať v prehliadači“. Na počítači sa neukáže.

### Vzhľad
- Názov appky: **Fit denník**. Ikona: **blesk** s fialovou žiarou na čiernom (`public/icons/`, zdroj `public/icons/icon.svg`).
- Štýl podľa vzoru, ktorý dodal majiteľ: **čierna s fialovou žiarou**, veľké tenké čísla, zaoblené karty (radius 24 px), **oranžová** na hlavné akcie (tlačidlá „Pridať“).
- Písmo **Sora** (300/400/600, uložené v appke cez `@fontsource/sora`).
- Farby živín: bielkoviny fialová, sacharidy oranžová, tuky ružová.
- Svetlý aj tmavý režim podľa telefónu; vo svetlom režime ostáva hlavná karta tmavá s fialovou žiarou.
- Farby sú ako premenné v `src/styles/global.css`.
- iOS horný pruh: `apple-mobile-web-app-status-bar-style = default` – treba overiť na skutočnom iPhone vo svetlom aj tmavom režime.

## Stav

- [x] Fáza 0 – otázky
- [x] Fáza 1 – návrh riešenia a vzhľadu
- [ ] Fáza 2 – kostra a prihlásenie
  - [x] 2.1 Kostra: navigácia Jedlo / Tréning / Progres / Nastavenia, prázdne sekcie (PR #1)
  - [x] 2.2 Appka na plochu: ikona, úvodné obrazovky, manifest, návod na pridanie (PR #2)
  - [ ] 2.3 Databáza: Supabase projekt vo Frankfurte, prepojenie s appkou ← **rozpracované**: projekt založený a overený; prepojenie s appkou čaká na povolenie npm v sieti. V appke sa nemá nič viditeľne zmeniť (spojenie overí Claude, rozhodol majiteľ).
  - [ ] 2.4 Registrácia (pozývací kód + prezývka + PIN), prihlásenie, odhlásenie
- [ ] Fáza 3 – onboarding a výpočet cieľov
- [ ] Fáza 4 – Jedlo
- [ ] Fáza 5 – Tréning
- [ ] Fáza 6 – Progres a grafy
- [ ] Fáza 7 – Nastavenia, doladenie, prípadne sociálne funkcie (otázka, čo majú kamaráti navzájom vidieť – len sa spýtať, nestavať)

### Čaká na majiteľa (pripomenúť)
- Vyskúšať ostrú verziu na iPhone (`dccf2f4b.vercel.app`): pridať na plochu, skontrolovať ikonu, úvodnú obrazovku a horný pruh vo svetlom aj tmavom režime.
- Povoliť v nastaveniach prostredia sieť pre **balíčky (npm, `registry.npmjs.org`)** – nechať zapnutý predvolený zoznam správcov balíčkov. Bez toho sa appka v kontajneri nedá zostaviť.

## Prostredie (cloud session)

- Sieť kontajnera musí povoliť `*.supabase.co`, `api.supabase.com`, `world.openfoodfacts.org`, `*.vercel.app` a predvolený zoznam správcov balíčkov (`registry.npmjs.org`), inak sa appka nedá zostaviť ani otestovať. Nastavuje sa v nastaveniach prostredia (Network access → Custom → Allowed domains + predvolené balíčky). Stav 3. 10. 2026: Supabase, Open Food Facts a Vercel fungujú, `registry.npmjs.org` je zablokovaný.
- Snímky sa robia Playwrightom s prehliadačom `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (Playwright nainštaluj mimo repa).
