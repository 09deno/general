import { EXERCISES, type Exercise, type ExerciseKind, type MuscleGroup } from '../data/exercises'
import { supabase } from './supabase'

export type PlanDay = { id: string; name: string; exercises: string[] }
export type Plan = { split: string; days: PlanDay[] }

// Hotové splity – dni sú prázdne, cviky si každý pridá sám.
export const SPLITS: { name: string; days: string[]; hint: string }[] = [
  { name: 'Push / Pull / Legs', days: ['Push', 'Pull', 'Legs'], hint: 'Tlaky, ťahy, nohy – 3 dni' },
  { name: 'Push / Pull / Legs / Upper', days: ['Push', 'Pull', 'Legs', 'Upper'], hint: 'PPL + horná časť – 4 dni' },
  { name: 'Push / Pull / Legs ×2', days: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'], hint: 'Každá partia 2× do týždňa – 6 dní' },
  { name: 'Upper / Lower', days: ['Upper', 'Lower'], hint: 'Horná a dolná časť tela – 2 dni' },
  { name: 'Upper / Lower ×2', days: ['Upper A', 'Lower A', 'Upper B', 'Lower B'], hint: 'Horná a dolná 2× do týždňa – 4 dni' },
  { name: 'Upper / Lower / Push / Pull / Legs', days: ['Upper', 'Lower', 'Push', 'Pull', 'Legs'], hint: 'Kombinácia – 5 dní' },
  { name: 'PHUL', days: ['Power Upper', 'Power Lower', 'Hypertrophy Upper', 'Hypertrophy Lower'], hint: 'Sila + objem – 4 dni' },
  { name: 'Arnold split', days: ['Hrudník + Chrbát', 'Ramená + Ruky', 'Nohy'], hint: 'Ako Arnold – 3 dni' },
  {
    name: 'Hrudník+Triceps / Chrbát+Biceps / Nohy+Ramená',
    days: ['Hrudník + Triceps', 'Chrbát + Biceps', 'Nohy + Ramená'],
    hint: 'Klasika – 3 dni',
  },
  { name: 'Full body', days: ['Full body A', 'Full body B', 'Full body C'], hint: 'Celé telo 3× do týždňa' },
  { name: 'Bro split', days: ['Hrudník', 'Chrbát', 'Nohy', 'Ramená', 'Ruky'], hint: 'Každý deň iná partia – 5 dní' },
]

// rýchle pridanie dní pri skladaní vlastného splitu
export const DAY_NAMES = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full body', 'Hrudník', 'Chrbát', 'Nohy', 'Ramená', 'Ruky', 'Brucho']

// názov vlastného splitu z jeho dní: „Push / Pull / Legs / Upper“
export const splitName = (days: string[]) => {
  const name = days.join(' / ')
  return name.length > 60 ? `${name.slice(0, 59)}…` : name
}

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
