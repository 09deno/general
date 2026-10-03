import type { Food } from '../data/foods'
import { supabase } from './supabase'

export type ProductInput = {
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  unit: 'g' | 'ml'
}

type OffProduct = {
  product_name?: string
  product_name_sk?: string
  product_name_cs?: string
  brands?: string
  nutriments?: Record<string, number | string | undefined>
  serving_quantity?: number | string
  product_quantity?: number | string
  product_quantity_unit?: string
}

const round1 = (value: number) => Math.round(value * 10) / 10

function toFood(product: ProductInput, portions: [string, number][] = []): Food {
  return {
    ...product,
    portions: portions.map(([label, grams]) => ({ label, grams })),
    aliases: '',
  }
}

// Výrobok podľa čiarového kódu: najprv tie, ktoré partia zadala z obalu, potom bezplatná databáza
// Open Food Facts. Ak sa nenájde (alebo nemá kalórie), vráti aspoň názov, ak ho pozná.
export async function findProduct(code: string): Promise<{ food: Food } | { name: string }> {
  const { data, error } = await supabase
    .from('products')
    .select('name, kcal, protein, carbs, fat, unit')
    .eq('barcode', code)
    .maybeSingle()
  if (error) throw error
  if (data) return { food: toFood({ ...data, kcal: Number(data.kcal), protein: Number(data.protein), carbs: Number(data.carbs), fat: Number(data.fat) }) }

  // „quantity“ treba pýtať tiež, inak Open Food Facts nevráti veľkosť balenia
  const fields =
    'product_name,product_name_sk,product_name_cs,brands,nutriments,serving_quantity,quantity,product_quantity,product_quantity_unit'
  const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${fields}`, {
    signal: AbortSignal.timeout(10_000),
  })
  if (response.status === 404) return { name: '' }
  if (!response.ok) throw new Error(`Open Food Facts ${response.status}`)
  const json: { status: number; product?: OffProduct } = await response.json()
  const product = json.product
  if (json.status !== 1 || !product) return { name: '' }

  const name = productName(product)
  const n = product.nutriments ?? {}
  const value = (key: string) => (n[key] === undefined || n[key] === '' ? undefined : Number(n[key]))
  const kcal = value('energy-kcal_100g') ?? (value('energy_100g') !== undefined ? value('energy_100g')! / 4.184 : undefined)
  if (kcal === undefined || !Number.isFinite(kcal)) return { name }

  const unit = product.product_quantity_unit === 'ml' ? 'ml' : 'g'
  const portions: [string, number][] = []
  const serving = Number(product.serving_quantity)
  const pack = Number(product.product_quantity)
  if (serving > 0 && serving <= 5000) portions.push(['1 porcia', round1(serving)])
  if (pack > 0 && pack <= 5000 && pack !== serving) portions.push(['celé balenie', round1(pack)])

  return {
    food: toFood(
      {
        name,
        kcal: round1(kcal),
        protein: round1(value('proteins_100g') ?? 0),
        carbs: round1(value('carbohydrates_100g') ?? 0),
        fat: round1(value('fat_100g') ?? 0),
        unit,
      },
      portions,
    ),
  }
}

// „Nutella“ alebo „Rajo Mlieko polotučné“ – značka pred názvom, ak v ňom už nie je
function productName(product: OffProduct) {
  const name = (product.product_name_sk || product.product_name_cs || product.product_name || '').trim()
  const brand = (product.brands ?? '').split(',')[0].trim()
  const full = !brand || name.toLowerCase().includes(brand.toLowerCase()) ? name : `${brand} ${name}`.trim()
  return full.slice(0, 100)
}

// výrobok zadaný z obalu – zapamätá sa pre celú partiu
export async function saveProduct(code: string, product: ProductInput): Promise<Food> {
  const { error } = await supabase.from('products').insert({ barcode: code, ...product })
  // ten istý výrobok medzitým zadal niekto iný – použijeme naše hodnoty, nevadí
  if (error && error.code !== '23505') throw error
  return toFood(product)
}
