import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { GROUP_LABELS, type ExerciseKind } from '../data/exercises'
import { dayLabel, today } from '../lib/food'
import {
  deleteWorkout,
  formatNumber,
  lastSets,
  loadRecent,
  loadWorkout,
  saveExercises,
  setLabel,
  type Workout,
  type WorkoutExercise,
  type WorkoutSet,
} from '../lib/workouts'

// Políčka sa píšu ako text („22,5“), číslo sa z nich spraví až pri ukladaní.
type DraftSet = { kg: string; reps: string; seconds: string; done: boolean }
type DraftExercise = Omit<WorkoutExercise, 'sets'> & { sets: DraftSet[] }

const toText = (value: number | null) => (value === null ? '' : formatNumber(value).replace(/\s/g, ''))

function toNumber(text: string, max: number): number | null {
  const value = Number.parseFloat(text.replace(',', '.'))
  return Number.isFinite(value) && value >= 0 ? Math.min(value, max) : null
}

const toDraft = (exercise: WorkoutExercise): DraftExercise => ({
  ...exercise,
  sets: exercise.sets.map((set) => ({
    kg: toText(set.kg),
    reps: toText(set.reps),
    seconds: toText(set.seconds),
    done: set.done,
  })),
})

const toStored = (exercise: DraftExercise): WorkoutExercise => ({
  ...exercise,
  sets: exercise.sets.map(
    (set): WorkoutSet => ({
      kg: toNumber(set.kg, 1000),
      reps: toNumber(set.reps, 1000),
      seconds: toNumber(set.seconds, 36000),
      done: set.done,
    }),
  ),
})

// séria sa dá odškrtnúť, keď má vyplnené, čo treba: činka kg aj opakovania, vlastná váha opakovania, na čas sekundy
function complete(kind: ExerciseKind, set: DraftSet) {
  if (kind === 'time') return Number(toNumber(set.seconds, 36000)) > 0
  if (kind === 'bodyweight') return Number(toNumber(set.reps, 1000)) > 0
  return toNumber(set.kg, 1000) !== null && Number(toNumber(set.reps, 1000)) > 0
}

