import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Info, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { GUIDES } from '../data/exerciseGuides'
import { EXERCISES, GROUP_LABELS, GROUPS, KINDS, searchExercises, type Exercise, type ExerciseKind, type MuscleGroup } from '../data/exercises'
import {
  addCustomExercise,
  DAY_NAMES,
  deletePlan,
  findExercise,
  loadCustomExercises,
  loadPlan,
  newDay,
  savePlan,
  splitName,
  SPLITS,
  type Plan,
  type PlanDay,
} from '../lib/training'
import { ExercisePhoto, HowTo } from './ExerciseGuide'

// „1 cvik“, „3 cviky“, „5 cvikov“
export const exerciseCount = (count: number) =>
  count === 1 ? '1 cvik' : count >= 2 && count <= 4 ? `${count} cviky` : `${count} cvikov`

// Tréningový plán (split) – dni a cviky v nich. Otvára sa z obrazovky Tréning.
export default function TrainingPlan() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState<Plan | null | undefined>(undefined)
  // vždy posledná verzia plánu, aby sa pri rýchlom ťukaní nestratila žiadna zmena
  const planRef = useRef<Plan | null | undefined>(undefined)
  const [custom, setCustom] = useState<Exercise[]>([])
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [saveError, setSaveError] = useState('')
  // deň, do ktorého sa práve pridávajú cviky
  const [pickingDay, setPickingDay] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([loadPlan(), loadCustomExercises()])
      .then(([loadedPlan, loadedCustom]) => {
        if (!active) return
        planRef.current = loadedPlan
        setPlan(loadedPlan)
        setCustom(loadedCustom)
      })
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [attempt])

  const update = async (next: Plan) => {
    planRef.current = next
    setPlan(next)
    try {
      await savePlan(next)
      setSaveError('')
    } catch {
      setSaveError('Zmenu sa nepodarilo uložiť. Skontroluj internet a skús to znova.')
    }
  }

  const changeDay = (dayId: string, change: (day: PlanDay) => PlanDay) => {
    const current = planRef.current
    if (current) update({ ...current, days: current.days.map((day) => (day.id === dayId ? change(day) : day)) })
  }

  const resetPlan = async () => {
    try {
      await deletePlan()
      planRef.current = null
      setPlan(null)
    } catch {
      setSaveError('Plán sa nepodarilo zmeniť. Skontroluj internet a skús to znova.')
    }
  }

  const pickingFor = plan?.days.find((day) => day.id === pickingDay)
  if (plan && pickingFor) {
    return (
      <ExercisePicker
        day={pickingFor}
        custom={custom}
        onToggle={(key) =>
          changeDay(pickingFor.id, (day) => ({
            ...day,
            exercises: day.exercises.includes(key) ? day.exercises.filter((item) => item !== key) : [...day.exercises, key],
          }))
        }
        onCreated={(exercise) => {
          setCustom([...custom, exercise])
          changeDay(pickingFor.id, (day) => ({ ...day, exercises: [...day.exercises, exercise.key] }))
        }}
        onClose={() => setPickingDay(null)}
      />
    )
  }

  return (
    <section className="screen">
      <header className="screen__header add-food__header">
        <button type="button" className="flow__back" onClick={() => navigate('/trening')} aria-label="Späť">
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <h1 className="add-food__title">Tréningový plán</h1>
      </header>

      {failed ? (
        <div className="food__notice">
          <p>Nepodarilo sa načítať tvoj plán. Skontroluj internet.</p>
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
      ) : plan === null ? (
        <SplitPicker
          onPick={(split, days) => update({ split, days: days.map(newDay) })}
        />
      ) : plan ? (
        <PlanEditor
          plan={plan}
          custom={custom}
          onChange={update}
          onPickExercises={setPickingDay}
          onReset={resetPlan}
        />
      ) : null}

      {saveError && (
        <p className="food__notice food__notice--error" role="alert">
          {saveError}
        </p>
      )}
    </section>
  )
}

