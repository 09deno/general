// Bežné potraviny a varené jedlá na rýchle vyhľadanie.
// Orientačné hodnoty na 100 g (nápoje na 100 ml) podľa verejných nutričných tabuliek;
// varené jedlá sú priemer bežných receptov – skutočné jedlo sa môže líšiť.

export type Portion = { label: string; grams: number }

export type Food = {
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  portions: Portion[]
  unit: 'g' | 'ml'
  // iné názvy, pod ktorými sa jedlo dá nájsť
  aliases: string
}

type Extra = { unit?: 'ml'; aliases?: string }

function food(
  name: string,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  portions: [string, number][],
  extra: Extra = {},
): Food {
  return {
    name,
    kcal,
    protein,
    carbs,
    fat,
    portions: portions.map(([label, grams]) => ({ label, grams })),
    unit: extra.unit ?? 'g',
    aliases: extra.aliases ?? '',
  }
}

// Jedlo z podniku: hodnoty na 1 kus alebo porciu. Hmotnosť kusu slúži len na prepočet,
// keď niekto zadá vlastné množstvo – „1 ks“ dá presne hodnoty podniku.
function piece(
  name: string,
  grams: number,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  extra: Extra & { portions?: [string, number][]; label?: string } = {},
): Food {
  const per100 = (value: number) => Math.round((value / grams) * 1000) / 10
  const portions = extra.portions ?? [[extra.label ?? '1 ks', grams]]
  return food(name, per100(kcal), per100(protein), per100(carbs), per100(fat), portions, extra)
}

type Sauce = 'cream' | 'tomato' | 'pesto'

// podiel kalórií z bielkovín, sacharidov a tukov podľa typu omáčky (odhad)
const SAUCE_SPLIT: Record<Sauce, [number, number, number]> = {
  cream: [0.14, 0.5, 0.36],
  tomato: [0.15, 0.62, 0.23],
  pesto: [0.1, 0.45, 0.45],
}

function leviathan(name: string, kcalPerPortion: number, portionGrams: number, sauce: Sauce): Food {
  const [protein, carbs, fat] = SAUCE_SPLIT[sauce].map((share, i) => (kcalPerPortion * share) / (i === 2 ? 9 : 4))
  return piece(`Leviathan ${name}`, portionGrams, kcalPerPortion, protein, carbs, fat, {
    aliases: 'leviathan cestoviny spagety europa',
    portions: [['malá', 400], ['stredná', 600], ['veľká', 800]],
  })
}