// Zápis tréningu: série kg × opakovania predvyplnené z minula, odcvičenú sériu odškrtneš ✓.
// Ukladá sa priebežne, takže sa nič nestratí, ani keď sa appka zavrie.
export default function WorkoutLog() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState<Workout | null>()
  const [recent, setRecent] = useState<Workout[]>([])
  const [exercises, setExercises] = useState<DraftExercise[]>([])
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [saveError, setSaveError] = useState('')
  const [leaving, setLeaving] = useState(false)

  // vždy posledná verzia sérií (aj pri rýchlom ťukaní) a či ju treba uložiť
  const latest = useRef<DraftExercise[]>([])
  const dirty = useRef(false)
  const timer = useRef<number | undefined>(undefined)
  // ukladania idú za sebou, aby staršie neprepísalo novšie
  const queue = useRef(Promise.resolve(true))

  useEffect(() => {
    let active = true
    loadWorkout(id)
      .then(async (loaded) => {
        const before = loaded ? await loadRecent(loaded.day) : []
        if (!active) return
        latest.current = loaded ? loaded.exercises.map(toDraft) : []
        setExercises(latest.current)
        setRecent(before)
        setWorkout(loaded)
      })
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [id, attempt])

  const flush = () => {
    window.clearTimeout(timer.current)
    queue.current = queue.current.then(async () => {
      if (!dirty.current) return true
      dirty.current = false
      try {
        await saveExercises(id, latest.current.map(toStored))
        setSaveError('')
        return true
      } catch {
        dirty.current = true
        setSaveError('Série sa nepodarilo uložiť. Skontroluj internet – appka to skúsi znova.')
        return false
      }
    })
    return queue.current
  }

  // uložiť aj pri odchode z appky (prepnutie na inú appku, zamknutie telefónu) a pri odchode z obrazovky
  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && void flush()
    document.addEventListener('visibilitychange', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      void flush()
    }
    // flush číta len refy, stačí ho zaregistrovať raz
  }, [])

  const update = (index: number, change: (exercise: DraftExercise) => DraftExercise) => {
    latest.current = latest.current.map((exercise, i) => (i === index ? change(exercise) : exercise))
    setExercises(latest.current)
    dirty.current = true
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void flush(), 600)
  }

  const finish = async () => {
    if (!workout) return navigate('/trening')
    setLeaving(true)
    if (!(await flush())) return setLeaving(false)
    // tréning bez jedinej odcvičenej série sa neuloží
    if (!latest.current.some((exercise) => exercise.sets.some((set) => set.done))) {
      try {
        await deleteWorkout(workout.id)
      } catch {
        // ostane ako nedokončený, dá sa zmazať na obrazovke Tréning
      }
    }
    navigate(workout.day === today() ? '/trening' : `/trening?den=${workout.day}`)
  }

  return (
    <section className="screen">
      <header className="screen__header add-food__header">
        <button type="button" className="flow__back" onClick={finish} disabled={leaving} aria-label="Späť">
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <div className="add-food__heading">
          <h1 className="add-food__title">{workout?.name ?? 'Tréning'}</h1>
          {workout && <span className="add-food__day">{dayLabel(workout.day)}</span>}
        </div>
      </header>

      {failed ? (
        <div className="food__notice">
          <p>Nepodarilo sa načítať tréning. Skontroluj internet.</p>
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
      ) : workout === null ? (
        <p className="food__notice">Tento tréning už neexistuje.</p>
      ) : workout ? (
        <div className="plan">
          {exercises.map((exercise, index) => (
            <ExerciseSets
              key={exercise.key}
              exercise={exercise}
              last={lastSets(recent, exercise.key, workout.id)}
              onChange={(change) => update(index, change)}
            />
          ))}

          {saveError && (
            <p className="food__notice food__notice--error" role="alert">
              {saveError}
            </p>
          )}

          <div className="plan__done">
            <button type="button" className="button button--primary" onClick={finish} disabled={leaving}>
              Ukončiť tréning
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

const HEADINGS: Record<ExerciseKind, string[]> = {
  weight: ['kg', 'opakovania'],
  bodyweight: ['navyše kg', 'opakovania'],
  time: ['sekundy'],
}

function ExerciseSets(props: {
  exercise: DraftExercise
  last: { day: string; sets: WorkoutSet[] } | null
  onChange: (change: (exercise: DraftExercise) => DraftExercise) => void
}) {
  const { exercise, last, onChange } = props
  const { kind } = exercise

  const changeSet = (index: number, change: Partial<DraftSet>) =>
    onChange((current) => ({
      ...current,
      sets: current.sets.map((set, i) => {
        if (i !== index) return set
        const next = { ...set, ...change }
        // vymazané číslo zruší ✓
        return next.done && !complete(kind, next) ? { ...next, done: false } : next
      }),
    }))

  // čísla s desatinnou čiarkou (22,5 kg), opakovania a sekundy celé
  const decimal = (text: string) => text.replace('.', ',').replace(/[^\d,]/g, '').replace(/,(?=.*,)/g, '').slice(0, 6)
  const whole = (text: string) => text.replace(/\D/g, '').slice(0, 5)

  return (
    <section className="card plan-day">
      <div className="workout-exercise__title">
        <h2 className="plan-day__name">{exercise.name}</h2>
        <span className="plan-exercise__group">{GROUP_LABELS[exercise.group]}</span>
      </div>
      {last && (
        <p className="workout-exercise__last">
          Minule ({dayLabel(last.day)}): {last.sets.map((set) => setLabel(kind, set)).join(' · ')}
        </p>
      )}

      <div className={kind === 'time' ? 'sets sets--time' : 'sets'}>
        <div className="set set--head" aria-hidden="true">
          <span>Séria</span>
          {HEADINGS[kind].map((heading) => (
            <span key={heading}>{heading}</span>
          ))}
          <span />
        </div>

        {exercise.sets.map((set, index) => (
          <div key={index} className={set.done ? 'set set--done' : 'set'}>
            <span className="set__number">{index + 1}</span>
            {kind !== 'time' && (
              <input
                className="set__input"
                inputMode="decimal"
                value={set.kg}
                placeholder="–"
                onChange={(event) => changeSet(index, { kg: decimal(event.target.value) })}
                aria-label={`${index + 1}. séria – kg`}
              />
            )}
            <input
              className="set__input"
              inputMode="numeric"
              value={kind === 'time' ? set.seconds : set.reps}
              placeholder="–"
              onChange={(event) =>
                changeSet(index, kind === 'time' ? { seconds: whole(event.target.value) } : { reps: whole(event.target.value) })
              }
              aria-label={`${index + 1}. séria – ${kind === 'time' ? 'sekundy' : 'opakovania'}`}
            />
            <button
              type="button"
              className="set__check"
              onClick={() => changeSet(index, { done: !set.done })}
              disabled={!set.done && !complete(kind, set)}
              aria-pressed={set.done}
              aria-label={`${index + 1}. séria odcvičená`}
            >
              <Check size={22} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <div className="workout-exercise__actions">
        <button
          type="button"
          className="text-button"
          onClick={() =>
            onChange((current) => {
              // nová séria s hodnotami predošlej – stačí ju odškrtnúť
              const previous = current.sets.at(-1)
              const added = previous ? { ...previous, done: false } : { kg: '', reps: '', seconds: '', done: false }
              return { ...current, sets: [...current.sets, added] }
            })
          }
        >
          + Pridať sériu
        </button>
        {exercise.sets.length > 1 && (
          <button
            type="button"
            className="text-button text-button--muted"
            onClick={() => onChange((current) => ({ ...current, sets: current.sets.slice(0, -1) }))}
          >
            Odobrať sériu
          </button>
        )}
      </div>
    </section>
  )
}
