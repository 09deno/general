import { supabase } from './supabase'

export type Meal = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner'

export const MEALS: { value: Meal; label: string }[] = [
  { value: 'breakfast', label: 'Raňajky' },
  { value: 'morning_snack', label: 'Desiata' },
  { value: 'lunch', label: 'Obed' },
  { value: 'afternoon_snack', label: 'Olovrant' },
  { value: 'dinner', label: 'Večera' },
]

export type FoodEntry = {
  id: string
  meal: Meal
  name: string
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export type NewFoodEntry = Omit<FoodEntry, 'id'> & { day: string }

const ZONE = 'Europe/Bratislava'

// dnešný deň na Slovensku ako „2026-10-03“
export function today(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONE }).format(new Date())
}

// deň z adresy (?den=2026-10-01); neplatný alebo budúci deň = dnes
export function parseDay(value: string | null): string {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) && value <= today() ? value : today()
}

export function shiftDay(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

// „Dnes“, „Včera“ alebo napr. „Štvrtok 1. 10.“
export function dayLabel(day: string): string {
  if (day === today()) return 'Dnes'
  if (day === shiftDay(today(), -1)) return 'Včera'
  const date = new Date(`${day}T12:00:00Z`)
  const weekday = new Intl.DateTimeFormat('sk', { weekday: 'long', timeZone: 'UTC' }).format(date)
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${date.getUTCDate()}. ${date.getUTCMonth() + 1}.`
}

// Predvolené jedlo podľa času – dá sa zmeniť, obed môže byť aj o 11 či o 15.
export function mealForNow(): Meal {
  const [hours, minutes] = new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hour: '2-digit', minute: '2-digit' })
    .format(new Date())
    .split(':')
    .map(Number)
  const time = hours * 60 + minutes
  if (time < 10 * 60) return 'breakfast'
  if (time < 11 * 60 + 30) return 'morning_snack'
  if (time < 14 * 60 + 30) return 'lunch'
  if (time < 17 * 60) return 'afternoon_snack'
  return 'dinner'
}

export function sumEntries(entries: FoodEntry[]) {
  return entries.reduce(
    (sum, entry) => ({
      kcal: sum.kcal + entry.kcal,
      protein: sum.protein + Number(entry.protein_g),
      carbs: sum.carbs + Number(entry.carbs_g),
      fat: sum.fat + Number(entry.fat_g),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

export async function loadEntries(day: string): Promise<FoodEntry[]> {
  const { data, error } = await supabase
    .from('food_entries')
    .select('id, meal, name, kcal, protein_g, carbs_g, fat_g')
    .eq('day', day)
    .order('created_at')
  if (error) throw error
  return data
}

export async function addEntry(entry: NewFoodEntry) {
  const { error } = await supabase.from('food_entries').insert(entry)
  if (error) throw error
}

export async function deleteEntry(id: string) {
  const { error } = await supabase.from('food_entries').delete().eq('id', id)
  if (error) throw error
}
