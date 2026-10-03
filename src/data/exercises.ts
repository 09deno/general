// Bežné cviky vo fitku – anglické názvy, ako sa hovorí vo fitku (želanie majiteľa), slovenské názvy
// sú v aliases, aby sa dali nájsť aj po slovensky. Chýbajúci cvik si každý pridá sám (custom_exercises).

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'biceps' | 'triceps' | 'abs' | 'full_body'
// činka alebo stroj (opakovania × kg), vlastná váha (opakovania, prípadne + kg), na čas (sekundy)
export type ExerciseKind = 'weight' | 'bodyweight' | 'time'

export type Exercise = {
  // knižnica: napr. „bench-press“; vlastný cvik: „custom:<id>“
  key: string
  name: string
  group: MuscleGroup
  kind: ExerciseKind
  aliases: string
}

export const GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: 'Hrudník' },
  { value: 'back', label: 'Chrbát' },
  { value: 'legs', label: 'Nohy' },
  { value: 'shoulders', label: 'Ramená' },
  { value: 'biceps', label: 'Biceps a predlaktie' },
  { value: 'triceps', label: 'Triceps' },
  { value: 'abs', label: 'Brucho' },
  { value: 'full_body', label: 'Celé telo' },
]

export const KINDS: { value: ExerciseKind; label: string }[] = [
  { value: 'weight', label: 'Činka / stroj' },
  { value: 'bodyweight', label: 'Vlastná váha' },
  { value: 'time', label: 'Na čas' },
]

const ex = (key: string, name: string, group: MuscleGroup, kind: ExerciseKind = 'weight', aliases = ''): Exercise => ({
  key,
  name,
  group,
  kind,
  aliases,
})