// Výber splitu pri prvom otvorení – vlastný (poskladaný z dní) alebo hotový.
export function SplitPicker({ onPick }: { onPick: (split: string, days: string[]) => void }) {
  const [building, setBuilding] = useState(false)

  if (building) return <SplitBuilder onCreate={(days) => onPick(splitName(days), days)} onCancel={() => setBuilding(false)} />

  return (
    <div className="plan">
      <p className="flow__lead">Vyber si, ako trénuješ. Cviky do jednotlivých dní si potom pridáš sám.</p>
      <button type="button" className="add-extra" onClick={() => setBuilding(true)}>
        <Plus size={18} aria-hidden="true" />
        Vytvoriť vlastný split
      </button>
      <div className="add-food__group">
        <span className="add-food__label">Alebo vyber hotový</span>
        <div className="choices">
          {SPLITS.map((split) => (
            <button key={split.name} type="button" className="choice" onClick={() => onPick(split.name, split.days)}>
              <span className="choice__label">{split.name}</span>
              <span className="choice__hint">{split.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Vlastný split: dni sa ťukajú v poradí, ako človek trénuje (napr. Push, Pull, Legs, Upper).
function SplitBuilder({ onCreate, onCancel }: { onCreate: (days: string[]) => void; onCancel: () => void }) {
  const [days, setDays] = useState<string[]>([])
  const [custom, setCustom] = useState('')

  const addCustom = (event: FormEvent) => {
    event.preventDefault()
    const name = custom.trim().slice(0, 30)
    if (!name) return
    setDays((current) => [...current, name])
    setCustom('')
  }

  return (
    <div className="plan">
      <p className="flow__lead">Ťukaj dni v poradí, ako trénuješ. Ten istý deň môže byť aj viackrát.</p>

      <div className="add-food__group">
        <span className="add-food__label">Pridať deň</span>
        <div className="chips">
          {DAY_NAMES.map((name) => (
            <button key={name} type="button" className="chip" onClick={() => setDays((current) => [...current, name])}>
              {name}
            </button>
          ))}
        </div>
        <form className="split-builder__custom" onSubmit={addCustom}>
          <input
            className="field"
            type="text"
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            placeholder="alebo napíš vlastný deň"
            aria-label="Vlastný názov dňa"
            maxLength={30}
            autoComplete="off"
          />
          <button type="submit" className="button button--ghost" disabled={!custom.trim()}>
            Pridať
          </button>
        </form>
      </div>

      <div className="add-food__group">
        <span className="add-food__label">Tvoj split</span>
        {days.length === 0 ? (
          <p className="plan-day__empty">Zatiaľ žiadne dni – ťukni napr. na Push.</p>
        ) : (
          <ul className="extras">
            {days.map((name, index) => (
              <li key={index} className="extra extra--single">
                <span className="extra__name">
                  {index + 1}. {name}
                </span>
                <button
                  type="button"
                  className="extra__remove"
                  onClick={() => setDays((current) => current.filter((_, i) => i !== index))}
                  aria-label={`Odobrať ${name}`}
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className="button button--primary" disabled={days.length === 0} onClick={() => onCreate(days)}>
        Vytvoriť split
      </button>
      <button type="button" className="text-button" onClick={onCancel}>
        Späť na hotové splity
      </button>
    </div>
  )
}

function PlanEditor(props: {
  plan: Plan
  custom: Exercise[]
  onChange: (plan: Plan) => void
  onPickExercises: (dayId: string) => void
  onReset: () => void
}) {
  const { plan, custom, onChange } = props
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const saveName = (event: FormEvent) => {
    event.preventDefault()
    if (!renaming) return
    const name = renaming.name.trim().slice(0, 30)
    if (name) onChange({ ...plan, days: plan.days.map((day) => (day.id === renaming.id ? { ...day, name } : day)) })
    setRenaming(null)
  }

  const addDay = () => {
    const day = newDay(`Deň ${plan.days.length + 1}`)
    onChange({ ...plan, days: [...plan.days, day] })
    setRenaming({ id: day.id, name: day.name })
  }

  return (
    <div className="plan">
      <p className="plan__split">
        Tvoj plán: <b>{plan.split}</b>
      </p>

      {plan.days.map((day) => (
        <section key={day.id} className="card plan-day">
          {renaming?.id === day.id ? (
            <form className="plan-day__rename" onSubmit={saveName}>
              <input
                className="field"
                type="text"
                value={renaming.name}
                onChange={(event) => setRenaming({ id: day.id, name: event.target.value })}
                aria-label="Názov dňa"
                maxLength={30}
                autoFocus
              />
              <button type="submit" className="plan-day__icon" aria-label="Uložiť názov">
                <Check size={20} aria-hidden="true" />
              </button>
            </form>
          ) : confirmDelete === day.id ? (
            <div className="plan-day__confirm">
              <span>Zmazať deň „{day.name}“?</span>
              <button
                type="button"
                className="entry__confirm"
                onClick={() => {
                  onChange({ ...plan, days: plan.days.filter((item) => item.id !== day.id) })
                  setConfirmDelete(null)
                }}
              >
                Zmazať
              </button>
              <button type="button" className="entry__cancel" onClick={() => setConfirmDelete(null)}>
                Nie
              </button>
            </div>
          ) : (
            <div className="plan-day__header">
              <h2 className="plan-day__name">{day.name}</h2>
              <button
                type="button"
                className="plan-day__icon"
                onClick={() => setRenaming({ id: day.id, name: day.name })}
                aria-label={`Premenovať ${day.name}`}
              >
                <Pencil size={18} aria-hidden="true" />
              </button>
              {plan.days.length > 1 && (
                <button
                  type="button"
                  className="plan-day__icon"
                  onClick={() => setConfirmDelete(day.id)}
                  aria-label={`Zmazať ${day.name}`}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {day.exercises.length === 0 ? (
            <p className="plan-day__empty">Zatiaľ žiadne cviky.</p>
          ) : (
            <ul className="plan-day__list">
              {day.exercises.map((key) => {
                const exercise = findExercise(key, custom)
                return (
                  <li key={key} className="plan-exercise">
                    <span className="plan-exercise__text">
                      <span className="plan-exercise__name">{exercise?.name ?? 'Zmazaný cvik'}</span>
                      {exercise && <span className="plan-exercise__group">{GROUP_LABELS[exercise.group]}</span>}
                    </span>
                    <button
                      type="button"
                      className="extra__remove"
                      onClick={() =>
                        onChange({
                          ...plan,
                          days: plan.days.map((item) =>
                            item.id === day.id ? { ...item, exercises: item.exercises.filter((other) => other !== key) } : item,
                          ),
                        })
                      }
                      aria-label={`Odobrať ${exercise?.name ?? 'cvik'}`}
                    >
                      <X size={18} aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <button type="button" className="add-extra" onClick={() => props.onPickExercises(day.id)}>
            <Plus size={18} aria-hidden="true" />
            Pridať cviky
          </button>
        </section>
      ))}

      <button type="button" className="button button--ghost" onClick={addDay}>
        <Plus size={18} aria-hidden="true" />
        Pridať deň
      </button>

      {confirmReset ? (
        <div className="plan-day__confirm">
          <span>Zmeniť split? Tvoje dni a cviky sa vymažú.</span>
          <button type="button" className="entry__confirm" onClick={props.onReset}>
            Zmeniť
          </button>
          <button type="button" className="entry__cancel" onClick={() => setConfirmReset(false)}>
            Nie
          </button>
        </div>
      ) : (
        <button type="button" className="text-button" onClick={() => setConfirmReset(true)}>
          Zmeniť split
        </button>
      )}
    </div>
  )
}

// Pridávanie cvikov do dňa: ťuknutím pridať (✓) alebo odobrať, prípadne vytvoriť vlastný cvik.
function ExercisePicker(props: {
  day: PlanDay
  custom: Exercise[]
  onToggle: (key: string) => void
  onCreated: (exercise: Exercise) => void
  onClose: () => void
}) {
  const { day, custom } = props
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  // cvik, pri ktorom je rozbalená fotka a návod
  const [showing, setShowing] = useState<string | null>(null)
  const { items: found, exact } = searchExercises([...EXERCISES, ...custom], query)

  return (
    <section className="screen">
      <header className="screen__header add-food__header">
        <button type="button" className="flow__back" onClick={props.onClose} aria-label="Späť">
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <div className="add-food__heading">
          <h1 className="add-food__title">Pridať cviky</h1>
          <span className="add-food__day">do dňa {day.name}</span>
        </div>
      </header>

      <div className="add-food">
        {creating ? (
          <CustomExerciseForm
            initialName={query}
            onCancel={() => setCreating(false)}
            onCreated={(exercise) => {
              props.onCreated(exercise)
              setCreating(false)
              setQuery('')
            }}
          />
        ) : (
          <>
            <label className="search">
              <Search className="search__icon" size={20} aria-hidden="true" />
              <input
                className="field search__input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Hľadaj, napr. bench, drep, zhyby"
                aria-label="Hľadať cvik"
                autoComplete="off"
              />
            </label>

            {/* navrchu, aby sa nemuselo prechádzať celým zoznamom */}
            <button type="button" className="add-extra" onClick={() => setCreating(true)}>
              <Plus size={18} aria-hidden="true" />
              Pridať vlastný cvik
            </button>
            {!exact && (
              <p className="search__hint">
                {found.length === 0
                  ? 'Taký cvik v zozname nie je – pridaj si ho ako vlastný.'
                  : 'Presne taký cvik v zozname nie je. Podobné sú nižšie, alebo si ho pridaj ako vlastný.'}
              </p>
            )}

            {GROUPS.map((group) => {
              const items = found.filter((exercise) => exercise.group === group.value)
              if (items.length === 0) return null
              return (
                <div key={group.value} className="add-food__group">
                  <span className="add-food__label">{group.label}</span>
                  <ul className="results">
                    {items.map((exercise) => {
                      const added = day.exercises.includes(exercise.key)
                      return (
                        <li key={exercise.key} className="result-row">
                          <button
                            type="button"
                            className={added ? 'result result--added' : 'result'}
                            onClick={() => props.onToggle(exercise.key)}
                            aria-pressed={added}
                          >
                            <span className="result__text">
                              <span className="result__name">{exercise.name}</span>
                              <span className="result__info">
                                {KINDS.find((kind) => kind.value === exercise.kind)?.label}
                                {exercise.key.startsWith('custom:') && ' · vlastný'}
                              </span>
                            </span>
                            {added ? (
                              <Check className="result__check" size={22} aria-hidden="true" />
                            ) : (
                              <Plus size={20} aria-hidden="true" />
                            )}
                          </button>
                          {GUIDES[exercise.key] && (
                            <button
                              type="button"
                              className={showing === exercise.key ? 'result-row__info result-row__info--open' : 'result-row__info'}
                              onClick={() => setShowing(showing === exercise.key ? null : exercise.key)}
                              aria-expanded={showing === exercise.key}
                              aria-label={`Ako sa robí ${exercise.name}`}
                            >
                              <Info size={20} aria-hidden="true" />
                            </button>
                          )}
                          {showing === exercise.key && (
                            <div className="result-row__guide">
                              <ExercisePhoto exerciseKey={exercise.key} name={exercise.name} large />
                              <HowTo exerciseKey={exercise.key} />
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
            <div className="plan__done">
              <button type="button" className="button button--primary" onClick={props.onClose}>
                Hotovo ({exerciseCount(day.exercises.length)})
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function CustomExerciseForm(props: { initialName: string; onCancel: () => void; onCreated: (exercise: Exercise) => void }) {
  const [name, setName] = useState(props.initialName)
  const [group, setGroup] = useState<MuscleGroup>('chest')
  const [kind, setKind] = useState<ExerciseKind>('weight')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return setError('Napíš názov cviku.')
    setBusy(true)
    setError('')
    try {
      const clean = name.trim().slice(0, 60)
      // „tlaky na smith“ → „Tlaky na smith“
      props.onCreated(await addCustomExercise(clean.charAt(0).toUpperCase() + clean.slice(1), group, kind))
    } catch {
      setBusy(false)
      setError('Nepodarilo sa uložiť. Skontroluj internet a skús to znova.')
    }
  }

  return (
    <form className="add-food" onSubmit={submit}>
      <label className="add-food__group">
        <span className="add-food__label">Názov cviku</span>
        <input
          className="field"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="napr. Incline Hammer Press"
          maxLength={60}
          autoComplete="off"
        />
      </label>

      <div className="add-food__group">
        <span className="add-food__label">Partia</span>
        <div className="chips">
          {GROUPS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === group ? 'chip chip--selected' : 'chip'}
              onClick={() => setGroup(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="add-food__group">
        <span className="add-food__label">Ako sa meria</span>
        <div className="chips">
          {KINDS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === kind ? 'chip chip--selected' : 'chip'}
              onClick={() => setKind(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="flow__message flow__message--error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="button button--primary" disabled={busy}>
        {busy ? 'Ukladám…' : 'Pridať cvik'}
      </button>
      <button type="button" className="text-button" onClick={props.onCancel}>
        Späť na zoznam cvikov
      </button>
    </form>
  )
}
