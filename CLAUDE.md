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
  - Aktualizácia: `registerSW` v `src/main.tsx` – nová verzia sa stiahne na pozadí a appka sa sama znovu načíta; kontroluje sa aj pri návrate do appky z pozadia. (Do 3. 10. 2026 sa nová verzia ukázala až po ďalšom obnovení – majiteľ preto pri 3.1 nevidel úvodné otázky.)
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
- **Jeden postup bez výberu** (žiadna obrazovka „Prihlásiť / Registrovať“): **pozývací kód** → **prezývka** → ak prezývka už existuje, zadá svoj **PIN raz** (prihlásenie, aj na novom zariadení); ak nie, vyberie si **6-miestny PIN** a zopakuje ho (nový účet). Potom je prihlásený.
- Pozývací kód: slovo, ktoré určil majiteľ, dá sa zmeniť. Je **len v databáze** (tabuľka `app_settings`, kľúč `invite_code`), nikdy v kóde, repe ani v PR – repo je verejné. Pri zadávaní nezáleží na veľkosti písmen ani diakritike.
- Blokovanie: po **5 nesprávnych pokusoch** sa prihlasovanie na **15 minút** zablokuje – pozývací kód podľa IP adresy, PIN podľa účtu.
- Kód, prezývku aj PIN kontroluje server, nie len appka.
- Prezývka: 3–20 znakov, písmená vrátane diakritiky, čísla, podčiarkovník; nezáleží na veľkosti písmen („Marek“ = „marek“).
- Po prihlásení ostáva používateľ prihlásený natrvalo; PIN treba len na novom zariadení. Bez e-mailu a bez Googlu. **Odhlásenie appka nemá** (rozhodol majiteľ 3. 10. 2026).
- Profil: len prezývka.
- Zabudnutý PIN: majiteľ ako admin dostane v Nastaveniach tlačidlo „Resetovať PIN“ (Fáza 7); dovtedy reset robí Claude ručne na požiadanie (nové heslo v `auth.users` pre účet z `profiles`, a zmazať jeho riadok v `failed_attempts`).
- Technicky: registráciu a prihlásenie robí serverová funkcia **`login`** (`supabase/functions/login`, nasadená cez konektor s `verify_jwt = false`). Účet v Supabase Auth má **náhodný vnútorný e-mail** `…@fit-dennik.invalid` (nikam sa neposiela) a heslo = PIN; prezývka je v `profiles`. Migrácie databázy sú v `supabase/migrations/` (aplikované cez konektor).
- V Supabase Auth **nechať zapnuté „Confirm email“** – inak by sa dal účet založiť mimo appky bez pozývacieho kódu.

### Ciele a onboarding
- **Hlavná zásada majiteľa (platí pre celú appku): čo najjednoduchšie a najzrozumiteľnejšie, aby to zvládol aj úplný amatér.** Obyčajné slová namiesto odborných, minimum písania, zložitosť riešiť v pozadí.
- Úvodné otázky sa ukážu raz po registrácii a nedajú sa preskočiť. Jedna otázka na obrazovku, veľké ťukacie tlačidlá: pohlavie (Muž / Žena) → vek (ukladá sa ako rok narodenia) → výška → váha → „Ako často športuješ?“ (fitko aj iný šport dokopy: skoro vôbec / 1–2× / 3–4× / 5× a viac / **Chcem to rozpísať**) → cieľ: Schudnúť / Spevniť postavu (= rekompozícia) / Udržať váhu / Nabrať svaly.
- „Chcem to rozpísať“: zvlášť koľkokrát do týždňa fitko a iný šport (0–14) a práca/škola (väčšinou sedím / veľa chodím alebo stojím / fyzická práca); appka ukáže „Vychádza ti: … aktivita“. Tréningy spolu určia stupeň ako bežné možnosti (0 / 1–2 / 3–4 / 5+), státie/chodenie pridá 1 stupeň, fyzická práca 2; najvyšší stupeň „veľmi vysoká“ (1,9) existuje len takto. Uložené v `goals` (`gym_per_week`, `sport_per_week`, `job`; prázdne pri bežnej možnosti).
- **Bez umelej inteligencie** (rozhodol majiteľ 3. 10. 2026): vlastné odpovede písaným textom sa nerobia, appka nič neposiela AI službám.
- Výsledok: jedno veľké číslo kcal, pod ním bielkoviny, sacharidy, tuky a 1–2 vety po ľudsky. Ručná úprava je skrytá pod „Upraviť ručne“ (kcal po 50, bielkoviny po 5 g).
- Výpočet (`src/lib/goals.ts`): Mifflin-St Jeor × aktivita (1,2 / 1,375 / 1,55 / 1,725 / 1,9) = koľko denne spáli. Cieľ: schudnúť −15 %, spevniť −5 %, udržať 0, nabrať +10 %. Bielkoviny na kg: 2,0 / 2,0 / 1,6 / 1,8 (najviac 40 % kalórií). Tuky 25 % kalórií, zvyšok sacharidy. Zaokrúhlenie kcal na 50, gramy na 5.
- Bezpečnosť: nikdy pod 1 500 kcal (muž) / 1 200 kcal (žena), ani pri ručnej úprave. Bez vekového limitu; mladší ako 18 rokov nikdy pod udržiavací príjem – pri „schudnúť“ a „spevniť“ dostanú udržiavací príjem s vysvetlením.
- Uloženie: tabuľka `goals` (odpovede + ciele), každý vidí a mení len svoje.
- Jednotky kg a cm, týždeň začína pondelkom, čas Europe/Bratislava.

