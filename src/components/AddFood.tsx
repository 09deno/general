import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Circle, CircleCheck, Plus, ScanBarcode, Search, X } from 'lucide-react'
import { findFood, matchesQuery, nutrition, searchFoods, type Food, type Menu } from '../data/foods'
import {
  addEntries,
  addEntry,
  dayLabel,
  loadHistory,
  loadLastMeals,
  MEAL_AFTER_NA,
  mealForNow,
  MEALS,
  parseDay,
  sumEntries,
  today,
  type FoodEntry,
  type HistoryItem,
  type LastMeal,
  type Meal,
  type NewFoodEntry,
} from '../lib/food'
import { findProduct, saveProduct } from '../lib/products'
import { loadRecipes, PORTION_CHOICES, portionLabel, recipeEntry, recipeTotal, type Recipe } from '../lib/recipes'
import BarcodeScanner from './BarcodeScanner'

// prázdne políčko = 0, čiarka aj bodka ako desatinná čiarka
export const parseNumber = (text: string) => (text.trim() === '' ? 0 : Number(text.trim().replace(',', '.')))
export const amount = (value: number) => value.toLocaleString('sk', { maximumFractionDigits: 1 })
export const validAmount = (grams: number) => Number.isFinite(grams) && grams >= 1 && grams <= 5000
export const defaultAmount = (food: Food) => String(food.portions[0]?.grams ?? 100)

export type EntryData = Omit<NewFoodEntry, 'day' | 'meal'>
// časť jedla – základ alebo prísada; množstvo ako text z políčka
export type Part = { food: Food; grams: string }
type Values = { kcal: number; protein: number; carbs: number; fat: number }
// výber v menu: veľkosť (príloha + nápoj), ktorý nápoj a ktoré omáčky
type MenuChoice = { size: number; drink: number; sauces: number[] }
const DEFAULT_CHOICE: MenuChoice = { size: 0, drink: 0, sauces: [] }

const liters = (ml: number) => `${(ml / 1000).toLocaleString('sk')} l`

// časti menu podľa výberu – príloha, nápoj a omáčky
function menuParts(menu: Menu, choice: MenuChoice): Part[] {
  const size = menu.sizes[choice.size]
  return [
    { food: findFood(size.side.food), grams: String(size.side.grams) },
    { food: findFood(menu.drinks[choice.drink].food), grams: String(size.drinkMl) },
    ...choice.sauces.map((index) => ({ food: findFood(menu.sauces[index].food), grams: String(menu.sauces[index].grams) })),
  ]
}

// „stredné hranolky, Coca-Cola 0,4 l, Kečup“
function menuSummary(menu: Menu, choice: MenuChoice) {
  const size = menu.sizes[choice.size]
  return [size.side.label, `${menu.drinks[choice.drink].label} ${liters(size.drinkMl)}`, ...choice.sauces.map((index) => menu.sauces[index].label)].join(', ')
}