export const EXERCISES: Exercise[] = [
  // Hrudník
  ex('bench-press', 'Barbell Bench Press', 'chest', 'weight', 'bench benc tlak na rovnej lavici s činkou'),
  ex('incline-bench-press', 'Incline Barbell Bench Press', 'chest', 'weight', 'šikmý bench benc šikmá lavica'),
  ex('decline-bench-press', 'Decline Bench Press', 'chest', 'weight', 'benc negatívna lavica dole'),
  ex('dumbbell-bench-press', 'Dumbbell Bench Press', 'chest', 'weight', 'tlak s jednoručkami na lavici benc'),
  ex('incline-dumbbell-press', 'Incline Dumbbell Press', 'chest', 'weight', 'šikmý tlak s jednoručkami'),
  ex('decline-dumbbell-press', 'Decline Dumbbell Press', 'chest', 'weight', 'tlak jednoručky negatívna lavica'),
  ex('smith-bench-press', 'Smith Machine Bench Press', 'chest', 'weight', 'smith benc tlak'),
  ex('smith-incline-press', 'Smith Machine Incline Press', 'chest', 'weight', 'smith šikmý tlak'),
  ex('chest-press-machine', 'Machine Chest Press', 'chest', 'weight', 'tlaky na stroji hrudník'),
  ex('incline-machine-press', 'Incline Machine Press', 'chest', 'weight', 'šikmý tlak na stroji'),
  ex('dumbbell-fly', 'Dumbbell Fly', 'chest', 'weight', 'rozpažovanie s jednoručkami flys'),
  ex('incline-dumbbell-fly', 'Incline Dumbbell Fly', 'chest', 'weight', 'rozpažovanie šikmá lavica'),
  ex('pec-deck', 'Pec Deck (Butterfly)', 'chest', 'weight', 'peck deck butterfly motýlik stroj'),
  ex('cable-crossover', 'Cable Crossover', 'chest', 'weight', 'kladky krížom crossover'),
  ex('low-cable-fly', 'Low-to-High Cable Fly', 'chest', 'weight', 'kladky zdola nahor'),
  ex('dumbbell-pullover', 'Dumbbell Pullover', 'chest', 'weight', 'pullover jednoručka'),
  ex('push-up', 'Push-up', 'chest', 'bodyweight', 'kliky'),
  ex('dips', 'Chest Dips', 'chest', 'bodyweight', 'dipy na bradlách bradla'),

  // Chrbát
  ex('pull-up', 'Pull-up', 'back', 'bodyweight', 'zhyby hrazda nadhmatom'),
  ex('chin-up', 'Chin-up', 'back', 'bodyweight', 'zhyby podhmatom hrazda'),
  ex('assisted-pull-up', 'Assisted Pull-up', 'back', 'weight', 'zhyby s dopomocou stroj'),
  ex('inverted-row', 'Inverted Row', 'back', 'bodyweight', 'austrálske zhyby príťahy'),
  ex('lat-pulldown', 'Lat Pulldown', 'back', 'weight', 'sťahovanie kladky k hrudi horná kladka'),
  ex('close-grip-pulldown', 'Close-Grip Lat Pulldown', 'back', 'weight', 'sťahovanie kladky úzky úchop'),
  ex('straight-arm-pulldown', 'Straight-Arm Pulldown', 'back', 'weight', 'sťahovanie kladky s vystretými rukami'),
  ex('barbell-row', 'Barbell Row', 'back', 'weight', 'príťahy s činkou v predklone veslovanie'),
  ex('pendlay-row', 'Pendlay Row', 'back', 'weight', 'príťahy veslovanie'),
  ex('dumbbell-row', 'One-Arm Dumbbell Row', 'back', 'weight', 'príťahy jednoručky v predklone veslovanie'),
  ex('seated-cable-row', 'Seated Cable Row', 'back', 'weight', 'príťahy kladky v sede spodná kladka veslovanie'),
  ex('t-bar-row', 'T-Bar Row', 'back', 'weight', 'príťahy veslovanie'),
  ex('chest-supported-row', 'Chest-Supported Row', 'back', 'weight', 'príťahy s oporou hrudníka'),
  ex('machine-row', 'Machine Row', 'back', 'weight', 'príťahy na stroji veslovanie'),
  ex('deadlift', 'Deadlift', 'back', 'weight', 'mŕtvy ťah'),
  ex('rack-pull', 'Rack Pull', 'back', 'weight', 'mŕtvy ťah zo stojana'),
  ex('good-morning', 'Good Morning', 'back', 'weight', 'predklony s činkou'),
  ex('back-extension', 'Back Extension', 'back', 'bodyweight', 'hyperextenzie spodný chrbát'),
  ex('shrugs', 'Barbell Shrugs', 'back', 'weight', 'krčenie ramien trapézy'),
  ex('dumbbell-shrugs', 'Dumbbell Shrugs', 'back', 'weight', 'krčenie ramien jednoručky trapézy'),

  // Nohy
  ex('squat', 'Barbell Back Squat', 'legs', 'weight', 'drep s činkou drepy'),
  ex('front-squat', 'Front Squat', 'legs', 'weight', 'predný drep'),
  ex('goblet-squat', 'Goblet Squat', 'legs', 'weight', 'drep s jednoručkou kettlebell'),
  ex('hack-squat', 'Hack Squat', 'legs', 'weight', 'drep na stroji'),
  ex('smith-squat', 'Smith Machine Squat', 'legs', 'weight', 'drep smith'),
  ex('bodyweight-squat', 'Bodyweight Squat', 'legs', 'bodyweight', 'drep bez záťaže drepy'),
  ex('leg-press', 'Leg Press', 'legs', 'weight', 'nohy tlak na stroji'),
  ex('lunges', 'Lunges', 'legs', 'weight', 'výpady'),
  ex('walking-lunges', 'Walking Lunges', 'legs', 'weight', 'výpady v chôdzi'),
  ex('bulgarian-split-squat', 'Bulgarian Split Squat', 'legs', 'weight', 'bulharské drepy'),
  ex('step-up', 'Step-up', 'legs', 'weight', 'výstupy na lavičku'),
  ex('romanian-deadlift', 'Romanian Deadlift', 'legs', 'weight', 'rumunský mŕtvy ťah rdl'),
  ex('stiff-leg-deadlift', 'Stiff-Leg Deadlift', 'legs', 'weight', 'mŕtvy ťah s vystretými nohami'),
  ex('sumo-deadlift', 'Sumo Deadlift', 'legs', 'weight', 'sumo mŕtvy ťah'),
  ex('leg-extension', 'Leg Extension', 'legs', 'weight', 'predkopávanie na stroji stehná'),
  ex('leg-curl', 'Lying Leg Curl', 'legs', 'weight', 'zakopávanie ležmo hamstringy'),
  ex('seated-leg-curl', 'Seated Leg Curl', 'legs', 'weight', 'zakopávanie v sede hamstringy'),
  ex('hip-thrust', 'Barbell Hip Thrust', 'legs', 'weight', 'zadok gluteus'),
  ex('glute-bridge', 'Glute Bridge', 'legs', 'bodyweight', 'zadok mostík'),
  ex('cable-kickback', 'Cable Glute Kickback', 'legs', 'weight', 'zadok kladka zakopnutie'),
  ex('hip-abduction', 'Hip Abduction Machine', 'legs', 'weight', 'unožovanie stroj zadok vonkajšie stehná'),
  ex('hip-adduction', 'Hip Adduction Machine', 'legs', 'weight', 'pripažovanie stroj vnútorné stehná'),
  ex('calf-raise', 'Standing Calf Raise', 'legs', 'weight', 'výpony v stoji lýtka'),
  ex('seated-calf-raise', 'Seated Calf Raise', 'legs', 'weight', 'výpony v sede lýtka'),

  // Ramená
  ex('overhead-press', 'Overhead Press (OHP)', 'shoulders', 'weight', 'tlak nad hlavu s činkou military press shoulder press'),
  ex('dumbbell-shoulder-press', 'Dumbbell Shoulder Press', 'shoulders', 'weight', 'seated tlak s jednoručkami nad hlavu v sede'),
  ex('machine-shoulder-press', 'Machine Shoulder Press', 'shoulders', 'weight', 'seated tlak nad hlavu na stroji v sede'),
  ex('smith-shoulder-press', 'Smith Machine Shoulder Press', 'shoulders', 'weight', 'seated tlak nad hlavu smith v sede'),
  ex('arnold-press', 'Arnold Press', 'shoulders', 'weight', 'tlak jednoručky'),
  ex('lateral-raise', 'Dumbbell Lateral Raise', 'shoulders', 'weight', 'upažovanie s jednoručkami bočné delty'),
  ex('cable-lateral-raise', 'Cable Lateral Raise', 'shoulders', 'weight', 'upažovanie na kladke'),
  ex('machine-lateral-raise', 'Machine Lateral Raise', 'shoulders', 'weight', 'upažovanie na stroji'),
  ex('front-raise', 'Front Raise', 'shoulders', 'weight', 'predpažovanie'),
  ex('upright-row', 'Upright Row', 'shoulders', 'weight', 'príťahy k bradi'),
  ex('face-pull', 'Face Pull', 'shoulders', 'weight', 'kladka zadné delty'),
  ex('reverse-fly', 'Reverse Dumbbell Fly', 'shoulders', 'weight', 'zadné rozpažovanie zadné delty'),
  ex('reverse-pec-deck', 'Reverse Pec Deck', 'shoulders', 'weight', 'zadné delty stroj butterfly'),

  // Biceps a predlaktie
  ex('barbell-curl', 'Barbell Curl', 'biceps', 'weight', 'bicepsový zdvih s činkou bicák'),
  ex('ez-bar-curl', 'EZ-Bar Curl', 'biceps', 'weight', 'bicepsový zdvih ez tyč bicák'),
  ex('dumbbell-curl', 'Dumbbell Curl', 'biceps', 'weight', 'bicepsový zdvih s jednoručkami bicák'),
  ex('incline-dumbbell-curl', 'Incline Dumbbell Curl', 'biceps', 'weight', 'bicepsový zdvih na šikmej lavici'),
  ex('hammer-curl', 'Hammer Curl', 'biceps', 'weight', 'kladivové zdvihy'),
  ex('cable-curl', 'Cable Curl', 'biceps', 'weight', 'bicepsový zdvih na kladke'),
  ex('preacher-curl', 'Preacher Curl', 'biceps', 'weight', 'scottova lavica bicák'),
  ex('concentration-curl', 'Concentration Curl', 'biceps', 'weight', 'koncentrovaný zdvih bicák'),
  ex('spider-curl', 'Spider Curl', 'biceps', 'weight', 'bicák'),
  ex('reverse-curl', 'Reverse Curl', 'biceps', 'weight', 'zdvih nadhmatom predlaktie'),
  ex('wrist-curl', 'Wrist Curl', 'biceps', 'weight', 'zápästie predlaktie'),

  // Triceps
  ex('triceps-pushdown', 'Triceps Pushdown', 'triceps', 'weight', 'tricepsové sťahovanie na kladke tricák'),
  ex('rope-pushdown', 'Rope Pushdown', 'triceps', 'weight', 'sťahovanie lana tricák'),
  ex('skull-crusher', 'Skull Crusher', 'triceps', 'weight', 'francúzsky tlak tricák'),
  ex('close-grip-bench', 'Close-Grip Bench Press', 'triceps', 'weight', 'bench úzky úchop benc tricák'),
  ex('overhead-triceps-extension', 'Overhead Triceps Extension', 'triceps', 'weight', 'tricepsové predĺženie nad hlavou jednoručka'),
  ex('cable-overhead-extension', 'Cable Overhead Extension', 'triceps', 'weight', 'tricák kladka nad hlavou'),
  ex('triceps-kickback', 'Triceps Kickback', 'triceps', 'weight', 'zakopnutie jednoručka tricák'),
  ex('machine-dip', 'Machine Dip', 'triceps', 'weight', 'dipy na stroji'),
  ex('bench-dips', 'Bench Dips', 'triceps', 'bodyweight', 'dipy na lavičke tricák'),
  ex('diamond-push-up', 'Diamond Push-up', 'triceps', 'bodyweight', 'kliky úzke diamant'),

  // Brucho
  ex('crunch', 'Crunch', 'abs', 'bodyweight', 'sed-ľah brušáky skracovačky'),
  ex('sit-up', 'Sit-up', 'abs', 'bodyweight', 'sed-ľah brušáky'),
  ex('bicycle-crunch', 'Bicycle Crunch', 'abs', 'bodyweight', 'bicykel brušáky'),
  ex('cable-crunch', 'Cable Crunch', 'abs', 'weight', 'brušáky na kladke'),
  ex('hanging-leg-raise', 'Hanging Leg Raise', 'abs', 'bodyweight', 'zdvihy nôh vo vise brušáky hrazda'),
  ex('lying-leg-raise', 'Lying Leg Raise', 'abs', 'bodyweight', 'zdvihy nôh v ľahu brušáky'),
  ex('russian-twist', 'Russian Twist', 'abs', 'bodyweight', 'ruské twisty brušáky'),
  ex('ab-wheel', 'Ab Wheel Rollout', 'abs', 'bodyweight', 'brušné koliesko'),
  ex('mountain-climber', 'Mountain Climbers', 'abs', 'bodyweight', 'horolezec brušáky'),
  ex('dead-bug', 'Dead Bug', 'abs', 'bodyweight', 'brušáky'),
  ex('plank', 'Plank', 'abs', 'time', 'doska výdrž brušáky'),
  ex('side-plank', 'Side Plank', 'abs', 'time', 'bočná doska výdrž'),

  // Celé telo
  ex('kettlebell-swing', 'Kettlebell Swing', 'full_body', 'weight', 'kettlebell švih'),
  ex('clean-and-press', 'Clean and Press', 'full_body', 'weight', 'nadhod a tlak'),
  ex('power-clean', 'Power Clean', 'full_body', 'weight', 'nadhod'),
  ex('thruster', 'Thruster', 'full_body', 'weight', 'drep s tlakom'),
  ex('sled-push', 'Sled Push', 'full_body', 'weight', 'tlačenie saní'),
  ex('farmers-walk', "Farmer's Walk", 'full_body', 'weight', 'farmárska chôdza'),
  ex('burpees', 'Burpees', 'full_body', 'bodyweight', 'angličáky'),
  ex('box-jump', 'Box Jump', 'full_body', 'bodyweight', 'výskoky na debnu'),
  ex('battle-ropes', 'Battle Ropes', 'full_body', 'time', 'laná'),
  ex('jump-rope', 'Jump Rope', 'full_body', 'time', 'švihadlo'),
]

export const GROUP_LABELS = Object.fromEntries(GROUPS.map((group) => [group.value, group.label])) as Record<MuscleGroup, string>

const plain = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()

const searchText = (exercise: Exercise) => plain(`${exercise.name} ${exercise.aliases} ${GROUP_LABELS[exercise.group]}`)

// Najprv cviky, kde sú všetky napísané slová (bez diakritiky). Ak taký nie je, napr. „seated shoulder press“,
// ukážu sa podobné – kde sedí najviac slov (aspoň 3-písmenových, „s“ či „na“ sú skoro všade).
export function searchExercises(list: Exercise[], query: string): { items: Exercise[]; exact: boolean } {
  const words = plain(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return { items: list, exact: true }
  const exact = list.filter((exercise) => words.every((word) => searchText(exercise).includes(word)))
  if (exact.length > 0) return { items: exact, exact: true }
  const long = words.filter((word) => word.length >= 3)
  const hits = (exercise: Exercise) => long.filter((word) => searchText(exercise).includes(word)).length
  const best = Math.max(0, ...list.map(hits))
  return { items: best === 0 ? [] : list.filter((exercise) => hits(exercise) === best), exact: false }
}
