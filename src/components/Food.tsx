import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookmarkPlus, Check, Plus, Trash2 } from 'lucide-react'
import { deleteEntry, loadEntries, MEALS, parseDay, sumEntries, today, type FoodEntry, type Meal } from '../lib/food'
import type { Targets } from '../lib/goals'
import { saveRecipe } from '../lib/recipes'
import DaySwitch from './DaySwitch'

const grams = (value: number) => Number(value).toLocaleString('sk', { maximumFractionDigits: 1 })
const percent = (value: number, target: number) => `${Math.min(100, target ? (value / target) * 100 : 0)}%`

// predvolený názov uloženého jedla – dá sa prepísať
const MY_MEAL: Record<Meal, string> = {
  breakfast: 'Moje raňajky',
  morning_snack: 'Moja desiata',
  lunch: 'Môj obed',
  afternoon_snack: 'Môj olovrant',
  dinner: 'Moja večera',
  snack: 'Môj snack',
}

// „150 g · B 4 g · S 42 g · T 0,5 g“ – množstvo a živiny, ak sú známe
function details(entry: FoodEntry) {
  const parts = []
  if (entry.grams) parts.push(`${grams(entry.grams)} ${entry.unit}`)
  if (Number(entry.protein_g) + Number(entry.carbs_g) + Number(entry.fat_g) > 0) {
    parts.push(`B ${grams(entry.protein_g)} g · S ${grams(entry.carbs_g)} g · T ${grams(entry.fat_g)} g`)
  }
  return parts.join(' · ')
}

