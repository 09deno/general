import type { ExerciseKind, MuscleGroup } from '../data/exercises'
import { supabase } from './supabase'
import type { PlanDay } from './training'

// Séria: činka/stroj kg × opakovania, vlastná váha opakovania (prípadne + kg), na čas sekundy.
// Do histórie a minulého výkonu sa rátajú len odcvičené (done = ✓).
export type WorkoutSet = { kg: number | null; reps: number | null; seconds: number | null; done: boolean }

// cvik v tréningu – názov a druh sa uložia, aby história ostala, aj keď sa plán zmení
export type WorkoutExercise = { key: string; name: string; group: MuscleGroup; kind: ExerciseKind; sets: WorkoutSet[] }

export type Workout = {
  id: string
  day: string
  plan_day_id: string | null
  name: string
  exercises: WorkoutExercise[]
  created_at: string
}

const COLUMNS = 'id, day, plan_day_id, name, exercises, created_at'

// posledné tréningy do daného dňa (vrátane), najnovšie navrchu – na návrh ďalšieho dňa a minulý výkon
export async function loadRecent(upTo: string): Promise<Workout[]> {
  const { data, error } = await supabase
    .from('workouts')
    .select(COLUMNS)
    .lte('day', upTo)
    .order('day', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(60)
  if (error) throw error
  return data
}

export async function loadWorkout(id: string): Promise<Workout | null> {
  const { data, error } = await supabase.from('workouts').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createWorkout(workout: Omit<Workout, 'id' | 'created_at'>): Promise<Workout> {
  const { data, error } = await supabase.from('workouts').insert(workout).select(COLUMNS).single()
  if (error) throw error
  return data
}

export async function saveExercises(id: string, exercises: WorkoutExercise[]) {
  const { error } = await supabase
    .from('workouts')
    .update({ exercises, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteWorkout(id: string) {
  const { error } = await supabase.from('workouts').delete().eq('id', id)
  if (error) throw error
}

export const doneSets = (exercise: WorkoutExercise) => exercise.sets.filter((set) => set.done)

// minulý výkon cviku: odcvičené série z posledného tréningu, kde bol (okrem tréningu `except`)
export function lastSets(recent: Workout[], key: string, except?: string): { day: string; sets: WorkoutSet[] } | null {
  for (const workout of recent) {
    if (workout.id === except) continue
    const exercise = workout.exercises.find((item) => item.key === key)
    const sets = exercise ? doneSets(exercise) : []
    if (sets.length > 0) return { day: workout.day, sets }
  }
  return null
}

// série na začiatok tréningu: ako minule (bez ✓), cvik robený prvýkrát 3 prázdne
export function startSets(previous: WorkoutSet[] | undefined): WorkoutSet[] {
  if (previous?.length) return previous.map((set) => ({ ...set, done: false }))
  return Array.from({ length: 3 }, () => ({ kg: null, reps: null, seconds: null, done: false }))
}

// ďalší deň plánu po poslednom tréningu (po Push príde Pull…); bez tréningu prvý deň
export function nextPlanDay(days: PlanDay[], recent: Workout[]): PlanDay | undefined {
  const last = recent[0]
  if (!last) return days[0]
  let index = days.findIndex((day) => day.id === last.plan_day_id)
  // plán sa medzitým zmenil – skúsi sa deň s rovnakým názvom
  if (index < 0) index = days.findIndex((day) => day.name === last.name)
  return index < 0 ? days[0] : days[(index + 1) % days.length]
}

export const formatNumber = (value: number) => value.toLocaleString('sk', { maximumFractionDigits: 2 })

// „60 kg × 10“, vlastná váha „12×“ alebo „+10 kg × 8“, na čas „45 s“
export function setLabel(kind: ExerciseKind, set: WorkoutSet): string {
  if (kind === 'time') return `${set.seconds ?? 0} s`
  if (kind === 'bodyweight') return set.kg ? `+${formatNumber(set.kg)} kg × ${set.reps ?? 0}` : `${set.reps ?? 0}×`
  return `${formatNumber(set.kg ?? 0)} kg × ${set.reps ?? 0}`
}
