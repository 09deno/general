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
  food('Ryža varená', 130, 2.7, 28, 0.3, [['1 porcia', 200]], { aliases: 'ryza' }),
  food('Cestoviny varené', 158, 5.8, 31, 0.9, [['1 porcia', 200]], { aliases: 'špagety penne makaróny' }),
  food('Zemiaky varené', 80, 2, 17, 0.1, [['1 ks', 100], ['1 porcia', 200]], { aliases: 'zemiak' }),
  food('Zemiaková kaša', 100, 2, 15, 3.7, [['1 porcia', 200]], { aliases: 'pyré' }),
  food('Opekané zemiaky', 150, 2.5, 22, 6, [['1 porcia', 200]], { aliases: 'americké pečené' }),
  food('Hranolky', 312, 3.4, 41, 15, [['1 porcia', 150]], { aliases: 'hranolceky' }),
  food('Knedľa (parená)', 230, 7, 46, 1.5, [['1 plátok', 40], ['1 porcia (4 plátky)', 160]], { aliases: 'knedla' }),
  food('Kuskus varený', 112, 3.8, 23, 0.2, [['1 porcia', 200]]),
  food('Bulgur varený', 83, 3, 19, 0.2, [['1 porcia', 200]]),
  food('Quinoa varená', 120, 4.4, 21, 1.9, [['1 porcia', 200]], { aliases: 'kinoa' }),

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
  food('Syr eidam 45 % / gouda', 350, 25, 0, 28, [['1 plátok', 20]], { aliases: 'syr' }),
  food('Mozzarella', 250, 18, 1.5, 19, [['1 guľa', 125]], { aliases: 'syr' }),
  food('Bryndza', 280, 18, 1.5, 23, [['1 porcia', 50]], { aliases: 'syr' }),
  food('Maslo', 740, 0.7, 0.6, 82, [['na 1 chlieb', 10]], { aliases: 'maslo' }),
  food('Smotana na varenie', 135, 3, 4, 12, [['1 lyžica', 15]], { aliases: 'smotana' }),
  food('Srvátkový proteín (prášok)', 380, 75, 8, 6, [['1 odmerka', 30]], { aliases: 'protein whey nápoj' }),

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

  // ---------- Nápoje ----------
  food('Pivo 12°', 45, 0.5, 3.6, 0, [['1 veľké', 500], ['1 malé', 300]], { unit: 'ml', aliases: 'pivo' }),
  food('Víno', 85, 0.1, 2.6, 0, [['1 deci', 100], ['1 pohár', 200]], { unit: 'ml', aliases: 'vino' }),
  food('Kola', 42, 0, 10.6, 0, [['1 plechovka', 330], ['1 pohár', 250]], { unit: 'ml', aliases: 'coca-cola pepsi' }),
  food('Džús pomarančový', 45, 0.7, 10, 0.2, [['1 pohár', 250]], { unit: 'ml', aliases: 'dzus' }),
  food('Energetický nápoj', 45, 0, 11, 0, [['1 plechovka', 250]], { unit: 'ml', aliases: 'energy drink' }),
  food('Cappuccino / káva s mliekom', 40, 2, 3.5, 2, [['1 šálka', 180]], { unit: 'ml', aliases: 'kava latte' }),
  food('Kakao s mliekom', 80, 3.4, 11, 2, [['1 hrnček', 250]], { unit: 'ml', aliases: 'kakao' }),

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
]

// bez diakritiky a malými písmenami, aby „ryza“ našlo „Ryža“
const plain = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()

const INDEX = FOODS.map((item) => ({ item, name: plain(item.name), all: plain(`${item.name} ${item.aliases}`) }))

// Každé napísané slovo sa musí nájsť v názve alebo inom názve; navrchu sú jedlá, ktorých názov tak začína.
export function searchFoods(query: string, limit = 25): Food[] {
  const words = plain(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  return INDEX.filter((entry) => words.every((word) => entry.all.includes(word)))
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
