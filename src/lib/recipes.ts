import type { NewFoodEntry } from './food'
import { supabase } from './supabase'

// surovina receptu s hodnotami pre zadané množstvo (alebo položka uloženého jedla)
export type RecipeItem = Omit<NewFoodEntry, 'day' | 'meal'>

// Vlastný recept zo surovín (napr. „Mamina sviečková“ na 4 porcie)
// alebo uložené jedlo (napr. „Môj ovsák“) – to je recept na 1 porciu.
export type Recipe = { id: string; name: string; portions: number; items: RecipeItem[] }

const COLUMNS = 'id, name, portions, items'

const fromRow = (row: Recipe): Recipe => ({ ...row, portions: Number(row.portions) })

export async function loadRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase.from('recipes').select(COLUMNS).order('name')
  if (error) throw error
  return data.map(fromRow)
}

export async function loadRecipe(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase.from('recipes').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data && fromRow(data)
}

// nový recept (bez id) alebo zmena existujúceho
export async function saveRecipe(recipe: Omit<Recipe, 'id'> & { id?: string }): Promise<Recipe> {
  const { id, ...values } = recipe
  const query = id
    ? supabase.from('recipes').update({ ...values, updated_at: new Date().toISOString() }).eq('id', id)
    : supabase.from('recipes').insert(values)
  const { data, error } = await query.select(COLUMNS).single()
  if (error) throw error
  return fromRow(data)
}

export async function deleteRecipe(id: string) {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) throw error
}

// súčet všetkých surovín
export function recipeTotal(items: RecipeItem[]) {
  return items.reduce(
    (sum, item) => ({
      kcal: sum.kcal + item.kcal,
      protein: sum.protein + Number(item.protein_g),
      carbs: sum.carbs + Number(item.carbs_g),
      fat: sum.fat + Number(item.fat_g),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

// koľko porcií sa dá ťuknúť pri pridávaní
export const PORTION_CHOICES = [0.5, 1, 1.5, 2]

// „½ porcie“, „1 porcia“, „1½ porcie“, „2 porcie“
export function portionLabel(count: number): string {
  const whole = Math.floor(count)
  const number = count % 1 ? `${whole || ''}½` : String(whole)
  if (count === 1) return '1 porcia'
  return count < 5 ? `${number} porcie` : `${number} porcií`
}

// záznam do jedla dňa: hodnoty pre zjedený počet porcií
export function recipeEntry(recipe: Recipe, count: number): RecipeItem {
  const total = recipeTotal(recipe.items)
  const share = count / recipe.portions
  const round = (value: number) => Math.round(value * share * 10) / 10
  return {
    name: count === 1 ? recipe.name : `${recipe.name} (${portionLabel(count)})`,
    kcal: Math.round(total.kcal * share),
    protein_g: round(total.protein),
    carbs_g: round(total.carbs),
    fat_g: round(total.fat),
    grams: null,
    unit: 'g',
  }
}