### Jedlo
- Deň sa delí na **Raňajky / Desiata / Obed / Olovrant / Večera / Snack**. Pri pridaní appka jedlo **predvyberie podľa času** (do 10:00 raňajky, do 11:30 desiata, do 14:30 obed, do 17:00 olovrant, potom večera), dá sa jedným ťuknutím zmeniť (obed býva aj o 11 či o 15). **Snack** (želanie majiteľa) sa nepredvyberá nikdy – môže byť kedykoľvek.
- Hlavná karta: veľké „Zostáva X kcal“, pruh zjedeného a bielkoviny / sacharidy / tuky „zjedené / cieľ“. Pri prekročení **pokojne** „Nad cieľom o X kcal“ oranžovou (rozhodol majiteľ).
- Prepínanie dní šípkami (spätný zápis áno, do budúcnosti nie); deň je v adrese `/jedlo?den=YYYY-MM-DD`. Zoznam podľa jedál so súčtom; mazanie ikonou koša s potvrdením „Zmazať? / Nie“.
- Uloženie: tabuľka `food_entries` (deň podľa Europe/Bratislava), každý vidí, pridáva a maže len svoje.
- **Prísady k jedlu:** po výbere jedla „+ Pridať prísadu“ (napr. cestoviny + paradajková omáčka + parmezán); uloží sa **ako jeden riadok** so súčtom (rozhodol majiteľ), názov „A + B + C“.
- Zoznam potravín (`src/data/foods.ts`, ~400 položiek vrátane omáčok, prísad, jedál a menu z podnikov): bežné potraviny **aj varené jedlá** zo školskej jedálne, reštaurácie a rozvozu (guláš, sviečková, rezeň, halušky, pizza, kebab…) s porciami („1 ks“, „1 porcia“, „1 tanier“ + „100 g“). Orientačné hodnoty na 100 g / 100 ml; vyhľadávanie bez diakritiky a aj podľa iných názvov. Pri zápise sa ukladá aj množstvo (`grams`) a jednotka (`unit` g/ml). Čo sa nenájde, zadá sa ručne.
- **Najčastejšie a vlastné jedlá:** v „Pridať jedlo“ je navrchu „Často ješ“ (najviac 6, z posledných 60 dní, najčastejšie navrchu) a pri hľadaní „Tvoje jedlá“ – jedným ťuknutím (oranžové +) sa pridajú s hodnotami z posledného zápisu k zvolenému jedlu dňa. Tak si appka pamätá aj jedlá zadané ručne (žiadna zvláštna tabuľka – číta sa z `food_entries`).
- **Zopakovať jedlo (4.8):** v „Pridať jedlo“ (kým sa nič nehľadá) je nad „Často ješ“ blok **„Naposledy na raňajky / obed … · deň“** – čo si mal naposledy na zvolené jedlo pred týmto dňom (najviac 60 dní dozadu). Prepnutím jedla sa ukáže iné. Položky sú **zaškrtnuté**, čo si nemal, odškrtneš, potom „Pridať všetko / Pridať vybrané · X kcal“ (rozhodol majiteľ). Pridajú sa ako samostatné riadky k zvolenému jedlu a dňu.
- **Recepty a uložené jedlá (4.9):** len vlastné (každý vidí iba svoje, rozhodol majiteľ), tabuľka `recipes` (názov, počet porcií, suroviny ako JSON s hodnotami pre zadané množstvo). Dva spôsoby (rozhodol majiteľ – oboje):
  - **Nový recept zo surovín** – v „Pridať jedlo“ tlačidlo „+ Nový recept“ (`/jedlo/recepty/novy`): názov, „Na koľko porcií?“ (1–20, predvolené 4), suroviny zo zoznamu potravín s gramami alebo zadané ručne; ukáže hodnoty 1 porcie a celého receptu. Upraviť / zmazať cez „Upraviť recept“ (`/jedlo/recepty/<id>`).
  - **Uložiť zjedené pod názvom** – na obrazovke Jedlo pri každom jedle dňa „Uložiť“ (napr. dnešné raňajky ako „Môj ovsák“); uloží sa ako recept na 1 porciu.
  - Pridanie: v „Pridať jedlo“ sekcia „Tvoje recepty a uložené jedlá“ (aj vo vyhľadávaní) → **½ / 1 / 1½ / 2 porcie** ťuknutím (bez váženia, rozhodol majiteľ) → uloží sa ako jeden riadok, napr. „Mamina sviečková (1½ porcie)“.