// Jedlo: koľko kalórií ešte zostáva, zoznam zjedeného podľa jedál a prepínanie dní.
export default function Food({ targets }: { targets: Targets }) {
  const [params, setParams] = useSearchParams()
  const day = parseDay(params.get('den'))
  const [loaded, setLoaded] = useState<{ day: string; entries: FoodEntry[] }>()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  // uloženie jedla (napr. dnešných raňajok) pod názvom – potom sa pridá jedným ťuknutím
  const [naming, setNaming] = useState<{ meal: Meal; name: string } | null>(null)
  const [savedNotice, setSavedNotice] = useState('')

  useEffect(() => {
    let active = true
    loadEntries(day)
      .then((entries) => active && setLoaded({ day, entries }))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [day, attempt])

  const entries = loaded?.day === day ? loaded.entries : undefined
  const eaten = sumEntries(entries ?? [])
  const left = targets.kcal - eaten.kcal

  const saveMeal = async (event: FormEvent) => {
    event.preventDefault()
    if (!naming || !entries) return
    const name = naming.name.trim().slice(0, 60)
    if (!name) return
    try {
      await saveRecipe({
        name,
        portions: 1,
        items: entries
          .filter((entry) => entry.meal === naming.meal)
          .map(({ name, kcal, protein_g, carbs_g, fat_g, grams, unit }) => ({ name, kcal, protein_g, carbs_g, fat_g, grams, unit })),
      })
      setNaming(null)
      setDeleteError('')
      setSavedNotice(`Uložené ako „${name}“ – nájdeš ho v Pridať jedlo medzi receptami.`)
    } catch {
      setDeleteError('Jedlo sa nepodarilo uložiť. Skontroluj internet a skús to znova.')
    }
  }

  const goToDay = (next: string) => {
    setConfirmId(null)
    setNaming(null)
    setSavedNotice('')
    setDeleteError('')
    setParams(next === today() ? {} : { den: next }, { replace: true })
  }

  const remove = async (entry: FoodEntry) => {
    setConfirmId(null)
    try {
      await deleteEntry(entry.id)
      setLoaded({ day, entries: (entries ?? []).filter((item) => item.id !== entry.id) })
      setDeleteError('')
    } catch {
      setDeleteError(`„${entry.name}“ sa nepodarilo zmazať. Skontroluj internet a skús to znova.`)
    }
  }

  return (
    <section className="screen">
      <header className="screen__header">
        <span className="brand">Fit denník</span>
        <h1 className="screen__title">Jedlo</h1>
      </header>

      <DaySwitch day={day} onChange={goToDay} />

      <div className="card card--glow remaining">
        <span className={left < 0 ? 'remaining__label remaining__label--over' : 'remaining__label'}>
          {left < 0 ? 'Nad cieľom o' : 'Zostáva'}
        </span>
        <p className={left < 0 ? 'remaining__kcal remaining__kcal--over' : 'remaining__kcal'}>
          {entries ? Math.abs(left).toLocaleString('sk') : '–'} <span>kcal</span>
        </p>
        <div className="bar">
          <span style={{ width: percent(eaten.kcal, targets.kcal) }} />
        </div>
        <p className="remaining__eaten">
          Zjedené {eaten.kcal.toLocaleString('sk')} z {targets.kcal.toLocaleString('sk')} kcal
        </p>
        <div className="macros">
          <MacroProgress kind="protein" label="Bielkoviny" eaten={eaten.protein} target={targets.proteinG} />
          <MacroProgress kind="carbs" label="Sacharidy" eaten={eaten.carbs} target={targets.carbsG} />
          <MacroProgress kind="fat" label="Tuky" eaten={eaten.fat} target={targets.fatG} />
        </div>
      </div>

      <Link to={day === today() ? '/jedlo/pridat' : `/jedlo/pridat?den=${day}`} className="button button--primary food__add">
        <Plus size={20} aria-hidden="true" />
        Pridať jedlo
      </Link>

      {failed && (
        <div className="food__notice">
          <p>Nepodarilo sa načítať jedlá. Skontroluj internet.</p>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setFailed(false)
              setAttempt((n) => n + 1)
            }}
          >
            Skúsiť znova
          </button>
        </div>
      )}
      {deleteError && (
        <p className="food__notice food__notice--error" role="alert">
          {deleteError}
        </p>
      )}
      {savedNotice && (
        <p className="food__notice" role="status">
          {savedNotice}
        </p>
      )}
      {entries?.length === 0 && <p className="food__empty">Zatiaľ nič. Ťukni na „Pridať jedlo“.</p>}

      {entries &&
        MEALS.map((meal) => {
          const items = entries.filter((entry) => entry.meal === meal.value)
          if (items.length === 0) return null
          return (
            <section key={meal.value} className="meal">
              <h2 className="meal__heading">
                <span>{meal.label}</span>
                <span className="meal__kcal">{sumEntries(items).kcal.toLocaleString('sk')} kcal</span>
                <button
                  type="button"
                  className="meal__save"
                  onClick={() => {
                    setSavedNotice('')
                    setNaming({ meal: meal.value, name: MY_MEAL[meal.value] })
                  }}
                  aria-label={`Uložiť ${meal.label.toLowerCase()} ako jedlo`}
                >
                  <BookmarkPlus size={16} aria-hidden="true" />
                  Uložiť
                </button>
              </h2>
              {naming?.meal === meal.value && (
                <form className="meal__name" onSubmit={saveMeal}>
                  <input
                    className="field"
                    type="text"
                    value={naming.name}
                    onChange={(event) => setNaming({ ...naming, name: event.target.value })}
                    aria-label="Názov uloženého jedla"
                    maxLength={60}
                    autoFocus
                  />
                  <button type="submit" className="plan-day__icon" aria-label="Uložiť jedlo" disabled={!naming.name.trim()}>
                    <Check size={20} aria-hidden="true" />
                  </button>
                  <button type="button" className="entry__cancel" onClick={() => setNaming(null)}>
                    Nie
                  </button>
                </form>
              )}
              <ul className="meal__list">
                {items.map((entry) => (
                  <li key={entry.id} className="entry">
                    {confirmId === entry.id ? (
                      <>
                        <span className="entry__question">Zmazať „{entry.name}“?</span>
                        <button type="button" className="entry__confirm" onClick={() => remove(entry)}>
                          Zmazať
                        </button>
                        <button type="button" className="entry__cancel" onClick={() => setConfirmId(null)}>
                          Nie
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="entry__text">
                          <span className="entry__name">{entry.name}</span>
                          {details(entry) && <span className="entry__macros">{details(entry)}</span>}
                        </div>
                        <span className="entry__kcal">{entry.kcal.toLocaleString('sk')} kcal</span>
                        <button
                          type="button"
                          className="entry__delete"
                          onClick={() => setConfirmId(entry.id)}
                          aria-label={`Zmazať ${entry.name}`}
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
    </section>
  )
}

function MacroProgress(props: { kind: 'protein' | 'carbs' | 'fat'; label: string; eaten: number; target: number }) {
  const { kind, label, eaten, target } = props
  return (
    <div className={`macro-progress macro--${kind}`}>
      <span className="macro-progress__label">{label}</span>
      <span className="macro-progress__value">
        {Math.round(eaten)} / {target} g
      </span>
      <div className="bar bar--thin">
        <span style={{ width: percent(eaten, target) }} />
      </div>
    </div>
  )
}
