import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Search } from 'lucide-react'
import { nutrition, searchFoods, type Food } from '../data/foods'
import { addEntry, dayLabel, mealForNow, MEALS, parseDay, today, type Meal, type NewFoodEntry } from '../lib/food'

// prázdne políčko = 0, čiarka aj bodka ako desatinná čiarka
const parseNumber = (text: string) => (text.trim() === '' ? 0 : Number(text.trim().replace(',', '.')))
const amount = (value: number) => value.toLocaleString('sk', { maximumFractionDigits: 1 })

type EntryData = Omit<NewFoodEntry, 'day' | 'meal'>

// Pridanie jedla: vyhľadanie v zozname potravín a varených jedál, alebo ručné zadanie.
// Jedlo (raňajky, obed…) je predvybrané podľa času, dá sa zmeniť.
export default function AddFood() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const day = parseDay(params.get('den'))
  const [meal, setMeal] = useState<Meal>(mealForNow)
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<Food | null>(null)
  const [manual, setManual] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const close = () => navigate(day === today() ? '/jedlo' : `/jedlo?den=${day}`, { replace: true })

  // šípka späť: z množstva alebo ručného zadania na vyhľadávanie, inak späť na Jedlo
  const back = () => {
    setError('')
    if (picked) setPicked(null)
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

  const results = searchFoods(query)

  return (
    <section className="screen">
      <header className="screen__header add-food__header">
        <button type="button" className="flow__back" onClick={back} aria-label="Späť">
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <div className="add-food__heading">
          <h1 className="add-food__title">{picked ? picked.name : manual ? 'Zadať ručne' : 'Pridať jedlo'}</h1>
          <span className="add-food__day">{dayLabel(day)}</span>
        </div>
      </header>

      <div className="add-food">
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

        {picked ? (
          <AmountForm food={picked} busy={busy} error={error} onSave={save} />
        ) : manual ? (
          <ManualForm busy={busy} error={error} onError={setError} onSave={save} />
        ) : (
          <>
            <label className="search">
              <Search className="search__icon" size={20} aria-hidden="true" />
              <input
                className="field search__input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Hľadaj, napr. ryža, vajce, guláš"
                aria-label="Hľadať jedlo"
                autoComplete="off"
                enterKeyHint="search"
              />
            </label>

            {query.trim() === '' ? (
              <p className="search__hint">
                Napíš názov potraviny alebo jedla. Sú tu aj varené jedlá z jedálne či reštaurácie – napr. guláš,
                rezeň, pizza, kebab.
              </p>
            ) : results.length === 0 ? (
              <p className="search__hint">Nič sa nenašlo. Skús iné slovo alebo jedlo zadaj ručne.</p>
            ) : (
              <ul className="results">
                {results.map((item) => (
                  <li key={item.name}>
                    <button type="button" className="result" onClick={() => setPicked(item)}>
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

            <button type="button" className="text-button" onClick={() => setManual(true)}>
              Nenašiel si? Zadaj ručne
            </button>
          </>
        )}
      </div>
    </section>
  )
}

// Množstvo zvolenej potraviny: rýchle tlačidlá (1 ks, 1 porcia, 100 g) alebo vlastné gramy.
function AmountForm(props: { food: Food; busy: boolean; error: string; onSave: (data: EntryData) => void }) {
  const { food, busy, error, onSave } = props
  const quick = [...food.portions, { label: `100 ${food.unit}`, grams: 100 }]
  const [text, setText] = useState(String(quick[0].grams))
  const grams = parseNumber(text)
  const valid = Number.isFinite(grams) && grams >= 1 && grams <= 5000
  const values = nutrition(food, valid ? grams : 0)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!valid) return
    onSave({
      name: food.name,
      kcal: values.kcal,
      protein_g: values.protein,
      carbs_g: values.carbs,
      fat_g: values.fat,
      grams: Math.round(grams * 10) / 10,
      unit: food.unit,
    })
  }

  return (
    <form className="add-food" onSubmit={submit}>
      <div className="add-food__group">
        <span className="add-food__label">Koľko?</span>
        <div className="chips">
          {quick.map((portion) => (
            <button
              key={portion.label}
              type="button"
              className={grams === portion.grams ? 'chip chip--selected' : 'chip'}
              onClick={() => setText(String(portion.grams))}
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
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-label={`Množstvo v ${food.unit === 'ml' ? 'mililitroch' : 'gramoch'}`}
            autoComplete="off"
          />
          <span className="number-field__unit">{food.unit}</span>
        </span>
        {!valid && text.trim() !== '' && (
          <p className="flow__message flow__message--error" role="alert">
            Zadaj množstvo od 1 do 5 000 {food.unit}.
          </p>
        )}
      </div>

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
      <p className="search__hint">Hodnoty sú orientačné.</p>

      {error && (
        <p className="flow__message flow__message--error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button button--primary" disabled={busy || !valid}>
        {busy ? 'Ukladám…' : 'Pridať'}
      </button>
    </form>
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
