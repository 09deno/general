# Pôvodné zadanie

Text zadania tak, ako ho napísal majiteľ projektu na začiatku. Neskoršie rozhodnutia, ktoré ho spresňujú alebo menia, sú v [`CLAUDE.md`](../CLAUDE.md) – pri rozpore platí `CLAUDE.md`.

---

Budeme spolu postupne vytvárať mobilnú webovú appku „Fit denník“ – tracker jedla a tréningu pre mňa a mojich kamarátov. Celé rozhranie po slovensky.

## Pravidlá spolupráce (dodržuj vždy)
- Postupuj pomaly, vždy len jeden malý krok naraz.
- Skôr ako začneš niečo stavať, polož mi otázky ku všetkému, čo nie je jasné. Radšej sa spýtaj viackrát, ako by si mal hádať.
- Nikdy nerob viac, ako je v aktuálnom kroku. Nepridávaj funkcie, o ktoré som nežiadal.
- Po každom kroku sa zastav, stručne zhrň, čo si spravil, a počkaj na moje potvrdenie alebo pripomienky. Až potom pokračuj.
- Keď máš návrh na vylepšenie, navrhni ho ako otázku, nerealizuj ho sám.

## Používatelia
- Appku bude používať viac ľudí (ja a kamaráti, zväčša mladí chalani, čo chodia do fitka alebo športujú).
- Každý má vlastný účet a jeho dáta sú súkromné. Ostatní ich nevidia, pokiaľ to neskôr výslovne nepovolíme.
- Funguje na mobile aj na počítači, dáta sa synchronizujú.

## Úvodné nastavenie (onboarding)
Pri prvom spustení sa používateľa spýtaj: vek, pohlavie, výška, váha, aktivita (koľkokrát týždenne trénuje + iný šport), cieľ (nabrať svaly / rekompozícia / udržať / schudnúť).
- Z toho vypočítaj denný cieľ kcal (Mifflin-St Jeor × koeficient aktivity, upravený podľa cieľa) a bielkovín (1,6–2,2 g na kg).
- Ukáž výsledok s krátkym vysvetlením a nechaj ho ručne upraviť.
- Bezpečnosť: žiadne agresívne deficity. Pri chudnutí max. ~15–20 % pod udržiavací príjem a nikdy pod rozumné minimum. Používateľov mladších ako 18 rokov neveď do deficitu, odporuč im udržiavací príjem alebo mierny prebytok spolu s tréningom.
- Ciele sa dajú neskôr prepočítať (napr. keď sa zmení váha).

## Čo má appka vedieť (celkový cieľ, nie zadanie na jeden krok)

### Jedlo
- Zápis jedla: názov, kcal, bielkoviny (g), čas sa doplní automaticky.
- Rýchle pridanie jedným ťuknutím: preddefinované bežné jedlá + jedlá, ktoré si používateľ zadal ručne.
- Denný prehľad: zjedené vs. cieľ pre kcal aj bielkoviny, zoznam jedál s možnosťou zmazania.
- Prepínanie medzi dňami (aj spätný zápis).

### Tréning
- Tréning = dátum + typ (fitko / šport / iné) + voliteľná poznámka.
- Fitko: cviky → série → opakovania × váha (kg). Rýchle pridanie série s predvyplnením z minulého tréningu.
- Knižnica cvikov: bežné cviky vopred + možnosť pridať vlastný.
- Šport: druh a dĺžka (min).
- Pri cviku zobraz výkon z minulého tréningu.

### Progres
- Telesné merania: váha a obvod pása (cca 1× týždenne).
- Grafy: váha a pás v čase, priemerné kcal a bielkoviny za týždeň, progres vybraného cviku (najťažšia séria, odhadované 1RM).
- Osobné rekordy (PR) pri cvikoch, zvýraznenie pri novom rekorde.
- Týždenný súhrn: počet tréningov, dni so splneným cieľom, zmena váhy.

### Technické požiadavky
- Mobile-first, ovládateľné jednou rukou, veľké tlačidlá, minimum písania.
- Prihlásenie a trvalé ukladanie dát na serveri (navrhni vhodné riešenie a spýtaj sa ma, skôr ako ho zvolíš).
- Spodná navigácia: Jedlo / Tréning / Progres / Nastavenia.
- Svetlý aj tmavý režim podľa systému.
- Výrazný, športový dizajn, nie generický šablónový vzhľad.

## Otvorené otázky na neskôr (nestavaj, len sa ma spýtaj vo vhodnej fáze)
- Majú sa kamaráti navzájom vidieť? Napríklad počet tréningov za týždeň, rebríček, spoločné výzvy, porovnanie PR.
- Ak áno, čo presne má byť viditeľné a čo zostáva súkromné?

## Postup po fázach
- Fáza 0: Prečítaj si zadanie a polož mi otázky. Nič zatiaľ nestavaj.
- Fáza 1: Navrhni technické riešenie (prihlásenie, databáza, hosting) a vzhľad (farby, písmo, rozloženie) slovne. Počkaj na schválenie.
- Fáza 2: Kostra appky + prihlásenie.
- Fáza 3: Onboarding a výpočet cieľov.
- Fáza 4: Sekcia Jedlo.
- Fáza 5: Sekcia Tréning.
- Fáza 6: Sekcia Progres a grafy.
- Fáza 7: Nastavenia, doladenie, prípadne sociálne funkcie.

Pred každou fázou sa ma spýtaj na detaily k nej. Po každej fáze sa zastav a čakaj na mňa.
