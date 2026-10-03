import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Plus, Search, X } from 'lucide-react'
import { nutrition, searchFoods, type Food } from '../data/foods'
import { addEntry, dayLabel, mealForNow, MEALS, parseDay, today, type Meal, type NewFoodEntry } from '../lib/food'

// prázdne políčko = 0, čiarka aj bodka ako desatinná čiarka
const parseNumber = (text: string) => (text.trim() === '' ? 0 : Number(text.trim().replace(',', '.')))
const amount = (value: number) => value.toLocaleString('sk', { maximumFractionDigits: 1 })
const validAmount = (grams: number) => Number.isFinite(grams) && grams >= 1 && grams <= 5000
const defaultAmount = (food: Food) => String(food.portions[0]?.grams ?? 100)

type EntryData = Omit<NewFoodEntry, 'day' | 'meal'>
// časť jedla – základ alebo prísada; množstvo ako text z políčka
type Part = { food: Food; grams: string }

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
  // pridávanie prísady: najprv vyhľadanie, potom množstvo zvolenej prísady
  const [adding, setAdding] = useState<'search' | Part | null>(null)
  const [manual, setManual] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const close = () => navigate(day === today() ? '/jedlo' : `/jedlo?den=${day}`, { replace: true })

  // šípka späť vždy o jeden krok: prísada → jedlo → vyhľadávanie → Jedlo
  const back = () => {
    setError('')
    if (adding && adding !== 'search') setAdding('search')
    else if (adding === 'search') setAdding(null)
    else if (base) {
      setBase(null)
      setExtras([])
    } else if (manual) setManual(false)
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

  const saveDish = () => {
    const parts = base ? [base, ...extras] : []
    if (parts.some((part) => !validAmount(parseNumber(part.grams)))) return
    const values = total(parts)
    const name = parts.map((part) => part.food.name).join(' + ')
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

  const title = adding
    ? adding === 'search'
      ? 'Pridať prísadu'
      : adding.food.name
    : base
      ? base.food.name
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
        {!adding && (
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

        {adding === 'search' ? (
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
            <AmountPicker part={base} onChange={(grams) => setBase({ ...base, grams })} />

            {extras.length > 0 && (
              <div className="add-food__group">
                <span className="add-food__label">Prísady</span>
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
              Pridať prísadu
            </button>

            <NutritionCard parts={[base, ...extras]} />
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
        ) : manual ? (
          <ManualForm busy={busy} error={error} onError={setError} onSave={save} />
        ) : (
          <>
            <FoodSearch
              placeholder="Hľadaj, napr. ryža, vajce, guláš"
              hint="Napíš názov potraviny alebo jedla. Sú tu aj varené jedlá z jedálne či reštaurácie – napr. guláš, rezeň, pizza, kebab. Po výbere môžeš pridať aj prísady."
              onPick={(food) => setBase({ food, grams: defaultAmount(food) })}
            />
            <button type="button" className="text-button" onClick={() => setManual(true)}>
              Nenašiel si? Zadaj ručne
            </button>
          </>
        )}
      </div>
    </section>
  )
}

function FoodSearch(props: { placeholder: string; hint?: string; onPick: (food: Food) => void }) {
  const [query, setQuery] = useState('')
  const results = searchFoods(query)

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

      {query.trim() === '' ? (
        props.hint && <p className="search__hint">{props.hint}</p>
      ) : results.length === 0 ? (
        <p className="search__hint">Nič sa nenašlo. Skús iné slovo.</p>
      ) : (
        <ul className="results">
          {results.map((item) => (
            <li key={item.name}>
              <button type="button" className="result" onClick={() => props.onPick(item)}>
                <span className="result__text">
                  <span className="result__name">{item.name}</span>
                  <span className="result__info">
                    {item.kcal} kcal na 100 {item.unit}
                    {item.portions[0] && ` · ${item.portions[0].label} ${item.portions[0].grams} ${item.unit}`}
                  </span>
                </span>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// Množstvo: rýchle tlačidlá (1 ks, 1 porcia, 100 g) alebo vlastné gramy.
function AmountPicker({ part, onChange }: { part: Part; onChange: (grams: string) => void }) {
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

function NutritionCard({ parts }: { parts: Part[] }) {
  const values = total(parts)
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

// Ručné zadanie, keď sa jedlo v zozname nenájde.
function ManualForm(props: {
  busy: boolean
  error: string
  onError: (message: string) => void
  onSave: (data: EntryData) => void
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
    if (!name.trim()) return onError('Napíš, čo si jedol.')
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
        <span className="add-food__label">Čo si jedol?</span>
        <input
          className="field"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="napr. Kuracie prsia s ryžou"
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
        {busy ? 'Ukladám…' : 'Pridať'}
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