- **Čiarový kód (4.6):** v „Pridať jedlo“ tlačidlo „Naskenovať čiarový kód“ → zadná kamera (knižnica `barcode-detector` so `zxing-wasm`; súbor .wasm sa servíruje z appky, načíta sa až pri skenovaní; funguje aj na iPhone). Číslo sa dá aj opísať. Hľadá sa najprv v tabuľke `products` (výrobky zadané partiou z obalu, **spoločné pre všetkých** – nie sú to osobné údaje), potom v bezplatnej databáze **Open Food Facts** (pri dopyte treba pýtať aj pole `quantity`, inak nevráti veľkosť balenia). Nenájdený výrobok → formulár „Nový výrobok“ (hodnoty z obalu na 100 g/ml) → uloží sa do `products`. Nebalené potraviny kód nemajú – tie sa hľadajú v zozname.
- **Fotka jedla** (odhad kalórií z fotky): len s umelou inteligenciou, stojí cca 1–2 centy za fotku a je to len odhad. Majiteľ chce **neskôr ako samostatný krok** – bude treba jeho účet u Anthropicu s kreditom (~5 $); kľúč si vloží sám do Supabase (Edge Functions → Secrets), nikdy nie do chatu ani repa.
- **Podniky v Banskej Bystrici** (majiteľ a kamaráti tam študujú) – v zozname s rýchlymi tlačidlami „Podniky v Banskej Bystrici“:
  - **McDonald's** – oficiálne hodnoty na kus z mcdonalds.sk (2026), presne sedia;
  - **KFC** – oficiálna tabuľka KFC (AmRest, 2020; menu sa mení – aktualizovať, keď bude novšia);
  - **Leviathan** (špagety, Europa SC) – kalórie na porciu z leviathan.sk, bielkoviny/sacharidy/tuky odhad podľa omáčky; porcie 400/600/800 g;
  - **Wakaka Poke&Bowl** (Europa SC) – hodnoty neuvádza, všetko **odhad** podľa zloženia a bežnej porcie (bowl ~450–500 g).
  - Jedlo z podniku sa zadáva helperom `piece()` – hodnoty na 1 kus/porciu, hmotnosť kusu len na prepočet.
  - **Menu McDonald's a KFC** (želanie majiteľa, „čo najjednoduchšie“): napr. „McDonald's Big Mac menu“ – po ťuknutí je predvolené **bežné menu** (McD: stredné hranolky + nápoj 0,4 l; KFC: malé hranolky + 0,4 l) s prvým nápojom, takže stačí „Pridať“. Dá sa zmeniť veľkosť (bežné/veľké), nápoj, omáčky (nepovinné) a „+ Pridať niečo navyše“. Uloží sa ako jeden riadok, napr. „McDonald's Big Mac menu: stredné hranolky, Coca-Cola 0,4 l, Kečup“. Definície `MCD_MENU`, `KFC_MENU`, `menuOf()` v `src/data/foods.ts`; nápoje a omáčky majú oficiálne hodnoty. **Omáčky podnikov sú len v menu** (vo vyhľadávaní skryté, `hidden: true`) – želanie majiteľa.