// súčet živín všetkých častí jedla
function total(parts: Part[]) {
  return parts.reduce(
    (sum, part) => {
      const values = nutrition(part.food, validAmount(parseNumber(part.grams)) ? parseNumber(part.grams) : 0)
      return {
        kcal: sum.kcal + values.kcal,
        protein: sum.protein + values.protein,
        carbs: sum.carbs + values.carbs,
        fat: sum.fat + values.fat,
      }
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

// Pridanie jedla: vyhľadanie v zozname potravín a varených jedál (aj s prísadami), alebo ručné zadanie.
// Jedlo (raňajky, obed…) je predvybrané podľa času, dá sa zmeniť.
export default function AddFood() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const day = parseDay(params.get('den'))
  const [meal, setMeal] = useState<Meal>(mealForNow)
  const [base, setBase] = useState<Part | null>(null)
  const [extras, setExtras] = useState<Part[]>([])
  const [choice, setChoice] = useState<MenuChoice>(DEFAULT_CHOICE)
  // pridávanie prísady: najprv vyhľadanie, potom množstvo zvolenej prísady
  const [adding, setAdding] = useState<'search' | Part | null>(null)
  const [manual, setManual] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // tvoje jedlá z histórie – najčastejšie sa pridajú jedným ťuknutím
  const [history, setHistory] = useState<HistoryItem[]>([])
  // čo si mal naposledy na každé jedlo dňa – dá sa zopakovať
  const [lastMeals, setLastMeals] = useState<Partial<Record<Meal, LastMeal>>>({})
  // vlastné recepty a uložené jedlá; zvolený recept a koľko porcií
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [recipe, setRecipe] = useState<{ recipe: Recipe; count: number } | null>(null)
  // čiarový kód: skenovanie, hľadanie výrobku, alebo neznámy výrobok na zadanie z obalu
  const [scanning, setScanning] = useState(false)
  const [lookup, setLookup] = useState<{ code: string; status: 'loading' | 'unknown' | 'error'; name?: string } | null>(null)

  useEffect(() => {
    let active = true
    loadHistory()
      .then((items) => active && setHistory(items))
      .catch(() => {
        // bez histórie sa dá jedlo stále vyhľadať
      })
    loadLastMeals(day)
      .then((meals) => active && setLastMeals(meals))
      .catch(() => {
        // bez minulých jedál sa dá jedlo stále vyhľadať
      })
    loadRecipes()
      .then((items) => active && setRecipes(items))
      .catch(() => {
        // bez receptov sa dá jedlo stále vyhľadať
      })
    return () => {
      active = false
    }
  }, [day])

  const close = () => navigate(day === today() ? '/jedlo' : `/jedlo?den=${day}`, { replace: true })

  // šípka späť vždy o jeden krok: prísada → jedlo → vyhľadávanie → Jedlo
  const back = () => {
    setError('')
    if (lookup) setLookup(null)
    else if (adding && adding !== 'search') setAdding('search')
    else if (adding === 'search') setAdding(null)
    else if (base) {
      setBase(null)
      setExtras([])
    } else if (recipe) setRecipe(null)
    else if (manual) setManual(false)
    else close()
  }

  const save = async (data: EntryData) => {
    setBusy(true)
    setError('')
    try {
      await addEntry({ day, meal, ...data })
      close()
    } catch {
      setBusy(false)
      setError('Nepodarilo sa uložiť. Skontroluj internet a skús to znova.')
    }
  }

  const menu = base?.food.menu
  // všetky časti jedla: základ, pri menu príloha, nápoj a omáčky, potom prísady navyše
  const dish = base ? [base, ...(menu ? menuParts(menu, choice) : []), ...extras] : []

  const pick = (food: Food) => {
    setBase({ food, grams: defaultAmount(food) })
    setChoice(DEFAULT_CHOICE)
  }

  const scanned = async (code: string) => {
    setScanning(false)
    setError('')
    setLookup({ code, status: 'loading' })
    try {
      const result = await findProduct(code)
      if ('food' in result) {
        setLookup(null)
        pick(result.food)
      } else setLookup({ code, status: 'unknown', name: result.name })
    } catch {
      setLookup({ code, status: 'error' })
    }
  }

  // zopakovanie: vybrané položky z minula k zvolenému jedlu dňa
  const repeat = async (entries: FoodEntry[]) => {
    setBusy(true)
    setError('')
    try {
      await addEntries(
        entries.map(({ name, kcal, protein_g, carbs_g, fat_g, grams, unit }) => ({
          day,
          meal,
          name,
          kcal,
          protein_g,
          carbs_g,
          fat_g,
          grams,
          unit,
        })),
      )
      close()
    } catch {
      setBusy(false)
      setError('Nepodarilo sa uložiť. Skontroluj internet a skús to znova.')
    }
  }

  // jedným ťuknutím: rovnaké jedlo a množstvo ako minule
  const quickAdd = (item: HistoryItem) =>
    save({
      name: item.name,
      kcal: item.kcal,
      protein_g: item.protein_g,
      carbs_g: item.carbs_g,
      fat_g: item.fat_g,
      grams: item.grams,
      unit: item.unit,
    })

  const saveDish = () => {
    const parts = dish
    if (parts.some((part) => !validAmount(parseNumber(part.grams)))) return
    const values = total(parts)
    const name = [
      menu ? `${base!.food.name}: ${menuSummary(menu, choice)}` : base!.food.name,
      ...extras.map((part) => part.food.name),
    ].join(' + ')
    const sameUnit = parts.every((part) => part.food.unit === parts[0].food.unit)
    save({
      name: name.length > 100 ? `${name.slice(0, 99)}…` : name,
      kcal: values.kcal,
      protein_g: Math.round(values.protein * 10) / 10,
      carbs_g: Math.round(values.carbs * 10) / 10,
      fat_g: Math.round(values.fat * 10) / 10,
      grams: sameUnit ? Math.round(parts.reduce((sum, part) => sum + parseNumber(part.grams), 0) * 10) / 10 : null,
      unit: sameUnit ? parts[0].food.unit : 'g',
    })
  }

  const title = lookup
    ? lookup.status === 'unknown'
      ? 'Nový výrobok'
      : 'Čiarový kód'
    : adding
    ? adding === 'search'
      ? menu
        ? 'Niečo navyše'
        : 'Pridať prísadu'
      : adding.food.name
    : base
      ? base.food.name
      : recipe
        ? recipe.recipe.name
        : manual
          ? 'Zadať ručne'
          : 'Pridať jedlo'

  return (
    <section className="screen">
      <header className="screen__header add-food__header">
        <button type="button" className="flow__back" onClick={back} aria-label="Späť">
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <div className="add-food__heading">
          <h1 className="add-food__title">{title}</h1>
          <span className="add-food__day">{adding ? `k jedlu ${base?.food.name}` : dayLabel(day)}</span>
        </div>
      </header>

      <div className="add-food">
        {!adding && !lookup && (
          <fieldset className="add-food__group">
            <legend className="add-food__label">Ku ktorému jedlu?</legend>
            <div className="chips">
              {MEALS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={option.value === meal ? 'chip chip--selected' : 'chip'}
                  onClick={() => setMeal(option.value)}
                  aria-pressed={option.value === meal}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {lookup ? (
          lookup.status === 'loading' ? (
            <p className="search__hint">Hľadám výrobok s kódom {lookup.code}…</p>
          ) : lookup.status === 'error' ? (
            <>
              <p className="flow__message flow__message--error" role="alert">
                Nepodarilo sa overiť kód. Skontroluj internet a skús to znova.
              </p>
              <button type="button" className="button button--primary" onClick={() => scanned(lookup.code)}>
                Skúsiť znova
              </button>
            </>
          ) : (
            <NewProductForm
              code={lookup.code}
              initialName={lookup.name ?? ''}
              onSaved={(food) => {
                setLookup(null)
                pick(food)
              }}
            />
          )
        ) : adding === 'search' ? (
          <FoodSearch
            placeholder="Hľadaj prísadu, napr. syr, omáčka"
            onPick={(food) => setAdding({ food, grams: defaultAmount(food) })}
          />
        ) : adding ? (
          <>
            <AmountPicker part={adding} onChange={(grams) => setAdding({ ...adding, grams })} />
            <NutritionCard parts={[adding]} />
            <button
              type="button"
              className="button button--primary"
              disabled={!validAmount(parseNumber(adding.grams))}
              onClick={() => {
                setExtras([...extras, adding])
                setAdding(null)
              }}
            >
              Pridať prísadu
            </button>
          </>
        ) : base ? (
          <>
            {menu ? (
              <MenuPicker menu={menu} choice={choice} onChange={setChoice} />
            ) : (
              <AmountPicker part={base} onChange={(grams) => setBase({ ...base, grams })} />
            )}

            {extras.length > 0 && (
              <div className="add-food__group">
                <span className="add-food__label">{menu ? 'Navyše' : 'Prísady'}</span>
                <ul className="extras">
                  {extras.map((part, index) => (
                    <li key={index} className="extra">
                      <span className="extra__name">{part.food.name}</span>
                      <span className="extra__info">
                        {amount(parseNumber(part.grams))} {part.food.unit} · {total([part]).kcal} kcal
                      </span>
                      <button
                        type="button"
                        className="extra__remove"
                        onClick={() => setExtras(extras.filter((_, i) => i !== index))}
                        aria-label={`Odobrať ${part.food.name}`}
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button type="button" className="add-extra" onClick={() => setAdding('search')}>
              <Plus size={18} aria-hidden="true" />
              {menu ? 'Pridať niečo navyše' : 'Pridať prísadu'}
            </button>

            <NutritionCard parts={dish} />
            <p className="search__hint">Hodnoty sú orientačné.</p>

            {error && (
              <p className="flow__message flow__message--error" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              className="button button--primary"
              disabled={busy || !validAmount(parseNumber(base.grams))}
              onClick={saveDish}
            >
              {busy ? 'Ukladám…' : 'Pridať'}
            </button>
          </>
        ) : recipe ? (
          <>
            <div className="add-food__group">
              <span className="add-food__label">Koľko si zjedol?</span>
              <div className="chips">
                {PORTION_CHOICES.map((count) => (
                  <button
                    key={count}
                    type="button"
                    className={count === recipe.count ? 'chip chip--selected' : 'chip'}
                    onClick={() => setRecipe({ ...recipe, count })}
                  >
                    {portionLabel(count)}
                  </button>
                ))}
              </div>
            </div>
            <ValuesCard values={entryValues(recipeEntry(recipe.recipe, recipe.count))} />
            <p className="search__hint">
              {recipe.recipe.portions === 1
                ? `Uložené jedlo: ${recipe.recipe.items.map((item) => item.name).join(', ')}.`
                : `Recept na ${portionLabel(recipe.recipe.portions)} · celý ${recipeTotal(recipe.recipe.items).kcal.toLocaleString('sk')} kcal.`}
            </p>
            {error && (
              <p className="flow__message flow__message--error" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              className="button button--primary"
              disabled={busy}
              onClick={() => save(recipeEntry(recipe.recipe, recipe.count))}
            >
              {busy ? 'Ukladám…' : 'Pridať'}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => navigate(`/jedlo/recepty/${recipe.recipe.id}${day === today() ? '' : `?den=${day}`}`)}
            >
              Upraviť recept
            </button>
          </>
        ) : manual ? (
          <ManualForm busy={busy} error={error} onError={setError} onSave={save} />
        ) : (
          <>
            {error && (
              <p className="flow__message flow__message--error" role="alert">
                {error}
              </p>
            )}
            <FoodSearch
              placeholder="Hľadaj, napr. ryža, vajce, guláš"
              hint="Napíš názov potraviny alebo jedla. Sú tu aj varené jedlá z jedálne či reštaurácie – napr. guláš, rezeň, pizza, kebab. Po výbere môžeš pridať aj prísady."
              places
              history={history}
              busy={busy}
              recipes={recipes}
              onPickRecipe={(item) => setRecipe({ recipe: item, count: 1 })}
              onNewRecipe={() => navigate(`/jedlo/recepty/novy${day === today() ? '' : `?den=${day}`}`)}
              top={
                lastMeals[meal] && (
                  // key: pri inom jedle začína výber znova so všetkým zaškrtnutým
                  <RepeatMeal key={meal} meal={meal} last={lastMeals[meal]} busy={busy} onAdd={repeat} />
                )
              }
              onQuickAdd={quickAdd}
              onScan={() => setScanning(true)}
              onPick={pick}
            />
            <button type="button" className="text-button" onClick={() => setManual(true)}>
              Nenašiel si? Zadaj ručne
            </button>
          </>
        )}
      </div>

      {scanning && <BarcodeScanner onDetected={scanned} onClose={() => setScanning(false)} />}
    </section>
  )
}

// Výrobok, ktorý sa podľa kódu nenašiel: hodnoty z obalu (na 100 g / 100 ml) – zapamätá sa pre celú partiu.
function NewProductForm(props: { code: string; initialName: string; onSaved: (food: Food) => void }) {
  const [name, setName] = useState(props.initialName)
  const [unit, setUnit] = useState<'g' | 'ml'>('g')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const kcalValue = parseNumber(kcal)
    const macros = [protein, carbs, fat].map(parseNumber)
    if (!name.trim()) return setError('Napíš názov výrobku.')
    if (!kcal.trim() || !Number.isFinite(kcalValue) || kcalValue < 0 || kcalValue > 1000) {
      return setError(`Zadaj kalórie na 100 ${unit} – číslo od 0 do 1 000.`)
    }
    if (macros.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) {
      return setError(`Gramy na 100 ${unit} musia byť od 0 do 100.`)
    }
    setBusy(true)
    setError('')
    try {
      const round1 = (value: number) => Math.round(value * 10) / 10
      props.onSaved(
        await saveProduct(props.code, {
          name: name.trim().slice(0, 100),
          kcal: round1(kcalValue),
          protein: round1(macros[0]),
          carbs: round1(macros[1]),
          fat: round1(macros[2]),
          unit,
        }),
      )
    } catch {
      setBusy(false)
      setError('Nepodarilo sa uložiť. Skontroluj internet a skús to znova.')
    }
  }

  return (
    <form className="add-food" onSubmit={submit}>
      <p className="search__hint">
        Výrobok s kódom {props.code} zatiaľ nepoznáme. Opíš hodnoty z obalu (tabuľka „Výživové údaje“, stĺpec na 100 g
        alebo 100 ml). Appka si ho zapamätá – nabudúce ho po naskenovaní spozná, aj u kamarátov.
      </p>

      <label className="add-food__group">
        <span className="add-food__label">Názov</span>
        <input
          className="field"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="napr. Rajo jogurt jahodový"
          maxLength={100}
          autoComplete="off"
        />
      </label>

      <div className="add-food__group">
        <span className="add-food__label">Hodnoty sú na</span>
        <div className="chips">
          {(['g', 'ml'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={option === unit ? 'chip chip--selected' : 'chip'}
              onClick={() => setUnit(option)}
            >
              100 {option}
            </button>
          ))}
        </div>
      </div>

      <label className="add-food__group">
        <span className="add-food__label">Kalórie na 100 {unit}</span>
        <span className="number-field">
          <input
            className="field number-field__input add-food__kcal"
            type="text"
            inputMode="decimal"
            value={kcal}
            onChange={(event) => setKcal(event.target.value)}
            autoComplete="off"
          />
          <span className="number-field__unit">kcal</span>
        </span>
      </label>

      <div className="add-food__group">
        <span className="add-food__label">Na 100 {unit} (nepovinné)</span>
        <div className="macro-fields">
          <MacroField label="Bielkoviny" value={protein} onChange={setProtein} />
          <MacroField label="Sacharidy" value={carbs} onChange={setCarbs} />
          <MacroField label="Tuky" value={fat} onChange={setFat} />
        </div>
      </div>

      {error && (
        <p className="flow__message flow__message--error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button button--primary" disabled={busy}>
        {busy ? 'Ukladám…' : 'Uložiť a pokračovať'}
      </button>
    </form>
  )
}

// podniky v Banskej Bystrici, kam chodí partia – ťuknutím sa ukážu ich jedlá
const PLACES = ['Wakaka', 'KFC', "McDonald's", 'Leviathan']

export function FoodSearch(props: {
  placeholder: string
  hint?: string
  places?: boolean
  history?: HistoryItem[]
  busy?: boolean
  // nad „Často ješ“, kým sa nič nehľadá
  top?: ReactNode
  // vlastné recepty a uložené jedlá
  recipes?: Recipe[]
  onPickRecipe?: (recipe: Recipe) => void
  onNewRecipe?: () => void
  onQuickAdd?: (item: HistoryItem) => void
  onScan?: () => void
  onPick: (food: Food) => void
}) {
  const [query, setQuery] = useState('')
  const results = searchFoods(query)
  const history = props.history ?? []
  const mine = history.filter((item) => matchesQuery(item.name, query)).slice(0, 5)
  const recipes = props.recipes ?? []
  const myRecipes = recipes.filter((recipe) => matchesQuery(recipe.name, query))

  const recipeList = (items: Recipe[]) => (
    <ul className="results">
      {items.map((recipe) => (
        <li key={recipe.id}>
          <button type="button" className="result" onClick={() => props.onPickRecipe?.(recipe)}>
            <span className="result__text">
              <span className="result__name">{recipe.name}</span>
              <span className="result__info">
                {recipe.portions === 1 ? 'uložené jedlo' : '1 porcia'} · {recipeEntry(recipe, 1).kcal.toLocaleString('sk')} kcal
              </span>
            </span>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )

  const historyList = (items: HistoryItem[]) => (
    <ul className="results">
      {items.map((item) => (
        <li key={item.name}>
          <button
            type="button"
            className="result"
            disabled={props.busy}
            onClick={() => props.onQuickAdd?.(item)}
            aria-label={`Pridať ${item.name}`}
          >
            <span className="result__text">
              <span className="result__name">{item.name}</span>
              <span className="result__info">
                {item.grams ? `${amount(Number(item.grams))} ${item.unit} · ` : ''}
                {item.kcal.toLocaleString('sk')} kcal
              </span>
            </span>
            <Plus className="result__add" size={22} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <label className="search">
        <Search className="search__icon" size={20} aria-hidden="true" />
        <input
          className="field search__input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={props.placeholder}
          aria-label={props.placeholder}
          autoComplete="off"
          enterKeyHint="search"
        />
      </label>
      {props.onScan && (
        <button type="button" className="add-extra" onClick={props.onScan}>
          <ScanBarcode size={20} aria-hidden="true" />
          Naskenovať čiarový kód
        </button>
      )}

      {query.trim() === '' ? (
        <>
          {props.top}
          {props.onNewRecipe && (
            <div className="add-food__group">
              <span className="add-food__label">Tvoje recepty a uložené jedlá</span>
              {recipes.length > 0 && recipeList(recipes)}
              <button type="button" className="add-extra" onClick={props.onNewRecipe}>
                <Plus size={18} aria-hidden="true" />
                Nový recept
              </button>
            </div>
          )}
          {history.length > 0 && (
            <div className="add-food__group">
              <span className="add-food__label">Často ješ – pridáš jedným ťuknutím</span>
              {historyList(history.slice(0, 6))}
            </div>
          )}
          {props.hint && <p className="search__hint">{props.hint}</p>}
          {props.places && (
            <div className="add-food__group">
              <span className="add-food__label">Podniky v Banskej Bystrici</span>
              <div className="chips">
                {PLACES.map((place) => (
                  <button key={place} type="button" className="chip" onClick={() => setQuery(place)}>
                    {place}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : results.length === 0 && mine.length === 0 && myRecipes.length === 0 ? (
        <p className="search__hint">Nič sa nenašlo. Skús iné slovo.</p>
      ) : (
        <>
          {myRecipes.length > 0 && (
            <div className="add-food__group">
              <span className="add-food__label">Tvoje recepty</span>
              {recipeList(myRecipes)}
            </div>
          )}
          {mine.length > 0 && (
            <div className="add-food__group">
              <span className="add-food__label">Tvoje jedlá – jedným ťuknutím</span>
              {historyList(mine)}
            </div>
          )}
          {results.length > 0 && (
            <ul className="results">
              {results.map((item) => (
                <li key={item.name}>
                  <button type="button" className="result" onClick={() => props.onPick(item)}>
                    <span className="result__text">
                      <span className="result__name">{item.name}</span>
                      <span className="result__info">
                        {/* kalórie pre bežnú porciu – začiatočník lepšie pozná „1 porcia“ než 100 g */}
                        {item.menu
                          ? `bežné menu · ${total([{ food: item, grams: defaultAmount(item) }, ...menuParts(item.menu, DEFAULT_CHOICE)]).kcal.toLocaleString('sk')} kcal`
                          : item.portions[0]
                            ? `${item.portions[0].label} (${item.portions[0].grams} ${item.unit}) · ${nutrition(item, item.portions[0].grams).kcal} kcal`
                            : `100 ${item.unit} · ${item.kcal} kcal`}
                      </span>
                    </span>
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}

// Čo si mal naposledy na toto jedlo – všetko je zaškrtnuté, čo si dnes nemal, odškrtneš.
function RepeatMeal(props: { meal: Meal; last: LastMeal; busy: boolean; onAdd: (entries: FoodEntry[]) => void }) {
  const { last } = props
  const [skipped, setSkipped] = useState<string[]>([])
  const chosen = last.entries.filter((entry) => !skipped.includes(entry.id))

  const toggle = (id: string) =>
    setSkipped((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  return (
    <div className="add-food__group">
      <span className="add-food__label">
        Naposledy na {MEAL_AFTER_NA[props.meal]} · {dayLabel(last.day)}
      </span>
      <ul className="results">
        {last.entries.map((entry) => {
          const on = !skipped.includes(entry.id)
          return (
            <li key={entry.id}>
              <button
                type="button"
                className={on ? 'result' : 'result result--off'}
                onClick={() => toggle(entry.id)}
                aria-pressed={on}
              >
                <span className="result__text">
                  <span className="result__name">{entry.name}</span>
                  <span className="result__info">
                    {entry.grams ? `${amount(Number(entry.grams))} ${entry.unit} · ` : ''}
                    {entry.kcal.toLocaleString('sk')} kcal
                  </span>
                </span>
                {on ? (
                  <CircleCheck className="result__check" size={24} aria-hidden="true" />
                ) : (
                  <Circle className="result__unchecked" size={24} aria-hidden="true" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        className="button button--primary"
        disabled={props.busy || chosen.length === 0}
        onClick={() => props.onAdd(chosen)}
      >
        {chosen.length === last.entries.length ? 'Pridať všetko' : 'Pridať vybrané'} ·{' '}
        {sumEntries(chosen).kcal.toLocaleString('sk')} kcal
      </button>
    </div>
  )
}

// zmena vždy z aktuálneho výberu, aby sa nestratilo ani rýchle ťuknutie za ťuknutím
type MenuUpdate = (update: (choice: MenuChoice) => MenuChoice) => void

// Menu: veľkosť, nápoj a omáčky ťuknutím; predvolené je bežné menu s prvým nápojom.
function MenuPicker({ menu, choice, onChange }: { menu: Menu; choice: MenuChoice; onChange: MenuUpdate }) {
  const toggleSauce = (index: number) =>
    onChange((current) => ({
      ...current,
      sauces: current.sauces.includes(index) ? current.sauces.filter((item) => item !== index) : [...current.sauces, index],
    }))

  return (
    <>
      <div className="add-food__group">
        <span className="add-food__label">Veľkosť menu</span>
        <div className="chips">
          {menu.sizes.map((size, index) => (
            <button
              key={size.label}
              type="button"
              className={index === choice.size ? 'chip chip--selected' : 'chip'}
              onClick={() => onChange((current) => ({ ...current, size: index }))}
            >
              {size.label}
            </button>
          ))}
        </div>
        <span className="search__hint">{menu.sizes[choice.size].hint}</span>
      </div>

      <div className="add-food__group">
        <span className="add-food__label">Nápoj</span>
        <div className="chips">
          {menu.drinks.map((drink, index) => (
            <button
              key={drink.label}
              type="button"
              className={index === choice.drink ? 'chip chip--selected' : 'chip'}
              onClick={() => onChange((current) => ({ ...current, drink: index }))}
            >
              {drink.label}
            </button>
          ))}
        </div>
      </div>

      <div className="add-food__group">
        <span className="add-food__label">Omáčka (nepovinné)</span>
        <div className="chips">
          {menu.sauces.map((sauce, index) => (
            <button
              key={sauce.label}
              type="button"
              className={choice.sauces.includes(index) ? 'chip chip--selected' : 'chip'}
              onClick={() => toggleSauce(index)}
              aria-pressed={choice.sauces.includes(index)}
            >
              {sauce.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// Množstvo: rýchle tlačidlá (1 ks, 1 porcia, 100 g) alebo vlastné gramy.
export function AmountPicker({ part, onChange }: { part: Part; onChange: (grams: string) => void }) {
  const { food } = part
  const quick = [...food.portions, { label: `100 ${food.unit}`, grams: 100 }]
  const grams = parseNumber(part.grams)

  return (
    <div className="add-food__group">
      <span className="add-food__label">Koľko?</span>
      <div className="chips">
        {quick.map((portion) => (
          <button
            key={portion.label}
            type="button"
            className={grams === portion.grams ? 'chip chip--selected' : 'chip'}
            onClick={() => onChange(String(portion.grams))}
          >
            {portion.label === `100 ${food.unit}` ? portion.label : `${portion.label} (${portion.grams} ${food.unit})`}
          </button>
        ))}
      </div>
      <span className="number-field">
        <input
          className="field number-field__input add-food__kcal"
          type="text"
          inputMode="decimal"
          value={part.grams}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`Množstvo v ${food.unit === 'ml' ? 'mililitroch' : 'gramoch'}`}
          autoComplete="off"
        />
        <span className="number-field__unit">{food.unit}</span>
      </span>
      {!validAmount(grams) && part.grams.trim() !== '' && (
        <p className="flow__message flow__message--error" role="alert">
          Zadaj množstvo od 1 do 5 000 {food.unit}.
        </p>
      )}
    </div>
  )
}

export function NutritionCard({ parts }: { parts: Part[] }) {
  return <ValuesCard values={total(parts)} />
}

// hodnoty uloženého záznamu (napr. porcie receptu) pre kartu so živinami
const entryValues = (entry: EntryData): Values => ({
  kcal: entry.kcal,
  protein: entry.protein_g,
  carbs: entry.carbs_g,
  fat: entry.fat_g,
})

export function ValuesCard({ values }: { values: Values }) {
  return (
    <div className="card card--glow portion">
      <p className="portion__kcal">
        {values.kcal.toLocaleString('sk')} <span>kcal</span>
      </p>
      <div className="macros">
        <div className="macro macro--protein">
          <span className="macro__value">{amount(values.protein)} g</span>
          <span className="macro__label">Bielkoviny</span>
        </div>
        <div className="macro macro--carbs">
          <span className="macro__value">{amount(values.carbs)} g</span>
          <span className="macro__label">Sacharidy</span>
        </div>
        <div className="macro macro--fat">
          <span className="macro__value">{amount(values.fat)} g</span>
          <span className="macro__label">Tuky</span>
        </div>
      </div>
    </div>
  )
}

// Ručné zadanie, keď sa jedlo v zozname nenájde (aj surovina receptu).
export function ManualForm(props: {
  busy: boolean
  error: string
  onError: (message: string) => void
  onSave: (data: EntryData) => void
  // pri surovine receptu iné nápisy
  ingredient?: boolean
}) {
  const { busy, error, onError, onSave } = props
  const [name, setName] = useState('')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const kcalValue = parseNumber(kcal)
    const macros = [protein, carbs, fat].map(parseNumber)
    if (!name.trim()) return onError(props.ingredient ? 'Napíš názov suroviny.' : 'Napíš, čo si jedol.')
    if (!kcal.trim() || !Number.isInteger(kcalValue) || kcalValue < 0 || kcalValue > 5000) {
      return onError('Zadaj kalórie – celé číslo od 0 do 5 000.')
    }
    if (macros.some((value) => !Number.isFinite(value) || value < 0 || value > 1000)) {
      return onError('Gramy musia byť číslo od 0 do 1 000.')
    }
    onSave({
      name: name.trim(),
      kcal: kcalValue,
      protein_g: Math.round(macros[0] * 10) / 10,
      carbs_g: Math.round(macros[1] * 10) / 10,
      fat_g: Math.round(macros[2] * 10) / 10,
      grams: null,
      unit: 'g',
    })
  }

  return (
    <form className="add-food" onSubmit={submit}>
      <label className="add-food__group">
        <span className="add-food__label">{props.ingredient ? 'Surovina' : 'Čo si jedol?'}</span>
        <input
          className="field"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={props.ingredient ? 'napr. Koreňová zelenina 300 g' : 'napr. Kuracie prsia s ryžou'}
          maxLength={100}
          autoComplete="off"
        />
      </label>

      <label className="add-food__group">
        <span className="add-food__label">Kalórie</span>
        <span className="number-field">
          <input
            className="field number-field__input add-food__kcal"
            type="text"
            inputMode="numeric"
            value={kcal}
            onChange={(event) => setKcal(event.target.value)}
            autoComplete="off"
          />
          <span className="number-field__unit">kcal</span>
        </span>
      </label>

      <div className="add-food__group">
        <span className="add-food__label">Bielkoviny, sacharidy, tuky (nepovinné)</span>
        <div className="macro-fields">
          <MacroField label="Bielkoviny" value={protein} onChange={setProtein} />
          <MacroField label="Sacharidy" value={carbs} onChange={setCarbs} />
          <MacroField label="Tuky" value={fat} onChange={setFat} />
        </div>
      </div>

      {error && (
        <p className="flow__message flow__message--error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button button--primary" disabled={busy}>
        {busy ? 'Ukladám…' : props.ingredient ? 'Pridať surovinu' : 'Pridať'}
      </button>
    </form>
  )
}

function MacroField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="macro-field">
      <span className="macro-field__label">{label}</span>
      <span className="number-field">
        <input
          className="field number-field__input macro-field__input"
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} v gramoch`}
          autoComplete="off"
        />
        <span className="number-field__unit">g</span>
      </span>
    </label>
  )
}
