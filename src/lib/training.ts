import { EXERCISES, type Exercise, type ExerciseKind, type MuscleGroup } from '../data/exercises'
import { supabase } from './supabase'

export type PlanDay = { id: string; name: string; exercises: string[] }
export type Plan = { split: string; days: PlanDay[] }

// Hotové splity – dni sú prázdne, cviky si každý pridá sám.
export const SPLITS: { name: string; days: string[]; hint: string }[] = [
  { name: 'Push / Pull / Nohy', days: ['Push', 'Pull', 'Nohy'], hint: 'Tlaky, ťahy a nohy – 3 dni' },
  { name: 'Horná / Dolná časť', days: ['Horná časť', 'Dolná časť'], hint: 'Vrch a spodok tela – 2 dni' },
  { name: 'Celé telo', days: ['Celé telo'], hint: 'Celé telo naraz – 1 deň, opakuješ ho' },
  { name: 'Bro split', days: ['Hrudník', 'Chrbát', 'Nohy', 'Ramená', 'Ruky'], hint: 'Každý deň iná partia – 5 dní' },
]

export const CUSTOM_SPLIT = 'Vlastný plán'

export const newDay = (name: string): PlanDay => ({ id: crypto.randomUUID(), name, exercises: [] })

export async function loadPlan(): Promise<Plan | null> {
  const { data, error } = await supabase.from('training_plans').select('split, days').maybeSingle()
  if (error) throw error
  return data
}

// prihlásený používateľ (z pamäte telefónu, bez dopytu na server)
async function userId() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user.id
}

export async function savePlan(plan: Plan) {
  const { error } = await supabase
    .from('training_plans')
    .upsert({ user_id: await userId(), split: plan.split, days: plan.days, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function deletePlan() {
  const { error } = await supabase.from('training_plans').delete().eq('user_id', await userId())
  if (error) throw error
}

type CustomRow = { id: string; name: string; muscle_group: MuscleGroup; kind: ExerciseKind }

const fromRow = (row: CustomRow): Exercise => ({
  key: `custom:${row.id}`,
  name: row.name,
  group: row.muscle_group,
  kind: row.kind,
  aliases: 'vlastný',
})

export async function loadCustomExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase.from('custom_exercises').select('id, name, muscle_group, kind').order('name')
  if (error) throw error
  return data.map(fromRow)
}

export async function addCustomExercise(name: string, group: MuscleGroup, kind: ExerciseKind): Promise<Exercise> {
  const { data, error } = await supabase
    .from('custom_exercises')
    .insert({ name, muscle_group: group, kind })
    .select('id, name, muscle_group, kind')
    .single()
  if (error) throw error
  return fromRow(data)
}

// cvik podľa kľúča – zo zoznamu appky alebo z vlastných
export function findExercise(key: string, custom: Exercise[]): Exercise | undefined {
  return EXERCISES.find((item) => item.key === key) ?? custom.find((item) => item.key === key)
}
