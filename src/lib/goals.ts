import { supabase } from './supabase'

export type Sex = 'male' | 'female'
export type Activity = 'none' | 'low' | 'medium' | 'high'
export type Goal = 'lose' | 'recomp' | 'maintain' | 'gain'

export type Answers = {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activity: Activity
  goal: Goal
}

export type Targets = { kcal: number; proteinG: number; carbsG: number; fatG: number }

// riadok tabuľky goals
export type GoalsRow = {
  sex: Sex
  birth_year: number
  height_cm: number
  weight_kg: number
  activity: Activity
  goal: Goal
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

// koľkokrát viac kalórií spáli za deň, než v pokoji – podľa toho, ako často športuje
const ACTIVITY_FACTOR: Record<Activity, number> = { none: 1.2, low: 1.375, medium: 1.55, high: 1.725 }
// o koľko zje menej / viac, než denne spáli
const GOAL_CHANGE: Record<Goal, number> = { lose: -0.15, recomp: -0.05, maintain: 0, gain: 0.1 }
// gramy bielkovín na kg váhy
const PROTEIN_PER_KG: Record<Goal, number> = { lose: 2, recomp: 2, maintain: 1.6, gain: 1.8 }
// pod toto appka nikdy nejde
const MIN_KCAL: Record<Sex, number> = { male: 1500, female: 1200 }
export const MAX_KCAL = 6000
export const MIN_PROTEIN = 40
const FAT_SHARE = 0.25
const MAX_PROTEIN_SHARE = 0.4

const roundTo = (value: number, step: number) => Math.round(value / step) * step

export function calculate(answers: Answers) {
  const { sex, age, heightCm, weightKg, activity, goal } = answers
  // vzorec Mifflin-St Jeor: koľko telo spáli v pokoji
  const resting = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161)
  // koľko spáli za celý deň – pri tomto príjme sa váha nemení
  const maintenance = roundTo(resting * ACTIVITY_FACTOR[activity], 50)
  // mladší ako 18 rokov nikdy nejedia menej, než spália – telo ešte rastie
  const youth = age < 18
  const change = youth ? Math.max(0, GOAL_CHANGE[goal]) : GOAL_CHANGE[goal]
  const minKcal = youth ? Math.max(MIN_KCAL[sex], maintenance) : MIN_KCAL[sex]
  const kcal = Math.min(MAX_KCAL, Math.max(minKcal, roundTo(maintenance * (1 + change), 50)))
  return { maintenance, minKcal, youth, ...macros(kcal, weightKg * PROTEIN_PER_KG[goal]) }
}

// Tuky sú štvrtina kalórií, zvyšok po bielkovinách pripadne na sacharidy.
export function macros(kcal: number, protein: number): Targets {
  const proteinG = Math.min(Math.max(MIN_PROTEIN, roundTo(protein, 5)), maxProtein(kcal))
  const fatG = roundTo((kcal * FAT_SHARE) / 9, 5)
  const carbsG = Math.max(0, roundTo((kcal - proteinG * 4 - fatG * 9) / 4, 5))
  return { kcal, proteinG, carbsG, fatG }
}

// bielkovín najviac toľko, aby ostalo aj na sacharidy
export function maxProtein(kcal: number) {
  return Math.floor((kcal * MAX_PROTEIN_SHARE) / 4 / 5) * 5
}

export async function loadGoals(userId: string): Promise<GoalsRow | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('sex, birth_year, height_cm, weight_kg, activity, goal, kcal, protein_g, carbs_g, fat_g')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveGoals(userId: string, answers: Answers, targets: Targets): Promise<GoalsRow> {
  const row: GoalsRow = {
    sex: answers.sex,
    // vek sa ukladá ako rok narodenia, aby sa časom posúval sám
    birth_year: new Date().getFullYear() - answers.age,
    height_cm: answers.heightCm,
    weight_kg: answers.weightKg,
    activity: answers.activity,
    goal: answers.goal,
    kcal: targets.kcal,
    protein_g: targets.proteinG,
    carbs_g: targets.carbsG,
    fat_g: targets.fatG,
  }
  const { error } = await supabase
    .from('goals')
    .upsert({ user_id: userId, ...row, updated_at: new Date().toISOString() })
  if (error) throw error
  return row
}
