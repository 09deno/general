import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { addEntry, dayLabel, mealForNow, MEALS, parseDay, today, type Meal } from '../lib/food'

// prázdne políčko = 0, čiarka aj bodka ako desatinná čiarka
const parseNumber = (text: string) => (text.trim() === '' ? 0 : Number(text.trim().replace(',', '.')))

// Ručné pridanie jedla. Jedlo (raňajky, obed…) je predvybrané podľa času, dá sa zmeniť.
export default function AddFood() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const day = parseDay(params.get('den'))
  const [meal, setMeal] = useState<Meal>(mealForNow)
  const [name, setName] = useState('')
  const [kcal, setKcal] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const back = () => navigate(day === today() ? '/jedlo' : `/jedlo?den=${day}`, { replace: true })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const kcalValue = parseNumber(kcal)
    const macros = [protein, carbs, fat].map(parseNumber)
    if (!name.trim()) return setError('Napíš, čo si jedol.')
    if (!kcal.trim() || !Number.isInteger(kcalValue) || kcalValue < 0 || kcalValue > 5000) {
      return setError('Zadaj kalórie – celé číslo od 0 do 5 000.')
    }
    if (macros.some((value) => !Number.isFinite(value) || value < 0 || value > 1000)) {
      return setError('Gramy musia byť číslo od 0 do 1 000.')
    }

    setBusy(true)
    setError('')
    try {
      await addEntry({
        day,
        meal,
        name: name.trim(),
        kcal: kcalValue,
        protein_g: Math.round(macros[0] * 10) / 10,
        carbs_g: Math.round(macros[1] * 10) / 10,
        fat_g: Math.round(macros[2] * 10) / 10,
      })
      back()
    } catch {
      setBusy(false)
      setError('Nepodarilo sa uložiť. Skontroluj internet a skús to znova.')
    }
  }

  return (
    <section className="screen">
      <header className="screen__header add-food__header">
        <button type="button" className="flow__back" onClick={back} aria-label="Späť">
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <div>
          <h1 className="add-food__title">Pridať jedlo</h1>
          <span className="add-food__day">{dayLabel(day)}</span>
        </div>
      </header>

      <form className="add-food" onSubmit={submit}>
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
    </section>
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
