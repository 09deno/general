// Bežné cviky vo fitku. Kto nájde chýbajúci, pridá si vlastný (tabuľka custom_exercises).

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
  { value: 'biceps', label: 'Biceps' },
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
  ex('bench-press', 'Bench press (tlak na lavici)', 'chest', 'weight', 'benc tlak na rovnej lavici'),
  ex('incline-bench-press', 'Šikmý bench press', 'chest', 'weight', 'benc šikmá lavica hore incline'),
  ex('dumbbell-bench-press', 'Tlak s jednoručkami na lavici', 'chest', 'weight', 'jednoručky benc'),
  ex('incline-dumbbell-press', 'Šikmý tlak s jednoručkami', 'chest', 'weight', 'jednoručky incline'),
  ex('dumbbell-fly', 'Rozpažovanie s jednoručkami', 'chest', 'weight', 'flys rozpaž'),
  ex('pec-deck', 'Peck deck (butterfly)', 'chest', 'weight', 'stroj motýlik'),
  ex('cable-crossover', 'Kladky – crossover', 'chest', 'weight', 'kladka krížom'),
  ex('chest-press-machine', 'Tlaky na stroji (hrudník)', 'chest', 'weight', 'stroj chest press'),
  ex('push-up', 'Kliky', 'chest', 'bodyweight', 'push up'),
  ex('dips', 'Dipy na bradlách', 'chest', 'bodyweight', 'bradla'),

  // Chrbát
  ex('pull-up', 'Zhyby', 'back', 'bodyweight', 'pull up hrazda'),
  ex('chin-up', 'Zhyby podhmatom', 'back', 'bodyweight', 'chin up hrazda'),
  ex('lat-pulldown', 'Sťahovanie kladky k hrudi', 'back', 'weight', 'lat pulldown horná kladka'),
  ex('barbell-row', 'Príťahy s činkou v predklone', 'back', 'weight', 'veslovanie row'),
  ex('dumbbell-row', 'Príťahy jednoručky v predklone', 'back', 'weight', 'veslovanie jednoručka row'),
  ex('seated-cable-row', 'Príťahy kladky v sede', 'back', 'weight', 'veslovanie spodná kladka row'),
  ex('t-bar-row', 'T-bar príťahy', 'back', 'weight', 'veslovanie row'),
  ex('deadlift', 'Mŕtvy ťah', 'back', 'weight', 'deadlift mrtvy tah'),
  ex('back-extension', 'Hyperextenzie', 'back', 'bodyweight', 'spodný chrbát'),
  ex('shrugs', 'Krčenie ramien (trapézy)', 'back', 'weight', 'shrugs trapez'),

  // Nohy
  ex('squat', 'Drep s činkou', 'legs', 'weight', 'drepy squat'),
  ex('goblet-squat', 'Goblet drep', 'legs', 'weight', 'drep jednoručka kettlebell'),
  ex('leg-press', 'Leg press', 'legs', 'weight', 'nohy stroj tlak'),
  ex('lunges', 'Výpady', 'legs', 'weight', 'vypady'),
  ex('bulgarian-split-squat', 'Bulharské drepy', 'legs', 'weight', 'bulharsky drep'),
  ex('romanian-deadlift', 'Rumunský mŕtvy ťah', 'legs', 'weight', 'rdl mrtvy tah'),
  ex('leg-extension', 'Predkopávanie na stroji', 'legs', 'weight', 'leg extension stehná'),
  ex('leg-curl', 'Zakopávanie na stroji', 'legs', 'weight', 'leg curl hamstringy'),
  ex('hip-thrust', 'Hip thrust', 'legs', 'weight', 'zadok gluteus'),
  ex('calf-raise', 'Výpony na lýtka', 'legs', 'weight', 'lytka'),

  // Ramená
  ex('overhead-press', 'Tlak nad hlavu s činkou', 'shoulders', 'weight', 'military press ohp'),
  ex('dumbbell-shoulder-press', 'Tlak s jednoručkami nad hlavu', 'shoulders', 'weight', 'jednoručky ramena'),
  ex('arnold-press', 'Arnold press', 'shoulders', 'weight', 'jednoručky'),
  ex('lateral-raise', 'Upažovanie s jednoručkami', 'shoulders', 'weight', 'upaz bočné delty'),
  ex('front-raise', 'Predpažovanie', 'shoulders', 'weight', 'predpaz'),
  ex('face-pull', 'Face pull', 'shoulders', 'weight', 'kladka zadné delty'),
  ex('reverse-fly', 'Zadné rozpažovanie', 'shoulders', 'weight', 'zadne delty reverse'),

  // Biceps
  ex('barbell-curl', 'Bicepsový zdvih s činkou', 'biceps', 'weight', 'bicak curl'),
  ex('dumbbell-curl', 'Bicepsový zdvih s jednoručkami', 'biceps', 'weight', 'bicak curl'),
  ex('hammer-curl', 'Kladivové zdvihy', 'biceps', 'weight', 'hammer bicak'),
  ex('cable-curl', 'Bicepsový zdvih na kladke', 'biceps', 'weight', 'bicak kladka'),
  ex('preacher-curl', 'Bicepsový zdvih na Scottovej lavici', 'biceps', 'weight', 'scott bicak'),

  // Triceps
  ex('triceps-pushdown', 'Tricepsové sťahovanie na kladke', 'triceps', 'weight', 'tricak kladka pushdown'),
  ex('skull-crusher', 'Francúzsky tlak', 'triceps', 'weight', 'skull crusher tricak'),
  ex('close-grip-bench', 'Bench press úzkym úchopom', 'triceps', 'weight', 'benc uzky tricak'),
  ex('overhead-triceps-extension', 'Tricepsové predĺženie nad hlavou', 'triceps', 'weight', 'tricak jednoručka'),
  ex('bench-dips', 'Dipy na lavičke', 'triceps', 'bodyweight', 'tricak lavicka'),

  // Brucho
  ex('crunch', 'Sed-ľah / crunch', 'abs', 'bodyweight', 'brusaky sklapacky'),
  ex('plank', 'Plank (výdrž)', 'abs', 'time', 'doska brusaky'),
  ex('hanging-leg-raise', 'Zdvihy nôh vo vise', 'abs', 'bodyweight', 'brusaky hrazda'),
  ex('russian-twist', 'Ruské twisty', 'abs', 'bodyweight', 'brusaky'),
  ex('ab-wheel', 'Brušné koliesko', 'abs', 'bodyweight', 'brusaky koliesko'),
  ex('cable-crunch', 'Crunch na kladke', 'abs', 'weight', 'brusaky kladka'),

  // Celé telo
  ex('kettlebell-swing', 'Kettlebell swing', 'full_body', 'weight', 'kettlebel'),
  ex('burpees', 'Burpees', 'full_body', 'bodyweight', 'angličáky'),
  ex('farmers-walk', 'Farmárska chôdza', 'full_body', 'weight', 'farmer walk'),
]

export const GROUP_LABELS = Object.fromEntries(GROUPS.map((group) => [group.value, group.label])) as Record<MuscleGroup, string>

const plain = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()

// každé napísané slovo musí byť v názve alebo inom názve (bez diakritiky)
export function matchesExercise(exercise: Exercise, query: string) {
  const words = plain(query).split(/\s+/).filter(Boolean)
  const text = plain(`${exercise.name} ${exercise.aliases} ${GROUP_LABELS[exercise.group]}`)
  return words.every((word) => text.includes(word))
}