- Fáza 4 po krokoch: 4.1 obrazovka + ručné pridanie → 4.2 vyhľadávanie potravín a varených jedál s gramami → 4.3 prísady + viac jedál → 4.4 jedlá z podnikov v BB → 4.5 najčastejšie jedlá → 4.6 čiarový kód → 4.7 (neskôr) fotka jedla s AI.
- Sledujeme **kcal, bielkoviny, sacharidy aj tuky**. Výrazne zobrazovať „Zostáva X kcal“ (aby každý vedel, koľko si ešte môže dovoliť). Cukor a soľ zvlášť nesledujeme.
- Zdroje potravín: skenovanie čiarových kódov kamerou + bezplatná databáza **Open Food Facts**, vlastný zoznam ~100 bežných nebalených potravín (orientačné hodnoty z verejných tabuliek), čo sa nenájde, zadá sa raz ručne a appka si to zapamätá.
- Hodnoty na 100 g → množstvo v gramoch, s rýchlymi tlačidlami („1 ks“, „1 porcia“, „100 g“).

### Tréning
- **Plán (split):** navrchu **„Vytvoriť vlastný split“** – dni sa ťukajú v poradí (Push, Pull, Legs, Upper, Lower, Full body, Hrudník, Chrbát, Nohy, Ramená, Ruky, Brucho, aj viackrát) alebo sa napíše vlastný názov dňa; majiteľ má napr. Push / Pull / Legs / Upper. Pod tým **11 hotových splitov** (PPL, PPL + Upper, PPL ×2, Upper/Lower, Upper/Lower ×2, ULPPL, PHUL, Arnold, Hrudník+Tri / Chrbát+Bi / Nohy+Ramená, Full body, Bro split) – majiteľovi boli pôvodné 4 „strašne málo“. Dni plánu sa dajú premenovať, pridať a zmazať; názvy dní hotových splitov sú po anglicky ako vo fitku (Push, Pull, Legs, Upper, Lower). Do každého dňa si **sám pridá cviky** zo zoznamu appky (`src/data/exercises.ts`, **118 cvikov** podľa partií – hrudník, chrbát, nohy, ramená, biceps a predlaktie, triceps, brucho, celé telo). **Názvy cvikov sú po anglicky** ako vo fitku (Barbell Bench Press, Lat Pulldown, Romanian Deadlift…) – želanie majiteľa; hľadať sa dá aj po slovensky bez diakritiky (drep, zhyby, benč, bicák, mŕtvy ťah). Kľúče pôvodných cvikov ostali rovnaké, uložené plány sa nerozbijú; chýbajúci si pridá ako **vlastný cvik** (názov, partia, spôsob merania: činka/stroj, vlastná váha, na čas). Tlačidlo **„Pridať vlastný cvik“ je navrchu** pod vyhľadávaním – na konci dlhého zoznamu ho majiteľ nenašiel. Keď nesedia všetky hľadané slová (napr. „seated shoulder press“), ukážu sa podobné cviky s vetou, že presne taký v zozname nie je. Dni hotových splitov sú prázdne (rozhodol majiteľ).
- Uloženie: `training_plans` (split + dni ako JSON, kľúče cvikov: knižnica napr. `bench-press`, vlastný `custom:<id>`), `custom_exercises`; každý vidí len svoje.
- **Obrazovka Tréning (5.2)** je prehľad dňa: šípky dní ako pri jedle (**spätný zápis áno**, rozhodol majiteľ), karta **„Na rade je“** – appka sama navrhne **ďalší deň plánu** po poslednom tréningu (po Push príde Pull, po poslednom dni znova prvý; keď sa plán zmenil, hľadá deň s rovnakým názvom), iný deň sa vyberie čipmi „Iný deň z plánu“ (rozhodol majiteľ). Plán sa upravuje cez „Upraviť plán“ (`/trening/plan`). Prvé otvorenie bez plánu → výber splitu → hneď úprava plánu (pridanie cvikov). Karta „Na rade je“ sa ukáže, len keď v ten deň ešte tréning nie je (jeden tréning na deň).
- **Zápis tréningu** (`/trening/zapis/<id>`): cviky podľa dňa plánu. Série sú **predvyplnené z minulého tréningu** toho cviku (len odcvičené série), cvik robený prvýkrát má **3 prázdne série** (rozhodol majiteľ). Nad sériami „Minule (deň): 60 kg × 10 · …“. Odcvičenú sériu odškrtne **✓** – dá sa, až keď je vyplnené: činka/stroj kg aj opakovania, vlastná váha opakovania (+ nepovinne „navyše kg“), na čas sekundy. „+ Pridať sériu“ (s hodnotami predošlej) a „Odobrať sériu“ (poslednú). Kg s desatinnou čiarkou (22,5).
- Zápis sa **ukladá priebežne** (aj pri prepnutí do inej appky), nič sa nestratí, keď iPhone appku zavrie. „Ukončiť tréning“ vráti na prehľad; tréning bez jedinej ✓ sa zmaže. Zapísaný tréning na prehľade ukazuje odcvičené série, „Pokračovať v tréningu“ (dnes) / „Upraviť tréning“ (iný deň) a mazanie s potvrdením.
- Uloženie: tabuľka `workouts` (deň, `plan_day_id`, názov dňa, cviky ako JSON – kľúč, názov, partia, druh a série `{kg, reps, seconds, done}`; názov sa ukladá, aby história ostala aj po zmene plánu); každý vidí len svoje. Do minulého výkonu a návrhu dňa sa berie posledných 60 tréningov.
- **Upozornenie na stagnáciu** (želanie majiteľa): pri cviku v zápise sa pod „Minule“ ukáže oranžová rada, keď cvik **3 tréningy po sebe nešiel hore** (dva najnovšie nie sú lepšie ako ten pred nimi). Výkon tréningu = najlepšia séria; kilá a opakovania sa zrátajú do jedného čísla (odhad maxima na 1 opakovanie kg × (1 + opakovania / 30)), pri vlastnej váhe sa telo ráta ako 75 kg, pri cviku na čas sekundy. Rada: činka „pridať 2,5 kg alebo 1 opakovanie“, vlastná váha „o 1 opakovanie viac“, na čas „o 5 sekúnd dlhšie“. Ďalšie navrhnuté merania (súhrn po tréningu, série na partie za týždeň, pravidelnosť) majiteľ zatiaľ nechcel.
- Tréningy **nepridávajú kalórie** k „Zostáva X kcal“ – denný cieľ už počíta s aktivitou (rozhodol majiteľ).
- Fáza 5 po krokoch: 5.1 plán (split) a cviky → 5.2 zápis tréningu podľa dňa plánu (série opakovania × kg, minulý výkon a predvyplnenie) → 5.3 šport/iné (druh + minúty) a história tréningov.

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
- [x] Fáza 2 – kostra a prihlásenie
  - [x] 2.1 Kostra: navigácia Jedlo / Tréning / Progres / Nastavenia, prázdne sekcie (PR #1)
  - [x] 2.2 Appka na plochu: ikona, úvodné obrazovky, manifest, návod na pridanie (PR #2)
  - [x] 2.3 Databáza: Supabase projekt vo Frankfurte, prepojenie s appkou cez `src/lib/supabase.ts` (PR #5). Spojenie overil Claude 3. 10. 2026 (prihlasovací server aj databáza odpovedajú, verejný kľúč platí); v appke sa nič viditeľne nezmenilo (rozhodol majiteľ).
  - [x] 2.4 Registrácia a prihlásenie jedným postupom (pozývací kód + prezývka + PIN), blokovanie po 5 zlých pokusoch, bez odhlásenia (PR #6)
- [x] Fáza 3 – onboarding a výpočet cieľov
  - [x] 3.1 Úvodné otázky po registrácii, výpočet a obrazovka „Tvoj denný cieľ“ s ručnou úpravou (PR #7)
  - [x] 3.2 Nastavenia: karta s denným cieľom a tlačidlo „Zmeniť ciele“ – tie isté otázky s predvyplnenými odpoveďami, šípka späť na prvej otázke zruší zmenu, na konci „Uložiť“ (PR #8)
  - [x] 3.3 „Chcem to rozpísať“ pri otázke o športe – fitko, iný šport a práca zvlášť (PR #9)
- [x] Fáza 4 – Jedlo (okrem 4.7 – fotka, odložené)
  - [x] 4.1 Obrazovka Jedlo („Zostáva X kcal“, makroživiny, dni, zoznam podľa jedál, mazanie) a ručné pridanie jedla (PR #10)
  - [x] 4.2 Vyhľadávanie ~150 potravín a varených jedál, gramy/ml a rýchle tlačidlá („1 ks“, „1 porcia“, „100 g“), Snack medzi jedlami (PR #11)
  - [x] 4.3 Prísady k jedlu (jeden riadok so súčtom) a rozšírený zoznam na ~280 položiek (PR #12)
  - [x] 4.4 Jedlá z podnikov v Banskej Bystrici (Wakaka, KFC, McDonald's, Leviathan) s rýchlymi tlačidlami a menu McDonald's/KFC (PR #12)
  - [x] 4.5 Najčastejšie a vlastné jedlá jedným ťuknutím; omáčky podnikov len v menu (PR #13)
  - [x] 4.6 Skenovanie čiarového kódu + Open Food Facts, neznámy výrobok sa zapamätá pre celú partiu (PR #14)
  - [ ] 4.7 (neskôr, platené) Fotka jedla – odhad kalórií umelou inteligenciou
  - [x] 4.8 Zopakovať jedlo: „Naposledy na raňajky / obed …“ so zaškrtnutím položiek (PR #18)
  - [x] 4.9 Vlastné recepty zo surovín s porciami a uloženie zjedeného jedla pod názvom (PR #19)
- [ ] Fáza 5 – Tréning
  - [x] 5.1 Tréningový plán: vlastný split na pár ťuknutí alebo 11 hotových, dni, 118 cvikov s anglickými názvami a vlastné cviky (PR #15)
  - [x] 5.2 Zápis tréningu podľa dňa plánu: návrh ďalšieho dňa, série predvyplnené z minula s ✓, spätný zápis (PR #16)
  - [x] Upozornenie na stagnáciu pri cviku (PR #17)
  - [ ] 5.3 Šport a iné (druh + minúty), história tréningov
  - [ ] 5.4 Obrázok ku cviku a skrytý návod („Ako na to?“ – rozbalí sa až po ťuknutí, želanie majiteľa)
  - [ ] 5.5 „Nový rekord!“ hneď pri odškrtnutí série
- [ ] Fáza 6 – Progres a grafy
  - váha a obvod pása s **vyhladeným trendom váhy**; grafy cvikov, osobné rekordy, týždenný súhrn (podľa zadania)
  - **cieľ kcal sa sám upraví** – podľa trendu váhy a zjedeného appka navrhne zmenu cieľa
  - **fotky progresu** (štartovacia + aktuálne, porovnanie pred / teraz)
  - **týždenná séria** (koľko týždňov v rade podľa plánu; nie denná)
- [ ] Fáza 7 – Nastavenia, doladenie, prípadne sociálne funkcie (otázka, čo majú kamaráti navzájom vidieť – len sa spýtať, nestavať)
  - **pripomienky** (upozornenie v telefóne, napr. „dnes si ešte nič nezapísal“; na iPhone len pre appku na ploche)

### Čaká na majiteľa (pripomenúť)
- Vyskúšať ostrú verziu na iPhone (`dccf2f4b.vercel.app`): pridať na plochu, skontrolovať ikonu, úvodnú obrazovku a horný pruh vo svetlom aj tmavom režime.
- Ak sa bude pracovať v cloud session: povoliť v nastaveniach prostredia sieť pre **balíčky (npm, `registry.npmjs.org`)** – nechať zapnutý predvolený zoznam správcov balíčkov. Bez toho sa appka v kontajneri nedá zostaviť. (Na počítači majiteľa npm funguje.)

### Nápady na neskôr (zatiaľ len návrhy, nestavať bez súhlasu)
- **Fotky progresu** (nápad majiteľa 3. 10. 2026): na začiatku „ilustračná“ (štartovacia) fotka postavy, potom pravidelne aktuálne fotky a porovnanie vedľa seba (pred / teraz). Pravdepodobne do Fázy 6 (Progres). Fotky sú citlivé – len súkromné, každý vidí iba svoje.
  - Z prieskumu: pri fotení ukázať predošlú fotku priesvitne cez kameru („duch“), aby bola póza a vzdialenosť rovnaká; porovnanie vedľa seba alebo posuvníkom. Fotky zmenšiť (~200 kB), bezplatné úložisko Supabase má 1 GB.
- **Prieskum 3. 10. 2026** (MyFitnessPal, MacroFactor, Cronometer, Kalorické tabuľky, Hevy, Strong, štúdie o sebasledovaní). Majiteľ vybral a je to zapísané v Stave: zopakovať jedlo (4.8), uložené jedlá a recepty (4.9), pripomienky (Fáza 7), cieľ sa sám upraví (Fáza 6), obrázok + skrytý návod ku cviku (5.4), „Nový rekord!“ (5.5), fotky progresu, vyhladený trend váhy, týždenná séria (Fáza 6). **Nevybral:** časovač pauzy, obrazovka nezhasne, pitný režim, poznámka ku cviku, kalkulačka kotúčov, rebríček partie, spoločné výzvy. Pôvodný zoznam kandidátov:
  - Jedlo: zopakovať jedlo zo včera jedným ťuknutím; uložené jedlá / vlastné recepty zo surovín; pitný režim; pripomienky (web push – na iPhone len pre appku na ploche, iOS 16.4+); cieľ kcal, ktorý sa sám upravuje podľa trendu váhy (ako MacroFactor).
  - Tréning: časovač pauzy po ✓; obrázok a návod ku cviku (voľná databáza free-exercise-db, public domain, 800+ cvikov s fotkami); obrazovka nezhasne počas tréningu (wake lock, iOS 18.4+); „Nový rekord!“ hneď pri ✓; poznámka ku cviku (napr. „sedadlo na 4“); kalkulačka kotúčov.
  - Progres a partia: vyhladený trend váhy namiesto skákania z dňa na deň; týždenný rebríček partie podľa počtu tréningov; spoločné výzvy; týždenná (nie denná) séria – denné série často demotivujú.
  - Nedá sa v appke na ploche (PWA) na iPhone: kroky / Apple Zdravie, vibrácie.

## Prostredie (cloud session)

- Sieť kontajnera musí povoliť `*.supabase.co`, `api.supabase.com`, `world.openfoodfacts.org`, `*.vercel.app` a predvolený zoznam správcov balíčkov (`registry.npmjs.org`), inak sa appka nedá zostaviť ani otestovať. Nastavuje sa v nastaveniach prostredia (Network access → Custom → Allowed domains + predvolené balíčky). Stav 3. 10. 2026: Supabase, Open Food Facts a Vercel fungujú, `registry.npmjs.org` je zablokovaný.
- Snímky sa robia Playwrightom s prehliadačom `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (Playwright nainštaluj mimo repa).

## Prostredie (počítač majiteľa, Claude desktop)

- Repo je naklonované v `C:\Users\Administrator\Desktop\Claude\general` (Windows, Node 24). npm aj GitHub (`gh`, účet 09deno) fungujú.
- Náhľad: vývojový server `npm run dev` + vstavaný prehliadač Claude desktopu (veľkosť 390×844, svetlý aj tmavý režim) namiesto Playwrightu.