export const FOODS: Food[] = [
  // ---------- Pečivo, prílohy, obilniny ----------
  food('Chlieb', 250, 8.5, 49, 1.5, [['1 krajec', 40]], { aliases: 'kváskový konzumný' }),
  food('Celozrnný chlieb', 240, 10, 41, 3.5, [['1 krajec', 40]], { aliases: 'tmavý grahamový' }),
  food('Rožok', 285, 9.5, 55, 3, [['1 ks', 45]], { aliases: 'pečivo žemľa' }),
  food('Celozrnné pečivo', 260, 10, 45, 4, [['1 ks', 50]], { aliases: 'grahamový rožok žemľa' }),
  food('Bageta', 270, 9, 55, 1.5, [['1 porcia', 80]], { aliases: 'pečivo' }),
  food('Toastový chlieb', 265, 8, 49, 3.5, [['1 plátok', 25]], { aliases: 'toast' }),
  food('Tortilla (pšeničná placka)', 310, 8, 51, 8, [['1 ks', 60]], { aliases: 'wrap placka' }),
  food('Ovsené vločky', 370, 13, 60, 7, [['1 porcia', 50]], { aliases: 'ovsena kasa' }),
  food('Müsli', 370, 9, 65, 7, [['1 porcia', 50]], { aliases: 'musli granola' }),
  food('Cornflakes', 380, 7, 84, 0.9, [['1 porcia', 40]], { aliases: 'kukuričné lupienky cereálie' }),
  food('Ryžové chlebíky', 390, 8, 81, 3, [['1 ks', 8]], { aliases: 'ryzove' }),
  food('Ryža varená', 130, 2.7, 28, 0.3, [['1 porcia', 200]], { aliases: 'ryza jazmínová basmati' }),
  food('Cestoviny varené', 158, 5.8, 31, 0.9, [['1 porcia', 200]], { aliases: 'špagety penne makaróny' }),
  food('Zemiaky varené', 80, 2, 17, 0.1, [['1 ks', 100], ['1 porcia', 200]], { aliases: 'zemiak' }),
  food('Zemiaková kaša', 100, 2, 15, 3.7, [['1 porcia', 200]], { aliases: 'pyré' }),
  food('Opekané zemiaky', 150, 2.5, 22, 6, [['1 porcia', 200]], { aliases: 'americké pečené' }),
  food('Hranolky', 312, 3.4, 41, 15, [['1 porcia', 150]], { aliases: 'hranolceky' }),
  food('Knedľa (parená)', 230, 7, 46, 1.5, [['1 plátok', 40], ['1 porcia (4 plátky)', 160]], { aliases: 'knedla' }),
  food('Kuskus varený', 112, 3.8, 23, 0.2, [['1 porcia', 200]]),
  food('Bulgur varený', 83, 3, 19, 0.2, [['1 porcia', 200]]),
  food('Quinoa varená', 120, 4.4, 21, 1.9, [['1 porcia', 200]], { aliases: 'kinoa' }),

  food('Kaiserka', 280, 9, 56, 2, [['1 ks', 60]], { aliases: 'žemľa pečivo' }),
  food('Pita chlieb', 275, 9, 56, 1.2, [['1 ks', 60]], { aliases: 'pita' }),
  food('Bagel', 250, 10, 49, 1.5, [['1 ks', 90]]),
  food('Pagáč', 450, 10, 40, 28, [['1 ks', 50]], { aliases: 'pagac' }),
  food('Lievance / pancakes', 230, 6, 30, 9, [['1 ks', 50]], { aliases: 'lievanec pancake' }),
  food('Granola', 470, 10, 60, 20, [['1 porcia', 50]], { aliases: 'musli' }),
  food('Ovsená kaša s mliekom', 110, 4.5, 17, 2.6, [['1 porcia', 250]], { aliases: 'ovsene vlocky' }),
  food('Chia puding', 140, 5, 12, 8, [['1 porcia', 150]], { aliases: 'chia' }),
  food('Gnocchi', 150, 3.5, 33, 0.5, [['1 porcia', 200]], { aliases: 'noky' }),
  food('Ryžové rezance varené', 110, 1, 25, 0.2, [['1 porcia', 200]], { aliases: 'nudle' }),
  food('Krokety', 210, 3, 27, 10, [['1 porcia', 150]]),
  food('Zemiaky pečené v šupke', 93, 2.5, 21, 0.1, [['1 ks', 150]], { aliases: 'zemiak' }),
  food('Batáty pečené', 90, 2, 21, 0.2, [['1 porcia', 200]], { aliases: 'sladké zemiaky' }),
  food('Lokše', 230, 5, 40, 5, [['1 ks', 70]], { aliases: 'lokse' }),

  // ---------- Mäso a ryby ----------
  food('Kuracie prsia (pečené)', 165, 31, 0, 3.6, [['1 porcia', 150]], { aliases: 'kura kuracie mäso' }),
  food('Kuracie stehno (pečené, s kožou)', 230, 24, 0, 15, [['1 ks', 150]], { aliases: 'kura' }),
  food('Morčacie prsia (pečené)', 135, 30, 0, 1.5, [['1 porcia', 150]], { aliases: 'morka' }),
  food('Bravčové mäso chudé (pečené)', 200, 28, 0, 9, [['1 porcia', 150]], { aliases: 'bravcove karé stehno' }),
  food('Bravčová krkovička (pečená)', 270, 25, 0, 19, [['1 porcia', 150]], { aliases: 'krkovicka grilovaná' }),
  food('Hovädzie mäso (dusené)', 220, 30, 0, 11, [['1 porcia', 150]], { aliases: 'hovadzie' }),
  food('Mleté mäso (opečené)', 270, 24, 0, 19, [['1 porcia', 100]], { aliases: 'mlete' }),
  food('Šunka', 115, 19, 1, 4, [['1 plátok', 15]], { aliases: 'sunka výberová' }),
  food('Saláma', 400, 15, 1, 37, [['1 plátok', 10]], { aliases: 'salama' }),
  food('Párky', 270, 12, 2, 24, [['1 ks', 50]], { aliases: 'parok' }),
  food('Klobása', 330, 14, 1, 30, [['1 ks', 100]], { aliases: 'klobasa' }),
  food('Slanina', 450, 13, 0, 44, [['1 plátok', 10]], { aliases: 'slanina' }),
  food('Losos (pečený)', 206, 22, 0, 13, [['1 porcia', 150]], { aliases: 'ryba' }),
  food('Biela ryba (pečená)', 105, 23, 0, 1, [['1 porcia', 150]], { aliases: 'treska filé ryba' }),
  food('Tuniak v náleve (scedený)', 116, 26, 0, 1, [['1 konzerva', 120]], { aliases: 'tuniak' }),
  food('Tuniak v oleji (scedený)', 190, 27, 0, 9, [['1 konzerva', 120]], { aliases: 'tuniak' }),
  food('Rybie prsty', 230, 13, 20, 11, [['1 ks', 30]], { aliases: 'ryba' }),
  food('Kuracie nugetky', 290, 15, 17, 18, [['1 ks', 18], ['1 porcia (6 ks)', 110]], { aliases: 'nuggets' }),

  food('Hovädzí steak (grilovaný)', 250, 26, 0, 16, [['1 ks', 200]], { aliases: 'hovadzi steak' }),
  food('Bravčový rezeň na prírodno', 190, 28, 0, 8, [['1 ks', 150]], { aliases: 'rezen' }),
  food('Kuracie krídla (pečené)', 260, 24, 0, 18, [['1 porcia', 200]], { aliases: 'kridla wings' }),
  food('Kuracie stripsy (vyprážané)', 270, 18, 16, 15, [['1 ks', 35]], { aliases: 'stripsy' }),
  food('Pečená kačica', 340, 19, 0, 28, [['1 porcia', 200]], { aliases: 'kacica' }),
  food('Gyros mäso', 210, 18, 2, 14, [['1 porcia', 150]], { aliases: 'kebab mäso' }),
  food('Fašírka', 260, 14, 12, 17, [['1 ks', 100]], { aliases: 'fasirka karbonátka' }),
  food('Čevapčiči', 270, 17, 3, 21, [['1 ks', 30]], { aliases: 'cevapcici' }),
  food('Hot dog', 250, 9, 24, 13, [['1 ks', 120]], { aliases: 'párok v rožku' }),
  food('Údené mäso', 250, 22, 0, 18, [['1 porcia', 100]], { aliases: 'udene' }),
  food('Pstruh (pečený)', 150, 21, 0, 7, [['1 ks', 200]], { aliases: 'ryba' }),
  food('Makrela údená', 300, 19, 0, 25, [['1 porcia', 100]], { aliases: 'ryba' }),
  food('Sardinky v oleji', 210, 25, 0, 11, [['1 konzerva', 100]], { aliases: 'ryba' }),
  food('Krevety (varené)', 99, 24, 0.2, 0.3, [['1 porcia', 100]], { aliases: 'kreveta' }),
  food('Tofu', 140, 15, 3, 8, [['1 porcia', 100]]),

  // ---------- Vajcia a mliečne výrobky ----------
  food('Vajce', 143, 12.6, 0.7, 9.5, [['1 ks', 55]], { aliases: 'vajíčko vajcia' }),
  food('Vaječný bielok', 52, 11, 0.7, 0.2, [['1 ks', 33]], { aliases: 'bielok' }),
  food('Praženica', 170, 11, 1, 13, [['1 porcia (3 vajcia)', 150]], { aliases: 'vajíčka' }),
  food('Omeleta', 155, 11, 1, 12, [['1 porcia (2 vajcia)', 120]], { aliases: 'vajíčka' }),
  food('Mlieko polotučné', 46, 3.3, 4.8, 1.5, [['1 pohár', 250]], { unit: 'ml', aliases: 'mlieko 1,5' }),
  food('Mlieko plnotučné', 64, 3.3, 4.7, 3.5, [['1 pohár', 250]], { unit: 'ml', aliases: 'mlieko 3,5' }),
  food('Kefír', 55, 3.3, 4.5, 2.5, [['1 pohár', 250]], { unit: 'ml' }),
  food('Jogurt biely', 61, 3.5, 4.7, 3.2, [['1 kelímok', 150]], { aliases: 'jogurt' }),
  food('Grécky jogurt', 133, 5.6, 3.5, 10, [['1 kelímok', 150]], { aliases: 'jogurt grecky' }),
  food('Skyr / proteínový jogurt', 63, 11, 4, 0.2, [['1 kelímok', 140]], { aliases: 'jogurt protein' }),
  food('Ovocný jogurt', 95, 3.5, 14, 2.8, [['1 kelímok', 150]], { aliases: 'jogurt' }),
  food('Tvaroh polotučný', 105, 13, 3.5, 4.5, [['1 porcia', 100], ['1 balenie', 250]]),
  food('Tvaroh nízkotučný', 75, 13, 4, 0.5, [['1 porcia', 100], ['1 balenie', 250]], { aliases: 'odtučnený' }),
  food('Cottage (zrnitý tvaroh)', 95, 12, 2.5, 4, [['1 kelímok', 180]], { aliases: 'cottage cheese' }),
  food('Syr eidam 30 %', 260, 30, 0, 16, [['1 plátok', 20]], { aliases: 'syr' }),
  food('Syr eidam 45 % / gouda', 350, 25, 0, 28, [['1 plátok', 20], ['1 hrsť strúhaného', 30]], { aliases: 'syr strúhaný' }),
  food('Mozzarella', 250, 18, 1.5, 19, [['1 guľa', 125]], { aliases: 'syr' }),
  food('Bryndza', 280, 18, 1.5, 23, [['1 porcia', 50]], { aliases: 'syr' }),
  food('Maslo', 740, 0.7, 0.6, 82, [['na 1 chlieb', 10]], { aliases: 'maslo' }),
  food('Smotana na varenie', 135, 3, 4, 12, [['1 lyžica', 15]], { aliases: 'smotana' }),
  food('Srvátkový proteín (prášok)', 380, 75, 8, 6, [['1 odmerka', 30]], { aliases: 'protein whey nápoj' }),

  food('Ementál', 380, 28, 0, 30, [['1 plátok', 20]], { aliases: 'syr' }),
  food('Niva', 350, 21, 0, 29, [['1 porcia', 30]], { aliases: 'syr plesnivý' }),
  food('Hermelín', 300, 20, 0, 24, [['1 ks', 120]], { aliases: 'syr' }),
  food('Údený syr (parenica, oštiepok)', 300, 25, 2, 21, [['1 porcia', 50]], { aliases: 'syr parenica ostiepok' }),
  food('Feta', 265, 14, 4, 21, [['1 porcia', 50]], { aliases: 'syr balkánsky' }),
  food('Lučina', 230, 8, 3, 21, [['1 porcia', 30]], { aliases: 'lucina nátierka' }),
  food('Puding', 120, 3, 18, 3.5, [['1 kelímok', 125]]),
  food('Termix', 180, 6, 22, 7, [['1 kelímok', 90]], { aliases: 'tvarohový dezert' }),

  // ---------- Ovocie ----------
  food('Banán', 89, 1.1, 23, 0.3, [['1 ks', 120]], { aliases: 'banan' }),
  food('Jablko', 52, 0.3, 14, 0.2, [['1 ks', 150]]),
  food('Hruška', 57, 0.4, 15, 0.1, [['1 ks', 170]], { aliases: 'hruska' }),
  food('Pomaranč', 47, 0.9, 12, 0.1, [['1 ks', 150]], { aliases: 'pomaranc' }),
  food('Mandarínka', 53, 0.8, 13, 0.3, [['1 ks', 70]], { aliases: 'mandarinka' }),
  food('Hrozno', 69, 0.7, 18, 0.2, [['1 porcia', 100]]),
  food('Jahody', 32, 0.7, 7.7, 0.3, [['1 porcia', 150]]),
  food('Čučoriedky', 57, 0.7, 14, 0.3, [['1 porcia', 100]], { aliases: 'cucoriedky' }),
  food('Kiwi', 61, 1.1, 15, 0.5, [['1 ks', 75]]),
  food('Melón (vodový)', 30, 0.6, 7.6, 0.2, [['1 porcia', 300]], { aliases: 'melon dyňa' }),
  food('Ananás', 50, 0.5, 13, 0.1, [['1 porcia', 150]], { aliases: 'ananas' }),
  food('Broskyňa', 39, 0.9, 10, 0.3, [['1 ks', 150]], { aliases: 'broskyna' }),
  food('Slivky', 46, 0.7, 11, 0.3, [['1 porcia', 100]]),
  food('Hrozienka', 299, 3, 79, 0.5, [['1 hrsť', 30]], { aliases: 'sušené ovocie' }),
  food('Avokádo', 160, 2, 9, 15, [['1/2 ks', 70], ['1 ks', 140]], { aliases: 'avokado' }),

  food('Marhuľa', 48, 1.4, 11, 0.4, [['1 ks', 40]], { aliases: 'marhula' }),
  food('Čerešne', 63, 1.1, 16, 0.2, [['1 porcia', 100]], { aliases: 'ceresne višne' }),
  food('Maliny', 52, 1.2, 12, 0.7, [['1 porcia', 100]]),
  food('Mango', 60, 0.8, 15, 0.4, [['1 ks', 300]]),
  food('Grapefruit', 42, 0.8, 11, 0.1, [['1/2 ks', 150]]),
  food('Sušené slivky', 240, 2.2, 64, 0.4, [['5 ks', 40]], { aliases: 'sušené ovocie' }),
  food('Datle', 280, 2.5, 75, 0.4, [['1 ks', 8]], { aliases: 'sušené ovocie' }),

  // ---------- Zelenina a strukoviny ----------
  food('Paradajka', 18, 0.9, 3.9, 0.2, [['1 ks', 120]], { aliases: 'rajčina' }),
  food('Uhorka', 15, 0.7, 3.6, 0.1, [['1 ks', 250]]),
  food('Paprika', 26, 1, 6, 0.3, [['1 ks', 150]]),
  food('Mrkva', 41, 0.9, 10, 0.2, [['1 ks', 80]]),
  food('Brokolica (varená)', 35, 2.4, 7, 0.4, [['1 porcia', 150]], { aliases: 'brokolica' }),
  food('Šalát (hlávkový, ľadový)', 14, 0.9, 3, 0.1, [['1 porcia', 50]], { aliases: 'salat' }),
  food('Zeleninový šalát (bez dresingu)', 20, 1, 4, 0.2, [['1 porcia', 150]], { aliases: 'salat' }),
  food('Zeleninový šalát s dresingom', 70, 1, 5, 5, [['1 porcia', 200]], { aliases: 'salat' }),
  food('Kukurica (sterilizovaná)', 86, 3, 19, 1.2, [['1 porcia', 100]]),
  food('Hrášok', 81, 5.4, 14, 0.4, [['1 porcia', 100]], { aliases: 'hrasok' }),
  food('Cibuľa', 40, 1.1, 9, 0.1, [['1 ks', 100]], { aliases: 'cibula' }),
  food('Kyslá kapusta', 19, 0.9, 4.3, 0.1, [['1 porcia', 150]], { aliases: 'kapusta' }),
  food('Fazuľa červená (varená)', 127, 8.7, 22, 0.5, [['1 porcia', 120]], { aliases: 'fazula' }),
  food('Šošovica varená', 116, 9, 20, 0.4, [['1 porcia', 200]], { aliases: 'sosovica' }),
  food('Cícer varený', 164, 8.9, 27, 2.6, [['1 porcia', 120]], { aliases: 'cicer' }),

  food('Špenát čerstvý', 23, 2.9, 3.6, 0.4, [['1 hrsť', 30]], { aliases: 'spenat' }),
  food('Špenátový prívarok', 80, 3, 6, 5, [['1 porcia', 200]], { aliases: 'spenat' }),
  food('Šampiňóny', 22, 3.1, 3.3, 0.3, [['1 porcia', 100]], { aliases: 'huby sampinony' }),
  food('Cuketa', 17, 1.2, 3.1, 0.3, [['1 ks', 200]]),
  food('Baklažán', 25, 1, 6, 0.2, [['1 porcia', 150]], { aliases: 'baklazan' }),
  food('Cvikla (červená repa)', 43, 1.6, 10, 0.2, [['1 porcia', 100]], { aliases: 'cvikla repa' }),
  food('Biela kapusta', 25, 1.3, 6, 0.1, [['1 porcia', 100]], { aliases: 'kapusta' }),
  food('Zelená fazuľka', 31, 1.8, 7, 0.2, [['1 porcia', 150]], { aliases: 'fazulka' }),
  food('Edamame', 120, 12, 9, 5, [['1 porcia', 50]], { aliases: 'sója fazuľky' }),
  food('Olivy', 115, 0.8, 6, 11, [['5 ks', 20]]),
  food('Kyslé uhorky', 12, 0.5, 2, 0.2, [['1 ks', 50]], { aliases: 'uhorka sterilizovaná' }),

  // ---------- Orechy, tuky, nátierky, dochucovadlá ----------
  food('Arašidy', 585, 24, 16, 50, [['1 hrsť', 30]], { aliases: 'orechy arasidy' }),
  food('Mandle', 580, 21, 10, 50, [['1 hrsť', 30]], { aliases: 'orechy' }),
  food('Vlašské orechy', 654, 15, 7, 65, [['1 hrsť', 30]], { aliases: 'orechy' }),
  food('Arašidové maslo', 590, 25, 16, 50, [['1 lyžica', 15]], { aliases: 'peanut butter' }),
  food('Olivový olej', 884, 0, 0, 100, [['1 lyžica', 10]], { aliases: 'olej' }),
  food('Slnečnicový olej', 884, 0, 0, 100, [['1 lyžica', 10]], { aliases: 'olej' }),
  food('Nutella', 540, 6.3, 57, 31, [['1 lyžica', 15]], { aliases: 'nátierka čokoládová' }),
  food('Med', 304, 0.3, 82, 0, [['1 lyžička', 8]]),
  food('Džem', 250, 0.4, 60, 0.1, [['1 lyžica', 20]], { aliases: 'dzem lekvár' }),
  food('Cukor', 400, 0, 100, 0, [['1 lyžička', 5]]),
  food('Kečup', 110, 1.2, 25, 0.2, [['1 lyžica', 15]], { aliases: 'kecup' }),
  food('Majonéza', 680, 1, 1, 75, [['1 lyžica', 15]], { aliases: 'majoneza' }),
  food('Tatárska omáčka', 480, 1, 6, 50, [['1 lyžica', 20]], { aliases: 'tatarka' }),

  // ---------- Omáčky a prísady k jedlu ----------
  food('Paradajková omáčka', 50, 1.6, 8, 1.5, [['1 porcia', 100]], { aliases: 'omacka na cestoviny' }),
  food('Bolonská omáčka (mäsová)', 110, 7, 5, 7, [['1 porcia', 150]], { aliases: 'omacka bolognese' }),
  food('Smotanová omáčka', 150, 2.5, 5, 13, [['1 porcia', 100]], { aliases: 'omacka carbonara' }),
  food('Syrová omáčka', 180, 6, 8, 14, [['1 porcia', 100]], { aliases: 'omacka' }),
  food('Pesto', 450, 5, 6, 45, [['1 lyžica', 15], ['1 porcia', 30]], { aliases: 'omacka bazalka' }),
  food('Parmezán', 400, 36, 0, 28, [['1 lyžica strúhaného', 5], ['1 porcia', 20]], { aliases: 'syr parmezan' }),
  food('Sójová omáčka', 60, 8, 6, 0, [['1 lyžica', 15]], { unit: 'ml', aliases: 'omacka soja' }),
  food('Teriyaki omáčka', 90, 2, 18, 0.5, [['1 porcia', 30]], { aliases: 'omacka' }),
  food('Sweet chilli omáčka', 200, 0.5, 48, 0.5, [['1 lyžica', 15]], { aliases: 'omacka' }),
  food('BBQ omáčka', 170, 1, 40, 0.5, [['1 lyžica', 15]], { aliases: 'omacka barbecue' }),
  food('Cesnaková omáčka', 450, 1, 5, 47, [['1 lyžica', 20]], { aliases: 'omacka dresing cesnak' }),
  food('Jogurtový dresing', 120, 2, 6, 10, [['1 porcia', 30]], { aliases: 'dresing' }),
  food('Olejový dresing', 400, 0.5, 8, 40, [['1 lyžica', 15]], { aliases: 'dresing vinaigrette francúzsky' }),
  food('Horčica', 70, 4, 6, 4, [['1 lyžica', 15]], { aliases: 'horcica' }),
  food('Hummus', 170, 7, 14, 10, [['1 porcia', 50]], { aliases: 'cícer nátierka' }),
  food('Ajvar', 70, 1.5, 8, 4, [['1 lyžica', 20]], { aliases: 'nátierka' }),

  // ---------- Sladkosti a pochutiny ----------
  food('Horká čokoláda', 600, 8, 34, 43, [['1 rad', 25], ['1 tabuľka', 100]], { aliases: 'cokolada' }),
  food('Mliečna čokoláda', 535, 7.7, 59, 30, [['1 rad', 25], ['1 tabuľka', 100]], { aliases: 'cokolada' }),
  food('Sušienky', 480, 6.5, 68, 20, [['1 ks', 10]], { aliases: 'susienky keksy' }),
  food('Croissant', 406, 8, 46, 21, [['1 ks', 60]], { aliases: 'kroasan' }),
  food('Koláč / buchta', 350, 6, 50, 14, [['1 kúsok', 80]], { aliases: 'kolac zákusok' }),
  food('Zmrzlina', 207, 3.5, 24, 11, [['1 kopček', 50]]),
  food('Chipsy', 536, 7, 53, 34, [['1 hrsť', 30], ['1 balenie', 60]], { aliases: 'čipsy lupienky' }),
  food('Proteínová tyčinka', 370, 33, 35, 12, [['1 ks', 55]], { aliases: 'protein' }),
  food('Müsli tyčinka', 420, 6, 65, 14, [['1 ks', 25]], { aliases: 'musli' }),

  food('Šiška / donut', 400, 5, 45, 22, [['1 ks', 70]], { aliases: 'siska donut' }),
  food('Bábovka', 380, 6, 50, 17, [['1 kúsok', 60]], { aliases: 'babovka' }),
  food('Torta', 350, 5, 45, 17, [['1 kúsok', 120]], { aliases: 'zákusok' }),
  food('Tiramisu', 280, 5, 30, 16, [['1 porcia', 120]], { aliases: 'zákusok' }),
  food('Medovník', 400, 5, 55, 18, [['1 kúsok', 100]], { aliases: 'medovnik zákusok' }),
  food('Oblátka (napr. Horalka)', 520, 7, 57, 29, [['1 ks', 50]], { aliases: 'horalky oblatka' }),
  food('Čokoládová tyčinka (Mars, Snickers)', 480, 6, 60, 23, [['1 ks', 50]], { aliases: 'tycinka' }),
  food('Želé cukríky', 340, 6, 77, 0, [['1 hrsť', 30]], { aliases: 'gumené medvedíky haribo' }),
  food('Popcorn', 500, 8, 58, 28, [['1 porcia', 50]]),
  food('Slané tyčinky', 380, 10, 75, 4, [['1 hrsť', 30]], { aliases: 'tycinky' }),
  food('Krekry', 450, 9, 68, 16, [['1 porcia', 30]], { aliases: 'kreker' }),
  food('Palacinka s nutellou', 290, 6, 35, 14, [['1 ks', 90]], { aliases: 'palacinky' }),

  // ---------- Nápoje ----------
  food('Pivo 12°', 45, 0.5, 3.6, 0, [['1 veľké', 500], ['1 malé', 300]], { unit: 'ml', aliases: 'pivo' }),
  food('Víno', 85, 0.1, 2.6, 0, [['1 deci', 100], ['1 pohár', 200]], { unit: 'ml', aliases: 'vino' }),
  food('Kola', 42, 0, 10.6, 0, [['1 plechovka', 330], ['1 pohár', 250]], { unit: 'ml', aliases: 'coca-cola pepsi' }),
  food('Džús pomarančový', 45, 0.7, 10, 0.2, [['1 pohár', 250]], { unit: 'ml', aliases: 'dzus' }),
  food('Energetický nápoj', 45, 0, 11, 0, [['1 plechovka', 250]], { unit: 'ml', aliases: 'energy drink' }),
  food('Cappuccino / káva s mliekom', 40, 2, 3.5, 2, [['1 šálka', 180]], { unit: 'ml', aliases: 'kava latte' }),
  food('Kakao s mliekom', 80, 3.4, 11, 2, [['1 hrnček', 250]], { unit: 'ml', aliases: 'kakao' }),

  food('Kofola', 34, 0, 8.5, 0, [['1 pohár', 250], ['1 fľaša', 500]], { unit: 'ml' }),
  food('Limonáda (Fanta, Sprite)', 35, 0, 8.5, 0, [['1 plechovka', 330], ['1 fľaša', 500]], { unit: 'ml', aliases: 'malinovka' }),
  food('Ľadový čaj (Fuzetea)', 19, 0, 4.5, 0, [['1 fľaša', 500]], { unit: 'ml', aliases: 'ice tea' }),
  food('Smoothie', 55, 0.8, 12, 0.3, [['1 fľaša', 250]], { unit: 'ml' }),
  food('Proteínový šejk s mliekom', 82, 9, 5, 2.5, [['1 šejk', 280]], { unit: 'ml', aliases: 'protein shake' }),
  food('Latte', 50, 3, 4.5, 2, [['1 pohár', 300]], { unit: 'ml', aliases: 'kava' }),
  food('Čierna káva', 2, 0.1, 0, 0, [['1 šálka', 100]], { unit: 'ml', aliases: 'kava espresso' }),
  food('Pivo nealko', 25, 0.3, 5.5, 0, [['1 veľké', 500]], { unit: 'ml', aliases: 'pivo' }),
  food('Radler', 40, 0.3, 9, 0, [['1 veľké', 500]], { unit: 'ml', aliases: 'pivo' }),
  food('Tvrdý alkohol (vodka, rum)', 230, 0, 0, 0, [['1 poldeci', 50]], { unit: 'ml', aliases: 'vodka rum borovička fernet' }),

  // ---------- Varené jedlá – školská jedáleň, reštaurácia, rozvoz ----------
  food('Vývar s rezancami', 35, 2.5, 3.5, 1.2, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka slepačia' }),
  food('Gulášová polievka', 70, 4.5, 6, 3, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka gulasova' }),
  food('Fazuľová polievka', 75, 4, 9, 2.5, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka fazulova' }),
  food('Krémová zeleninová polievka', 60, 1.5, 6, 3.5, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka' }),
  food('Kapustnica', 60, 3.5, 3, 4, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka' }),
  food('Guláš (bez prílohy)', 120, 10, 5, 7, [['1 porcia', 300]], { aliases: 'gulas' }),
  food('Segedínsky guláš s knedľou', 150, 8, 14, 7, [['1 porcia', 400]], { aliases: 'segedin' }),
  food('Sviečková s knedľou', 160, 8, 18, 6, [['1 porcia', 450]], { aliases: 'sviečková na smotane' }),
  food('Kurací paprikáš s cestovinou', 150, 10, 15, 5.5, [['1 porcia', 400]], { aliases: 'paprikas' }),
  food('Šošovicový prívarok', 120, 6, 14, 4, [['1 porcia', 300]], { aliases: 'sosovica' }),
  food('Rizoto s kuracím mäsom', 140, 7, 20, 3.5, [['1 porcia', 350]], { aliases: 'rizoto' }),
  food('Kuracie mäso s ryžou', 140, 12, 17, 2.5, [['1 porcia', 350]], { aliases: 'kura ryza' }),
  food('Špagety bolonské', 150, 7, 20, 4.5, [['1 porcia', 350]], { aliases: 'spagety bolognese' }),
  food('Lasagne', 165, 9, 14, 8, [['1 porcia', 300]]),
  food('Vyprážaný kurací rezeň', 250, 20, 12, 14, [['1 ks', 150]], { aliases: 'rezen vyprazany' }),
  food('Vyprážaný bravčový rezeň', 280, 18, 12, 18, [['1 ks', 150]], { aliases: 'rezen vyprazany' }),
  food('Vyprážaný syr', 330, 16, 15, 23, [['1 ks', 120]], { aliases: 'syr vyprazany' }),
  food('Grilovaný syr (hermelín)', 320, 19, 1, 27, [['1 ks', 120]], { aliases: 'encián' }),
  food('Bryndzové halušky so slaninou', 200, 7, 22, 9, [['1 porcia', 350]], { aliases: 'halusky' }),
  food('Bryndzové pirohy', 220, 8, 30, 7, [['1 porcia', 300]], { aliases: 'pirohy' }),
  food('Šúľance s makom', 260, 6, 40, 8, [['1 porcia', 300]], { aliases: 'sulance' }),
  food('Palacinka s džemom', 230, 6, 34, 8, [['1 ks', 80]], { aliases: 'palacinky' }),
  food('Pizza margherita', 250, 11, 30, 9, [['1 kúsok', 110], ['1 celá', 450]], { aliases: 'pizza' }),
  food('Pizza so šunkou alebo salámou', 270, 12, 29, 11, [['1 kúsok', 110], ['1 celá', 480]], { aliases: 'pizza' }),
  food('Hamburger', 250, 13, 25, 11, [['1 ks', 220]], { aliases: 'burger' }),
  food('Cheeseburger', 265, 14, 25, 12, [['1 ks', 120]], { aliases: 'burger mcdonalds' }),
  food('Kebab v pite / tortille', 215, 11, 20, 10, [['1 ks', 400]], { aliases: 'kebap gyros döner' }),
  food('Kebab box s hranolkami', 220, 10, 18, 12, [['1 box', 450]], { aliases: 'kebap box' }),
  food('Langoš', 330, 9, 33, 18, [['1 ks', 250]], { aliases: 'langos' }),
  food('Čínske kuracie s ryžou', 160, 9, 17, 6, [['1 box', 500]], { aliases: 'cina kung pao' }),
  food('Sushi (maki)', 150, 4.5, 30, 1, [['1 ks', 25], ['1 porcia (8 ks)', 200]], { aliases: 'susi' }),
  food('Obložený sendvič (šunka, syr)', 250, 12, 28, 10, [['1 ks', 150]], { aliases: 'bageta sendvic' }),
  food('Toast so šunkou a syrom', 260, 14, 25, 11, [['1 ks', 100]], { aliases: 'toast' }),
  food('Paradajková polievka', 50, 1.2, 8, 1.5, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka' }),
  food('Šošovicová polievka', 80, 5, 11, 2, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka sosovicova' }),
  food('Hubová polievka (kulajda)', 75, 2, 6, 5, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka kulajda' }),
  food('Cesnačka', 90, 3, 8, 5, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka cesnacka' }),
  food('Zemiaková polievka', 65, 1.5, 9, 2.5, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka' }),
  food('Hovädzí vývar', 25, 2.5, 1, 1, [['1 tanier', 300]], { unit: 'ml', aliases: 'polievka' }),
  food('Ramen', 90, 5, 11, 3, [['1 miska', 600]], { unit: 'ml', aliases: 'polievka nudle' }),
  food('Rezeň so zemiakovým šalátom', 230, 10, 18, 13, [['1 porcia', 400]], { aliases: 'rezen' }),
  food('Zemiakový šalát', 160, 2, 14, 11, [['1 porcia', 200]], { aliases: 'salat' }),
  food('Vyprážaný karfiol', 210, 6, 16, 14, [['1 porcia', 200]], { aliases: 'karfiol' }),
  food('Plnená paprika s knedľou', 120, 6, 14, 4.5, [['1 porcia', 450]], { aliases: 'paprika' }),
  food('Kurací steak so zeleninou', 120, 15, 4, 5, [['1 porcia', 350]], { aliases: 'kura' }),
  food('Pečené kuracie stehno s ryžou', 170, 10, 17, 7, [['1 porcia', 400]], { aliases: 'kura' }),
  food('Pečená krkovička so zemiakmi', 190, 11, 13, 11, [['1 porcia', 400]], { aliases: 'krkovicka' }),
  food('Zapekané cestoviny so syrom', 180, 8, 20, 8, [['1 porcia', 350]], { aliases: 'mac and cheese' }),
  food('Rezance s makom', 280, 7, 45, 8, [['1 porcia', 300]], { aliases: 'rezance' }),
  food('Hamburger s hranolkami (menu)', 260, 11, 25, 13, [['1 porcia', 450]], { aliases: 'burger' }),
  food('Gyros tanier s hranolkami', 200, 10, 16, 11, [['1 porcia', 500]], { aliases: 'gyros kebab' }),
  food('Fish and chips', 230, 10, 22, 12, [['1 porcia', 400]], { aliases: 'ryba hranolky' }),
  food('Wrap s kuracím mäsom', 210, 11, 22, 8, [['1 ks', 250]], { aliases: 'tortilla' }),
  food('Bageta s kuracím mäsom', 230, 12, 28, 8, [['1 ks', 250]], { aliases: 'sendvic' }),
  food('Quesadilla', 280, 12, 25, 15, [['1 ks', 200]]),
  food('Burrito', 180, 8, 24, 6, [['1 ks', 350]]),
  food('Nachos so syrom', 350, 8, 36, 20, [['1 porcia', 200]]),
  food('Pad thai', 170, 7, 22, 6, [['1 porcia', 400]], { aliases: 'rezance thai' }),
  food('Sladkokyslé kura (čína)', 170, 8, 20, 6, [['1 box', 500]], { aliases: 'cina' }),
  food('Kuracie s kešu (čína)', 150, 10, 12, 7, [['1 box', 500]], { aliases: 'cina kesu' }),
  food('Smažené rezance (čína)', 180, 6, 24, 7, [['1 box', 400]], { aliases: 'cina nudle' }),
  food('Rizoto s hubami', 140, 3.5, 20, 5, [['1 porcia', 350]], { aliases: 'rizoto' }),
  food('Šalát Caesar', 160, 10, 6, 11, [['1 porcia', 300]], { aliases: 'salat cezar' }),
  food('Grécky šalát', 100, 3.5, 5, 8, [['1 porcia', 300]], { aliases: 'salat' }),
  food('Tuniakový šalát', 140, 12, 5, 8, [['1 porcia', 250]], { aliases: 'salat' }),

  // ---------- Podniky v Banskej Bystrici ----------
  // McDonald's: oficiálne hodnoty z mcdonalds.sk (2026); hmotnosti kusov sú približné.
  piece("McDonald's Big Mac", 219, 510, 24.7, 40.4, 27.1, { aliases: 'mcdonalds mekac burger' }),
  piece("McDonald's Big Arch", 330, 990, 54, 47, 65, { aliases: 'mcdonalds mekac burger' }),
  piece("McDonald's McRoyal", 200, 501, 29, 35, 27, { aliases: 'mcdonalds mekac burger' }),
  piece("McDonald's McRoyal Double", 272, 798, 54, 38, 47, { aliases: 'mcdonalds mekac burger' }),
  piece("McDonald's Double Cheeseburger", 165, 457, 27, 31, 24, { aliases: 'mcdonalds mekac burger' }),
  piece("McDonald's Cheeseburger", 118, 306, 16, 30, 13, { aliases: 'mcdonalds mekac burger' }),
  piece("McDonald's Hamburger", 104, 258, 13, 29, 9.4, { aliases: 'mcdonalds mekac burger' }),
  piece("McDonald's Big Tasty Bacon", 250, 691, 31, 42, 42, { aliases: 'mcdonalds mekac burger' }),
  piece("McDonald's McChicken", 167, 427, 20, 45, 17, { aliases: 'mcdonalds mekac kuracie burger' }),
  piece("McDonald's Chickenburger", 130, 277, 10, 41, 8, { aliases: 'mcdonalds mekac kuracie burger' }),
  piece("McDonald's McCrispy Creamy BBQ", 210, 522, 24, 54, 22, { aliases: 'mcdonalds mekac kuracie burger' }),
  piece("McDonald's Chicken McNuggets", 96, 262, 16, 21, 12, {
    aliases: 'mcdonalds mekac nugetky nuggets',
    portions: [['4 ks', 64], ['6 ks', 96], ['9 ks', 144], ['20 ks', 320]],
  }),
  piece("McDonald's Chicken Strips", 90, 217, 14, 19, 10, {
    aliases: 'mcdonalds mekac stripsy',
    portions: [['2 ks', 90], ['4 ks', 180]],
  }),
  piece("McDonald's Creamy BBQ Chicken McWrap", 230, 510, 22, 52, 24, { aliases: 'mcdonalds mekac wrap' }),
  piece("McDonald's Honey Mustard Chicken McWrap", 230, 543, 21, 53, 28, { aliases: 'mcdonalds mekac wrap' }),
  piece("McDonald's Snack Wrap", 100, 236, 10, 28, 9, { aliases: 'mcdonalds mekac wrap' }),
  piece("McDonald's Crispy Chicken šalát", 300, 374, 21, 35, 15.7, { label: '1 porcia', aliases: 'mcdonalds mekac salat' }),
  piece("McDonald's hranolky", 114, 327, 4, 41, 15, {
    aliases: 'mcdonalds mekac hranolky',
    portions: [['malé', 80], ['stredné', 114], ['veľké', 150]],
  }),
  piece("McDonald's McFlurry KitKat", 185, 314, 6, 47, 11, { aliases: 'mcdonalds mekac zmrzlina dezert' }),
  piece("McDonald's Milk Shake vanilkový", 250, 199, 5.2, 36, 3.7, {
    unit: 'ml',
    aliases: 'mcdonalds mekac shake',
    portions: [['malý', 250], ['veľký', 400]],
  }),
  piece("McDonald's jablková taštička", 80, 228, 2.3, 28, 12, { aliases: 'mcdonalds mekac dezert' }),

  // KFC: oficiálna tabuľka nutričných hodnôt KFC (AmRest, 2020); menu sa časom mení.
  piece('KFC Original kúsok – stehno', 111, 301, 22, 9.3, 20, { aliases: 'kfc kura kuracie' }),
  piece('KFC Original kúsok – prsia', 100, 236, 25, 7.8, 12, { aliases: 'kfc kura kuracie' }),
  piece('KFC Original kúsok – krídlo', 65, 185, 15, 6.5, 11, { aliases: 'kfc kura kuracie' }),
  piece('KFC Original kúsok – palička', 69, 170, 16, 5, 9.6, { aliases: 'kfc kura kuracie' }),
  piece('KFC Hot Wings', 36, 108, 6, 3.5, 7.9, {
    aliases: 'kfc kridla wings',
    portions: [['1 ks', 36], ['5 ks', 180], ['8 ks', 288]],
  }),
  piece('KFC Hot & Spicy Strips', 32, 84, 4.9, 4.7, 5, {
    aliases: 'kfc stripsy',
    portions: [['1 ks', 32], ['3 ks', 96], ['5 ks', 160]],
  }),
  piece('KFC Hot & Spicy Bites', 90, 291, 17, 14, 18, { label: '1 porcia', aliases: 'kfc' }),
  piece('KFC Zinger', 179, 484, 25, 41, 25, { aliases: 'kfc burger' }),
  piece('KFC Double Zinger', 240, 590, 41, 41, 29, { aliases: 'kfc burger' }),
  piece('KFC Zinger Grill', 160, 344, 35, 21, 13, { aliases: 'kfc burger' }),
  piece('KFC Longer', 127, 306, 12, 42, 10, { aliases: 'kfc burger' }),
  piece('KFC Filler', 130, 317, 15, 28, 16, { aliases: 'kfc burger' }),
  piece('KFC Twister Classic', 226, 540, 19, 52, 28, { aliases: 'kfc wrap tortilla' }),
  piece('KFC Twister Grill', 213, 409, 28, 40, 15, { aliases: 'kfc wrap tortilla' }),
  piece('KFC iTwist Classic', 132, 326, 11, 36, 15, { aliases: 'kfc wrap tortilla' }),
  piece('KFC Qurrito', 230, 648, 35, 59, 31, { aliases: 'kfc wrap' }),
  piece('KFC hranolky', 70, 179, 2.7, 24, 7.7, {
    aliases: 'kfc hranolky',
    portions: [['malé', 70], ['veľké', 105], ['kýblik', 240]],
  }),
  piece('KFC Kentucky Fries', 150, 425, 8, 45, 25, { label: '1 porcia', aliases: 'kfc hranolky' }),
  piece('KFC zemiaková kaša s omáčkou', 220, 117, 3.3, 22, 1.3, { label: '1 porcia', aliases: 'kfc kasa' }),
  piece('KFC Coleslaw', 140, 141, 1, 13, 10, { label: '1 porcia', aliases: 'kfc salat' }),
  piece('KFC kukurica s maslom', 250, 315, 8.3, 49, 9.5, { aliases: 'kfc' }),

  // Leviathan (špagety, Europa SC): kalórie na porciu zo stránky leviathan.sk; bielkoviny, sacharidy
  // a tuky sú odhad podľa zloženia omáčky. Porcie 400 / 600 / 800 g.
  ...[
    ['„Leviathan“ (smotanovo-syrová, gorgonzola, kura, olivy)', 461, 'cream'],
    ['Formaggi (smotanovo-syrová, slanina)', 546, 'cream'],
    ['Alla Funghi (smotanovo-syrová, šampiňóny)', 424, 'cream'],
    ['Broccoli (smotanovo-syrová, brokolica)', 400, 'cream'],
    ['Spinaci (smotanovo-syrová, špenát)', 402, 'cream'],
    ['Bolognese (paradajková, mleté mäso, slanina)', 451, 'tomato'],
    ['Arrabiata (paradajková, chilli)', 370, 'tomato'],
    ['Alla Tono (paradajková, tuniak)', 419, 'tomato'],
    ['Salsa di Pollo (paradajková, kura, fazuľa, kukurica)', 392, 'tomato'],
  ].map(([name, kcal, base]) => leviathan(name as string, kcal as number, 400, base as Sauce)),
  ...[
    ['Pesto Genovese (bazalka, parmezán)', 527],
    ['Pesto Aglio Olio (petržlen, cesnak, chilli)', 605],
    ['Pesto Siciliana (sušené paradajky, slnečnica)', 419],
    ['Pesto Rosso (sušené paradajky, olivy, chilli)', 333],
  ].map(([name, kcal]) => leviathan(name as string, kcal as number, 300, 'pesto')),

  // Wakaka Poke&Bowl (Europa SC): podnik hodnoty neuvádza – odhad podľa zloženia a bežnej veľkosti porcie.
  piece('Wakaka bowl chicken steak', 480, 665, 44, 74, 20, { label: '1 bowl', aliases: 'wakaka poke bowl kura europa' }),
  piece('Wakaka bowl teriyaki chicken', 460, 600, 36, 90, 12, { label: '1 bowl', aliases: 'wakaka poke bowl kura europa' }),
  piece('Wakaka bowl crispy chicken', 480, 710, 32, 92, 24, { label: '1 bowl', aliases: 'wakaka poke bowl kura europa' }),
  piece('Wakaka bowl kung bao chicken', 450, 560, 29, 80, 14, { label: '1 bowl', aliases: 'wakaka poke bowl kura europa kung pao' }),
  piece('Wakaka bowl orange chicken', 500, 750, 32, 105, 22, { label: '1 bowl', aliases: 'wakaka poke bowl kura europa' }),
  piece('Wakaka bowl spicy beef', 450, 595, 36, 70, 19, { label: '1 bowl', aliases: 'wakaka poke bowl hovadzie europa' }),
  piece('Wakaka bowl crispy duck', 480, 780, 30, 85, 34, { label: '1 bowl', aliases: 'wakaka poke bowl kacica europa' }),
  piece('Wakaka bowl sesame salmon', 500, 740, 32, 90, 27, { label: '1 bowl', aliases: 'wakaka poke bowl losos europa' }),
  piece('Wakaka bowl royal tuna', 500, 650, 34, 90, 18, { label: '1 bowl', aliases: 'wakaka poke bowl tuniak europa' }),
  piece('Wakaka bowl tempura shrimp', 500, 800, 24, 110, 30, { label: '1 bowl', aliases: 'wakaka poke bowl krevety europa' }),
  piece('Wakaka bowl shrimp taste', 480, 600, 33, 92, 13, { label: '1 bowl', aliases: 'wakaka poke bowl krevety europa' }),
  piece('Wakaka bowl vegan', 450, 505, 10, 85, 14, { label: '1 bowl', aliases: 'wakaka poke bowl europa vegánsky' }),
  piece('Wakaka Salmon Maki (6 ks)', 110, 180, 7, 30, 3, { label: '6 ks', aliases: 'wakaka sushi maki losos' }),
  piece('Wakaka Avokádo Maki (6 ks)', 110, 170, 3, 32, 4, { label: '6 ks', aliases: 'wakaka sushi maki' }),
  piece('Wakaka Kappa Maki (6 ks)', 100, 140, 3, 30, 0.5, { label: '6 ks', aliases: 'wakaka sushi maki uhorka' }),
  piece('Wakaka Salmon Nigiri', 35, 60, 3.5, 8, 1.5, { aliases: 'wakaka sushi nigiri losos' }),
  piece('Wakaka Salmon Roll', 220, 350, 14, 50, 10, { label: '1 rolka', aliases: 'wakaka sushi roll losos' }),
  piece('Wakaka California Roll', 200, 300, 9, 45, 9, { label: '1 rolka', aliases: 'wakaka sushi roll' }),
  piece('Wakaka Philadelphia Roll', 240, 420, 15, 50, 17, { label: '1 rolka', aliases: 'wakaka sushi roll' }),
  piece('Wakaka Ebi Tempura Roll', 240, 450, 13, 60, 17, { label: '1 rolka', aliases: 'wakaka sushi roll krevety' }),
  piece('Wakaka sushi set alpha', 380, 650, 30, 96, 16, { label: '1 set', aliases: 'wakaka sushi set' }),
  piece('Wakaka polievka Tom-Yum', 350, 200, 10, 10, 13, { label: '1 porcia', unit: 'ml', aliases: 'wakaka polievka tom yum' }),
  piece('Wakaka ostro-kyslá polievka', 350, 150, 10, 14, 6, { label: '1 porcia', unit: 'ml', aliases: 'wakaka polievka' }),
]

// bez diakritiky a malými písmenami, aby „ryza“ našlo „Ryža“
const plain = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()

const INDEX = FOODS.map((item) => {
  const all = plain(`${item.name} ${item.aliases}`)
  return { item, name: plain(item.name), all, parts: all.split(/[^a-z0-9]+/) }
})

// Každé napísané slovo musí začínať niektoré slovo názvu (alebo iného názvu), aby „cina“ nenašlo „Lučinu“;
// ak sa tak nenájde nič, stačí, keď je kdekoľvek v názve. Navrchu sú jedlá, ktorých názov tak začína.
export function searchFoods(query: string, limit = 40): Food[] {
  const words = plain(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  let found = INDEX.filter((entry) => words.every((word) => entry.parts.some((part) => part.startsWith(word))))
  if (found.length === 0) found = INDEX.filter((entry) => words.every((word) => entry.all.includes(word)))
  return found
    .sort((a, b) => Number(b.name.startsWith(words[0])) - Number(a.name.startsWith(words[0])))
    .slice(0, limit)
    .map((entry) => entry.item)
}

// hodnoty pre zvolené množstvo
export function nutrition(item: Food, grams: number) {
  const ratio = grams / 100
  const round1 = (value: number) => Math.round(value * ratio * 10) / 10
  return {
    kcal: Math.round(item.kcal * ratio),
    protein: round1(item.protein),
    carbs: round1(item.carbs),
    fat: round1(item.fat),
  }
}
