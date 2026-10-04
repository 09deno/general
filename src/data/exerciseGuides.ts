// „Ako na to?“ ku každému cviku zo zoznamu – pár krátkych krokov po slovensky.
// Fotky (začiatok a koniec pohybu) sú v public/exercises/<kľúč>-0.webp a -1.webp,
// z voľnej databázy free-exercise-db (public domain, github.com/yuhonas/free-exercise-db).

// cviky zo zoznamu, ku ktorým fotka nie je
const NO_PHOTO = new Set(['machine-lateral-raise', 'burpees'])

// vlastné cviky (custom:…) fotku ani návod nemajú
export const hasPhoto = (key: string) => key in GUIDES && !NO_PHOTO.has(key)

export const GUIDES: Record<string, string[]> = {
  // Hrudník
  'bench-press': [
    'Ľahni si na lavicu, chodidlá pevne na zemi, lopatky stiahni k sebe.',
    'Činku chyť o niečo širšie ako ramená a pomaly ju spusti na spodnú časť hrudníka.',
    'Vytlač ju späť nahor. Lakte drž asi 45° od tela, nie úplne do strán.',
  ],
  'incline-bench-press': [
    'Lavicu nastav na 30–45°, lopatky stiahni k sebe.',
    'Činku spúšťaj pomaly na hornú časť hrudníka.',
    'Vytlač ju nahor nad ramená, zadok nechaj na lavici.',
  ],
  'decline-bench-press': [
    'Ľahni si na negatívnu lavicu, nohy zapri za valce.',
    'Činku spúšťaj pomaly na spodok hrudníka.',
    'Vytlač ju späť nahor. S podaním činky si nechaj pomôcť.',
  ],
  'dumbbell-bench-press': [
    'Sadni si s jednoručkami na stehnách, ľahni si a zdvihni ich nad hrudník.',
    'Spúšťaj ich pomaly po bokoch hrudníka, lakte asi 45° od tela.',
    'Vytlač ich späť nahor, hore sa takmer stretnú.',
  ],
  'incline-dumbbell-press': [
    'Lavicu nastav na 30–45°, jednoručky drž nad hornou časťou hrudníka.',
    'Pomaly ich spusti po bokoch hrudníka.',
    'Vytlač ich nahor, chrbát a zadok ostávajú na lavici.',
  ],
  'decline-dumbbell-press': [
    'Ľahni si na negatívnu lavicu, nohy zapri za valce.',
    'Jednoručky spúšťaj pomaly k spodku hrudníka.',
    'Vytlač ich nahor nad hrudník.',
  ],
  'smith-bench-press': [
    'Lavicu daj pod tyč tak, aby šla na spodok hrudníka.',
    'Odisti tyč otočením zápästí a pomaly ju spusti k hrudníku.',
    'Vytlač ju nahor a na konci série ju znova zaisti na háky.',
  ],
  'smith-incline-press': [
    'Šikmú lavicu (30–45°) postav pod tyč tak, aby šla na hornú časť hrudníka.',
    'Odisti tyč a pomaly ju spusti k hrudníku.',
    'Vytlač ju nahor a na konci ju zaisti na háky.',
  ],
  'chest-press-machine': [
    'Sedadlo nastav tak, aby rukoväte boli vo výške stredu hrudníka.',
    'Chrbát opri o operadlo, lopatky stiahni k sebe.',
    'Tlač rukoväte dopredu, lakte nezamykaj a pomaly ich vráť späť.',
  ],
  'incline-machine-press': [
    'Sedadlo nastav tak, aby rukoväte boli vo výške hornej časti hrudníka.',
    'Tlač rukoväte šikmo nahor, chrbát drž na operadle.',
    'Pomaly ich vráť späť, kým necítiš natiahnutie v hrudníku.',
  ],
  'dumbbell-fly': [
    'Ľahni si na lavicu, jednoručky drž nad hrudníkom, lakte mierne pokrčené.',
    'Oblúkom ich spúšťaj do strán, kým necítiš natiahnutie v hrudníku.',
    'Rovnakým oblúkom ich vráť nahor, ako keby si objímal strom.',
  ],
  'incline-dumbbell-fly': [
    'Lavicu nastav na 30°, jednoručky drž nad hrudníkom, lakte mierne pokrčené.',
    'Spúšťaj ich oblúkom do strán po natiahnutie v hrudníku.',
    'Oblúkom ich vráť nahor. Ber ľahšie váhy ako pri tlakoch.',
  ],
  'pec-deck': [
    'Sedadlo nastav tak, aby rukoväte boli vo výške hrudníka.',
    'Chrbát opri o operadlo, lakte mierne pokrčené.',
    'Spájaj rukoväte pred hrudníkom a pomaly ich vracaj späť.',
  ],
  'cable-crossover': [
    'Kladky daj hore, chyť rukoväte a urob malý krok dopredu.',
    'Mierne sa predkloň, lakte nechaj mierne pokrčené.',
    'Ťahaj rukoväte oblúkom dole pred seba, kým sa nestretnú, a pomaly ich vráť.',
  ],
  'low-cable-fly': [
    'Kladky daj dole, chyť rukoväte a urob krok dopredu.',
    'Ťahaj ich oblúkom zdola nahor pred hrudník, lakte mierne pokrčené.',
    'Hore ich spoj vo výške brady a pomaly vráť dole.',
  ],
  'dumbbell-pullover': [
    'Ľahni si na lavicu, jednoručku drž oboma rukami nad hrudníkom.',
    'S mierne pokrčenými lakťami ju spúšťaj oblúkom za hlavu.',
    'Keď cítiš natiahnutie, vráť ju rovnakým oblúkom nad hrudník.',
  ],
  'push-up': [
    'Ruky polož o niečo širšie ako ramená, telo drž rovno ako dosku.',
    'Spúšťaj sa, kým hrudník nie je takmer pri zemi, lakte asi 45° od tela.',
    'Vytlač sa späť hore. Keď je to ťažké, rob kliky na kolenách.',
  ],
  dips: [
    'Opri sa o bradlá, ruky vystreté, mierne sa predkloň.',
    'Spúšťaj sa, kým nemáš lakte asi v pravom uhle.',
    'Vytlač sa späť hore. Predklon viac zapojí hrudník.',
  ],

  // Chrbát
  'pull-up': [
    'Chyť hrazdu nadhmatom o niečo širšie ako ramená.',
    'Ťahaj sa hore, kým brada nie je nad hrazdou, lopatky ťahaj dole.',
    'Pomaly sa spusti do vystretých rúk. Nehojdaj sa.',
  ],
  'chin-up': [
    'Chyť hrazdu podhmatom (dlane k sebe) na šírku ramien.',
    'Ťahaj sa hore, kým brada nie je nad hrazdou.',
    'Pomaly sa spusti do vystretých rúk.',
  ],
  'assisted-pull-up': [
    'Na stroji nastav dopomoc – čím viac kíl, tým je to ľahšie.',
    'Kľakni si na plošinu a chyť rukoväte nadhmatom.',
    'Ťahaj sa hore, kým brada nie je nad rukoväťami, a pomaly sa spusti.',
  ],
  'inverted-row': [
    'Ľahni si pod nízko položenú tyč a chyť ju o niečo širšie ako ramená.',
    'Telo drž rovno, päty na zemi.',
    'Ťahaj hrudník k tyči a pomaly sa spusti späť.',
  ],
  'lat-pulldown': [
    'Sadni si, nohy zapri pod valce, tyč chyť široko nadhmatom.',
    'Mierne sa zakloň a ťahaj tyč k hornej časti hrudníka, lakte smerujú dole.',
    'Pomaly ju vráť hore do vystretých rúk.',
  ],
  'close-grip-pulldown': [
    'Nasaď úzku rukoväť a sadni si, nohy pod valcami.',
    'Ťahaj rukoväť k hrudníku, lakte drž pri tele.',
    'Pomaly ju vráť hore.',
  ],
  'straight-arm-pulldown': [
    'Postav sa pred hornú kladku, tyč chyť na šírku ramien.',
    'Mierne sa predkloň, ruky takmer vystreté.',
    'Ťahaj tyč oblúkom dole k stehnám a pomaly ju vráť hore.',
  ],
  'barbell-row': [
    'Činku chyť na šírku ramien, pokrč kolená a predkloň sa s rovným chrbtom.',
    'Ťahaj činku k spodku brucha, lakte popri tele.',
    'Pomaly ju spusti. Chrbát nesmie byť okrúhly.',
  ],
  'pendlay-row': [
    'Činka leží na zemi, predkloň sa s rovným chrbtom takmer vodorovne.',
    'Výbušne ju pritiahni k spodku hrudníka.',
    'Polož ju späť na zem a každé opakovanie začni znova z tejto polohy.',
  ],
  'dumbbell-row': [
    'Jedno koleno a ruku opri o lavicu, chrbát rovný.',
    'Jednoručku ťahaj k bedru, lakeť popri tele.',
    'Pomaly ju spusti dole. Potom vymeň stranu.',
  ],
  'seated-cable-row': [
    'Sadni si, nohy zapri, chrbát rovno.',
    'Rukoväť ťahaj k bruchu, lopatky stiahni k sebe.',
    'Pomaly ju vráť dopredu do vystretých rúk. Nekývaj trupom.',
  ],
  't-bar-row': [
    'Postav sa nad tyč, pokrč kolená a predkloň sa s rovným chrbtom.',
    'Rukoväť ťahaj k hrudníku, lakte popri tele.',
    'Pomaly ju spusti dole.',
  ],
  'chest-supported-row': [
    'Ľahni si bruchom na šikmú lavicu (asi 30°), jednoručky drž dole.',
    'Ťahaj ich k bokom, lopatky stiahni k sebe.',
    'Pomaly ich spusti. Hrudník ostáva na lavici.',
  ],
  'machine-row': [
    'Sedadlo nastav tak, aby rukoväte boli vo výške hrudníka, hrudník opri o opierku.',
    'Ťahaj rukoväte k sebe, lopatky stiahni k sebe.',
    'Pomaly ich vráť dopredu.',
  ],
  deadlift: [
    'Postav sa k činke, chodidlá na šírku bokov, tyč nad stredom chodidiel.',
    'Drepni si, chyť tyč, chrbát rovný, hrudník hore.',
    'Postav sa tlačením nôh do zeme, tyč veď tesne pri nohách. Rovnako ju spusti späť.',
  ],
  'rack-pull': [
    'Tyč polož na stojan asi vo výške kolien.',
    'Chyť ju, chrbát rovný, hrudník hore.',
    'Vystri sa do stoja a pomaly ju vráť na stojan.',
  ],
  'good-morning': [
    'Činku polož na ramená ako pri drepe, kolená mierne pokrčené.',
    'S rovným chrbtom sa predkláňaj, zadok tlač dozadu.',
    'Keď cítiš natiahnutie v zadnej strane stehien, vráť sa hore. Začni s ľahkou váhou.',
  ],
  'back-extension': [
    'Nastav podložku tak, aby boky boli tesne nad jej okrajom, nohy zapri.',
    'Ruky prekrížené na hrudníku, pomaly sa predkloň dole.',
    'Zdvihni sa, kým telo nie je v rovine. Ďalej sa neprehýbaj.',
  ],
  shrugs: [
    'Činku drž pred telom vo vystretých rukách.',
    'Zdvihni ramená čo najvyššie k ušiam.',
    'Chvíľu podrž a pomaly spusti. Ramenami nekrúž.',
  ],
  'dumbbell-shrugs': [
    'Jednoručky drž popri tele vo vystretých rukách.',
    'Zdvihni ramená čo najvyššie k ušiam.',
    'Chvíľu podrž a pomaly spusti.',
  ],

  // Nohy
  squat: [
    'Činku polož na horné svaly chrbta, chodidlá na šírku ramien.',
    'Zadok tlač dozadu a dole, kolená idú smerom ako špičky, chrbát rovný.',
    'Choď aspoň po stehná vodorovne so zemou a vytlač sa hore cez celé chodidlo.',
  ],
  'front-squat': [
    'Činku polož na predné ramená, lakte drž vysoko.',
    'Drepni si s rovným trupom.',
    'Vytlač sa hore, lakte nepúšťaj dole.',
  ],
  'goblet-squat': [
    'Jednoručku alebo kettlebell drž pri hrudníku.',
    'Drepni si, lakte idú medzi kolená, chrbát rovný.',
    'Vytlač sa hore cez päty. Ideálny drep na začiatok.',
  ],
  'hack-squat': [
    'Opri sa chrbtom o stroj, ramená pod opierky, chodidlá na šírku ramien.',
    'Odisti stroj a pomaly si drepni.',
    'Vytlač sa hore, kolená nezamykaj. Na konci stroj zaisti.',
  ],
  'smith-squat': [
    'Postav sa pod tyč, chodidlá daj trochu pred telo.',
    'Odisti tyč a drepni si s rovným chrbtom.',
    'Vytlač sa hore a na konci tyč zaisti na háky.',
  ],
  'bodyweight-squat': [
    'Postav sa, chodidlá na šírku ramien, ruky pred sebou.',
    'Zadok tlač dozadu a dole, kolená idú smerom ako špičky.',
    'Vytlač sa hore cez päty.',
  ],
  'leg-press': [
    'Sadni si, chodidlá daj na plošinu na šírku ramien.',
    'Odisti plošinu a pomaly ju spúšťaj, kým kolená nie sú asi v pravom uhle.',
    'Vytlač ju hore, kolená na konci nezamykaj. Spodok chrbta drž na operadle.',
  ],
  lunges: [
    'Postav sa s jednoručkami popri tele.',
    'Urob veľký krok dopredu a klesni, kým zadné koleno nie je takmer pri zemi.',
    'Odraz sa späť do stoja a vymeň nohu.',
  ],
  'walking-lunges': [
    'Jednoručky drž popri tele (alebo choď bez záťaže).',
    'Kráčaj dopredu veľkými krokmi a pri každom klesni, kým zadné koleno nie je takmer pri zemi.',
    'Trup drž rovno, predné koleno nech nejde dovnútra.',
  ],
  'bulgarian-split-squat': [
    'Zadnú nohu polož nártom na lavicu za sebou.',
    'Klesaj na prednej nohe, kým stehno nie je vodorovne.',
    'Vytlač sa hore cez pätu prednej nohy. Potom vymeň nohy.',
  ],
  'step-up': [
    'Postav sa pred lavicu s jednoručkami popri tele.',
    'Celé chodidlo polož na lavicu a vytlač sa hore.',
    'Pomaly zostúp dole a vymeň nohu.',
  ],
  'romanian-deadlift': [
    'Činku drž pred stehnami, kolená mierne pokrčené.',
    'Zadok tlač dozadu, činka kĺže popri nohách dole, chrbát rovný.',
    'Keď cítiš natiahnutie v zadnej strane stehien (asi pod kolená), vráť sa hore.',
  ],
  'stiff-leg-deadlift': [
    'Činku drž pred stehnami, nohy takmer vystreté.',
    'S rovným chrbtom sa predkláňaj, činku spúšťaj popri nohách.',
    'Po natiahnutie v zadnej strane stehien sa vráť hore. Začni s ľahkou váhou.',
  ],
  'sumo-deadlift': [
    'Postav sa široko, špičky von, tyč nad stredom chodidiel.',
    'Drepni si a chyť tyč medzi nohami, chrbát rovný.',
    'Postav sa tlačením nôh do zeme, tyč veď tesne pri tele.',
  ],
  'leg-extension': [
    'Sadni si, valec daj na spodok holení, kolená pri osi stroja.',
    'Vystri nohy a hore chvíľu podrž.',
    'Pomaly ich spusti späť.',
  ],
  'leg-curl': [
    'Ľahni si na brucho, valec daj nad päty.',
    'Pritiahni päty k zadku.',
    'Pomaly ich spusti. Boky drž na podložke.',
  ],
  'seated-leg-curl': [
    'Sadni si, valec daj pod lýtka nad päty, stehná zaisti opierkou.',
    'Pritiahni päty pod sedadlo.',
    'Pomaly ich vráť dopredu.',
  ],
  'hip-thrust': [
    'Horný chrbát opri o lavicu, činku polož na boky (s podložkou).',
    'Chodidlá daj na zem, kolená pokrčené.',
    'Zdvihni boky, kým telo nie je v rovine, hore stisni zadok a pomaly spusti.',
  ],
  'glute-bridge': [
    'Ľahni si na chrbát, kolená pokrčené, chodidlá na zemi.',
    'Zdvihni boky, kým telo od kolien po ramená nie je v rovine.',
    'Hore stisni zadok a pomaly spusti.',
  ],
  'cable-kickback': [
    'Na spodnú kladku daj manžetu na členok a chyť sa stroja.',
    'S mierne pokrčeným kolenom ťahaj nohu dozadu.',
    'Hore stisni zadok, pomaly vráť a potom vymeň nohu.',
  ],
  'hip-abduction': [
    'Sadni si, opierky daj na vonkajšiu stranu kolien.',
    'Roztláčaj kolená do strán.',
    'Pomaly ich vráť k sebe.',
  ],
  'hip-adduction': [
    'Sadni si, opierky daj na vnútornú stranu kolien.',
    'Stláčaj kolená k sebe.',
    'Pomaly ich vráť do strán.',
  ],
  'calf-raise': [
    'Postav sa špičkami na schod alebo plošinu stroja, päty voľne dole.',
    'Vytlač sa čo najvyššie na špičky.',
    'Hore chvíľu podrž a pomaly spusti päty pod úroveň schodu.',
  ],
  'seated-calf-raise': [
    'Sadni si, špičky daj na plošinu, opierku na stehná.',
    'Zdvihni päty čo najvyššie.',
    'Pomaly ich spusti, kým necítiš natiahnutie v lýtkach.',
  ],

  // Ramená
  'overhead-press': [
    'Postav sa, činku drž na predných ramenách, úchop o niečo širší ako ramená.',
    'Zatni brucho a zadok a vytlač činku nad hlavu.',
    'Pomaly ju spusti späť k ramenám. Nezakláňaj sa.',
  ],
  'dumbbell-shoulder-press': [
    'Sadni si na lavicu s operadlom, jednoručky drž pri ramenách.',
    'Vytlač ich nad hlavu, kým sa takmer nestretnú.',
    'Pomaly ich spusti k ramenám.',
  ],
  'machine-shoulder-press': [
    'Sedadlo nastav tak, aby rukoväte boli vo výške ramien.',
    'Vytlač rukoväte nad hlavu, lakte nezamykaj.',
    'Pomaly ich vráť dole.',
  ],
  'smith-shoulder-press': [
    'Lavicu s operadlom postav pod tyč tak, aby šla tesne pred tvárou.',
    'Odisti tyč a vytlač ju nad hlavu.',
    'Pomaly ju spusti k brade a na konci ju zaisti.',
  ],
  'arnold-press': [
    'Sadni si, jednoručky drž pred tvárou, dlane k sebe.',
    'Pri tlaku nahor otáčaj dlane dopredu.',
    'Nad hlavou ich takmer spoj a pri spúšťaní otoč dlane späť k sebe.',
  ],
  'lateral-raise': [
    'Postav sa, jednoručky popri tele, lakte mierne pokrčené.',
    'Zdvíhaj ich do strán po výšku ramien.',
    'Pomaly ich spusti. Ber ľahké váhy a nehojdaj sa.',
  ],
  'cable-lateral-raise': [
    'Postav sa bokom k spodnej kladke, rukoväť drž vzdialenejšou rukou.',
    'Ťahaj ju do strany po výšku ramena, lakeť mierne pokrčený.',
    'Pomaly ju vráť a potom vymeň ruku.',
  ],
  'machine-lateral-raise': [
    'Sedadlo nastav tak, aby osi stroja boli pri ramenách, lakte opri o opierky.',
    'Zdvíhaj ruky do strán po výšku ramien.',
    'Pomaly ich spusti.',
  ],
  'front-raise': [
    'Postav sa, jednoručky drž pred stehnami.',
    'Zdvihni ich pred seba po výšku ramien, ruky takmer vystreté.',
    'Pomaly ich spusti. Nehojdaj sa trupom.',
  ],
  'upright-row': [
    'Činku drž pred telom, úchop na šírku ramien.',
    'Ťahaj ju popri tele hore k hrudníku, lakte idú vyššie ako ruky.',
    'Pomaly ju spusti. Nechoď vyššie ako po hrudník.',
  ],
  'face-pull': [
    'Lano daj na kladku vo výške tváre a chyť konce.',
    'Ťahaj lano k tvári, lakte idú do strán a hore.',
    'Na konci roztiahni lano od seba, potom ho pomaly vráť.',
  ],
  'reverse-fly': [
    'Predkloň sa s rovným chrbtom, jednoručky visia pod hrudníkom.',
    'Zdvíhaj ich oblúkom do strán, lakte mierne pokrčené.',
    'Pomaly ich spusti. Ber ľahké váhy.',
  ],
  'reverse-pec-deck': [
    'Sadni si čelom k operadlu, rukoväte chyť pred sebou.',
    'Ťahaj ruky oblúkom dozadu do strán.',
    'Pomaly ich vráť pred seba.',
  ],

  // Biceps a predlaktie
  'barbell-curl': [
    'Postav sa, činku drž podhmatom na šírku ramien.',
    'Lakte drž pri tele a zdvihni činku k hrudníku.',
    'Pomaly ju spusti dole. Nehojdaj sa trupom.',
  ],
  'ez-bar-curl': [
    'EZ tyč chyť podhmatom za zahnuté časti.',
    'Lakte pri tele, zdvihni tyč k hrudníku.',
    'Pomaly ju spusti dole.',
  ],
  'dumbbell-curl': [
    'Postav sa, jednoručky popri tele, dlane dopredu.',
    'Lakte pri tele, zdvihni jednoručky k ramenám.',
    'Pomaly ich spusti. Môžeš striedať ruky.',
  ],
  'incline-dumbbell-curl': [
    'Sadni si na šikmú lavicu (asi 45°), ruky voľne visia.',
    'Zdvíhaj jednoručky k ramenám, lakte ostávajú na mieste.',
    'Pomaly ich spusti až do vystretých rúk.',
  ],
  'hammer-curl': [
    'Jednoručky drž popri tele, dlane k sebe (ako kladivo).',
    'Zdvihni ich k ramenám, lakte pri tele.',
    'Pomaly ich spusti dole.',
  ],
  'cable-curl': [
    'Postav sa pred spodnú kladku, tyč chyť podhmatom.',
    'Lakte pri tele, ťahaj tyč k hrudníku.',
    'Pomaly ju vráť dole.',
  ],
  'preacher-curl': [
    'Sadni si k Scottovej lavici, zadnú stranu paží opri o podložku.',
    'Zdvihni činku k ramenám.',
    'Pomaly ju spusti takmer do vystretých rúk.',
  ],
  'concentration-curl': [
    'Sadni si, lakeť opri o vnútornú stranu stehna.',
    'Zdvihni jednoručku k ramenu.',
    'Pomaly ju spusti a potom vymeň ruku.',
  ],
  'spider-curl': [
    'Ľahni si bruchom na šikmú lavicu, ruky voľne visia dole.',
    'Zdvihni činku alebo jednoručky k ramenám.',
    'Pomaly ich spusti dole.',
  ],
  'reverse-curl': [
    'Činku chyť nadhmatom (dlane dole) na šírku ramien.',
    'Lakte pri tele, zdvihni ju k hrudníku.',
    'Pomaly ju spusti. Posilňuje predlaktia.',
  ],
  'wrist-curl': [
    'Sadni si, predlaktia opri o stehná alebo lavicu, zápästia cez okraj.',
    'Činku drž podhmatom a krč zápästia nahor.',
    'Pomaly ich spusti dole.',
  ],

  // Triceps
  'triceps-pushdown': [
    'Postav sa pred hornú kladku, tyč chyť nadhmatom.',
    'Lakte drž pri tele a tlač tyč dole, kým nemáš vystreté ruky.',
    'Pomaly ju vráť nahor, lakte sa nehýbu.',
  ],
  'rope-pushdown': [
    'Lano daj na hornú kladku a chyť konce.',
    'Lakte pri tele, tlač lano dole a na konci ho roztiahni do strán.',
    'Pomaly ho vráť nahor.',
  ],
  'skull-crusher': [
    'Ľahni si na lavicu, EZ tyč drž nad hrudníkom vo vystretých rukách.',
    'Pokrč lakte a spúšťaj tyč k čelu, lakte smerujú hore.',
    'Vystri ruky späť nahor. Začni s ľahkou váhou.',
  ],
  'close-grip-bench': [
    'Ľahni si na lavicu, činku chyť na šírku ramien.',
    'Spúšťaj ju na spodok hrudníka, lakte pri tele.',
    'Vytlač ju nahor.',
  ],
  'overhead-triceps-extension': [
    'Jednoručku drž oboma rukami nad hlavou.',
    'Pokrč lakte a spúšťaj ju za hlavu, lakte smerujú dopredu.',
    'Vystri ruky späť nad hlavu.',
  ],
  'cable-overhead-extension': [
    'Lano daj na kladku, otoč sa chrbtom a lano drž za hlavou.',
    'Urob krok dopredu a mierne sa predkloň.',
    'Vystieraj ruky dopredu nad hlavu a pomaly ich vráť.',
  ],
  'triceps-kickback': [
    'Predkloň sa s oporou o lavicu, nadlaktie drž pri tele vodorovne.',
    'Vystri ruku dozadu.',
    'Pomaly ju pokrč späť a potom vymeň ruku.',
  ],
  'machine-dip': [
    'Sadni si a rukoväte chyť popri tele.',
    'Tlač ich dole, kým nemáš vystreté ruky.',
    'Pomaly ich vráť nahor.',
  ],
  'bench-dips': [
    'Ruky opri o okraj lavice za sebou, nohy daj pred seba.',
    'Spúšťaj sa dole, kým lakte nie sú v pravom uhle.',
    'Vytlač sa hore. S pokrčenými nohami je to ľahšie.',
  ],
  'diamond-push-up': [
    'Ruky daj pod hrudník tak, aby palce a ukazováky tvorili diamant.',
    'Telo drž rovno a spúšťaj sa k rukám, lakte pri tele.',
    'Vytlač sa hore. Na kolenách je to ľahšie.',
  ],

  // Brucho
  crunch: [
    'Ľahni si, kolená pokrčené, ruky na hrudníku alebo pri ušiach.',
    'Zdvihni hlavu a ramená od zeme a vydýchni.',
    'Pomaly sa spusti. Neťahaj sa rukami za hlavu.',
  ],
  'sit-up': [
    'Ľahni si, kolená pokrčené, chodidlá na zemi (môžeš ich zaprieť).',
    'Zdvihni celý trup až do sedu.',
    'Pomaly sa spusti späť.',
  ],
  'bicycle-crunch': [
    'Ľahni si, ruky pri ušiach, nohy zdvihni.',
    'Lakťom choď k opačnému kolenu, druhú nohu vystri.',
    'Striedaj strany ako pri bicyklovaní.',
  ],
  'cable-crunch': [
    'Kľakni si pred hornú kladku, lano drž pri hlave.',
    'Krč trup dole k stehnám, boky sa nehýbu.',
    'Pomaly sa vráť hore.',
  ],
  'hanging-leg-raise': [
    'Zaves sa na hrazdu.',
    'Zdvihni nohy (pokrčené alebo vystreté) čo najvyššie.',
    'Pomaly ich spusti a nehojdaj sa.',
  ],
  'lying-leg-raise': [
    'Ľahni si na chrbát, ruky daj pod zadok alebo popri tele.',
    'Zdvihni vystreté nohy až nad boky.',
    'Pomaly ich spusti, kríže drž pri zemi.',
  ],
  'russian-twist': [
    'Sadni si, mierne sa zakloň, nohy pokrčené (môžu byť vo vzduchu).',
    'Otáčaj trup zo strany na stranu, ruky (alebo záťaž) idú k zemi popri bokoch.',
    'Chrbát drž rovno.',
  ],
  'ab-wheel': [
    'Kľakni si a koliesko drž pod ramenami.',
    'Pomaly sa vyroluj dopredu, chrbát rovný, brucho zatnuté.',
    'Vráť sa späť silou brucha. Choď len tak ďaleko, ako zvládneš.',
  ],
  'mountain-climber': [
    'Opri sa ako na klik, telo rovno.',
    'Rýchlo striedaj kolená k hrudníku.',
    'Boky drž dole, nezdvíhaj zadok.',
  ],
  'dead-bug': [
    'Ľahni si na chrbát, ruky hore, kolená pokrčené nad bokmi.',
    'Naraz spúšťaj opačnú ruku a nohu k zemi, kríže drž pri zemi.',
    'Vráť ich späť a vymeň strany.',
  ],
  plank: [
    'Opri sa o predlaktia a špičky, lakte pod ramenami.',
    'Telo drž rovno ako dosku, zatni brucho a zadok.',
    'Vydrž, nedvíhaj zadok ani neprehýbaj chrbát.',
  ],
  'side-plank': [
    'Ľahni si na bok a opri sa o predlaktie, lakeť pod ramenom.',
    'Zdvihni boky, aby telo bolo v rovine.',
    'Vydrž a potom vymeň stranu.',
  ],

  // Celé telo
  'kettlebell-swing': [
    'Postav sa trochu širšie ako na šírku bokov, kettlebell drž oboma rukami.',
    'Pokrč kolená, zadok tlač dozadu a kettlebell pusti medzi nohy.',
    'Výbušne vystri boky a vyšvihni ho po výšku hrudníka. Silu dávajú boky, nie ruky.',
  ],
  'clean-and-press': [
    'Činku výbušne vytiahni zo zeme na ramená (nadhod).',
    'Chvíľu stoj stabilne.',
    'Vytlač ju nad hlavu a pomaly ju vráť dole.',
  ],
  'power-clean': [
    'Činka leží na zemi, postoj je ako pri mŕtvom ťahu.',
    'Výbušne ju ťahaj hore, podsadni sa pod ňu a chyť ju na predných ramenách.',
    'Postav sa. Techniku sa najprv nauč s prázdnou tyčou.',
  ],
  thruster: [
    'Činku alebo jednoručky drž na ramenách.',
    'Drepni si.',
    'Pri vstávaní z drepu plynulo vytlač záťaž nad hlavu.',
  ],
  'sled-push': [
    'Chyť rukoväte saní, predkloň sa, ruky natiahnuté.',
    'Tlač sane dopredu krátkymi silnými krokmi.',
    'Chrbát drž rovno.',
  ],
  'farmers-walk': [
    'Zdvihni ťažké jednoručky alebo kettlebelly popri tele.',
    'Choď vzpriamene krátkymi krokmi, ramená dole.',
    'Prejdi stanovenú vzdialenosť a potom záťaž polož.',
  ],
  burpees: [
    'Z postoja si drepni a ruky polož na zem.',
    'Vyskoč nohami dozadu do polohy na klik (klik môžeš aj urobiť).',
    'Skoč nohami späť k rukám a vyskoč hore s rukami nad hlavou.',
  ],
  'box-jump': [
    'Postav sa pred debnu, chodidlá na šírku bokov.',
    'Švihni rukami a vyskoč na debnu, dopadni mäkko do podrepu.',
    'Postav sa a zostúp dole (nezoskakuj).',
  ],
  'battle-ropes': [
    'Chyť konce lán a mierne pokrč kolená.',
    'Rýchlo striedavo švihaj rukami hore a dole, aby po lanách išli vlny.',
    'Trup drž stabilne a dýchaj.',
  ],
  'jump-rope': [
    'Švihadlo drž pri bokoch, lakte pri tele.',
    'Krúť švihadlom zápästiami a skáč nízko na špičkách.',
    'Začni pomaly, potom zrýchli.',
  ],
}
